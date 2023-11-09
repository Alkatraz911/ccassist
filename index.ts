import "reflect-metadata";
import { DataSource } from "typeorm";
import { SpotTradingTickets } from "./src/models/SpotTradingTickets.js";
import * as Technicalindicators from "technicalindicators";
import { BinanceKlinesLoaderReturn } from "./src/binanceKlinesLoader/binanceKlinesLoader.js";
import { binanceKlinesLoader } from "./src/binanceKlinesLoader/binanceKlinesLoader.js";
import { Big, RSI } from "trading-signals";
import { bot } from "./src/bot/bot.js";


const PRICE_CHANGE_PERCENT = 2
const VOLUME_CHANGE_PERCENT = 200

type volumesMapReturn = {
    volume:string;
    percentOfPreviousCandle:string;
    priceChange: string;
    priceChangePercent: string;
    dateTime: string
}

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 4001,
    username: "postgres",
    password: "admin",
    database: "ccassist",
    entities: [SpotTradingTickets],
    synchronize: true,
    logging: false,
});

function calculatRSI(closingPrices: any) {
    // Calculate the average of the upward price changes
    let avgUpwardChange = 0;
    for (let i = 1; i < closingPrices.length; i++) {
        avgUpwardChange += Math.max(0, closingPrices[i] - closingPrices[i - 1]);
    }
    avgUpwardChange /= closingPrices.length;

    // Calculate the average of the downward price changes
    let avgDownwardChange = 0;
    for (let i = 1; i < closingPrices.length; i++) {
        avgDownwardChange += Math.max(0, closingPrices[i - 1] - closingPrices[i]);
    }
    avgDownwardChange /= closingPrices.length;

    // Calculate the RSI
    const rsi = 100 - 100 / (1 + avgUpwardChange / avgDownwardChange);

    return rsi;
}

AppDataSource.initialize().then(async () => {
    let coins = await AppDataSource.manager.find(SpotTradingTickets);

    const RSIcounter = async (
        coins: SpotTradingTickets[],
        firstTimefrfame: string,
        secondTimeframe: string,
        rsiLength: number
    ) => {
        type TicketWithRSI = {
            ticker: string;
            hourRsi: number;
            halfdayRsi: number;
        };

        let result: TicketWithRSI[] = [];

        let rsi = Technicalindicators.RSI;
        if (coins) {
            for (const el of coins) {
                let hoursArray = await binanceKlinesLoader(
                    el.symbol,
                    firstTimefrfame,
                    rsiLength + 1
                );
                // let hourRsi = Math.round((calculatRSI(hoursArray.map(el => Number(el.closePrice))) + Number.EPSILON) * 100) / 100
                let [hourRsi] = rsi.calculate({
                    period: rsiLength,
                    values: hoursArray.map((el) => Number(el.closePrice)),
                });

                let halfdayArray = await binanceKlinesLoader(
                    el.symbol,
                    secondTimeframe,
                    rsiLength + 1
                );
                let halfdayRsi =
                    Math.round(
                        (calculatRSI(halfdayArray.map((el) => Number(el.closePrice))) +
                            Number.EPSILON) *
                        100
                    ) / 100;
                if (hourRsi && halfdayRsi) {
                    console.log({ ticker: el.symbol, hourRsi, halfdayRsi });
                    result.push({ ticker: el.symbol, hourRsi, halfdayRsi });
                }
            }
            return result;
        }
    };

    bot.launch();

    const deepCorrectionAtUptrendFinder = (
        coins: SpotTradingTickets[],
        firstTimefrfame: string,
        secondTimeframe: string,
        rsiLength: number,
        rsiValueshouldbelower: number,
        rsiValueshouldbehigher: number
    ) => {
        RSIcounter(coins, firstTimefrfame, secondTimeframe, rsiLength).then(
            (data) => {
                if (data) {
                    let message = "📉Deep correction detected\n";
                    for (const el of data) {
                        if (
                            el.hourRsi < rsiValueshouldbelower &&
                            rsiValueshouldbehigher > 49
                        ) {
                            message += `Ticker: ${el.ticker} RSI1H: ${el.hourRsi} RSI12H: ${el.halfdayRsi}\n`;
                        }
                    }
                    // bot.telegram.sendMessage(405531728, message)
                }
            }
        );
    };

    const trackVolumes = async (
        ticket: string,
        timeframe: string,
        candlesNumber: number
    ) => {
        let candles = await binanceKlinesLoader(ticket, timeframe, candlesNumber);
        let baseCandleVolume = 0;
        let baseCandlePrice = 0
        let averageVolume = 0;
        let volumes = candles.map((el: BinanceKlinesLoaderReturn, i) => {
            let volume:string = '';
            let percentOfPreviousCandle:string = '';
            let priceChange: string = '';
            let priceChangePercent: string = '';
            let dateTime: string = '';

            if (el.quoteAssetVolume) {
                if (i === 0) {
                    let [volumeValue] = el.quoteAssetVolume.split(".", 1);
                    if (volumeValue) {
                        
                            volume = volumeValue;
                            percentOfPreviousCandle = "base candle";
                            priceChange = "base candle";
                            priceChangePercent = "base candle";
                            dateTime =
                                new Date(el.klineClose).toLocaleDateString() +
                                " " +
                                new Date(el.klineClose).toLocaleTimeString();
                        }
                        baseCandleVolume = Number(volumeValue);
                        averageVolume = Number(volumeValue);
                        baseCandlePrice = Number(el.closePrice)
                    } else {
                    let [volumeValue] = el.quoteAssetVolume.split(".", 1);
                    let percent = (Number(volumeValue) / baseCandleVolume) * 100;

                    if (volumeValue) {
                        
                            volume = volumeValue;
                            percentOfPreviousCandle = `${percent.toFixed()}%`;
                            priceChange  = (Number(el.closePrice) - baseCandlePrice).toFixed(2);
                            priceChangePercent = `${((Number(el.closePrice) - baseCandlePrice) / baseCandlePrice * 100).toFixed()}%`,
                            dateTime =
                                new Date(el.klineClose).toLocaleDateString() +
                                " " +
                                new Date(el.klineClose).toLocaleTimeString();
                        
                        baseCandleVolume = Number(volume);
                        averageVolume = (averageVolume + Number(volume)) / (i + 1);
                        baseCandlePrice = Number(el.closePrice)
                    }
                }
            } else {
                
                    volume = '0';
                    percentOfPreviousCandle ='0';
                    priceChange = "0";
                    priceChangePercent = "0";
                    dateTime =
                        new Date(el.klineClose).toLocaleDateString() +
                        " " +
                        new Date(el.klineClose).toLocaleTimeString();
            }
        
            return {volume, percentOfPreviousCandle, priceChange, priceChangePercent, dateTime};
           
        });
        return { ticket, timeframe, volumes };
    };

    // deepCorrectionAtUptrendFinder(coins, '1h', '12h', 14, 30, 50)
    // setInterval(()=>{deepCorrectionAtUptrendFinder(coins, '1h', '12h', 14, 30, 50)}, 300000)

    const start =  async (coins: SpotTradingTickets[]) => {
        let message = '';
        for (const el of coins) {
            let result = await trackVolumes(el.symbol, "5m", 3)
            let {volumes, ticket, timeframe} = result
            for (const el of volumes) {
                let {volume, percentOfPreviousCandle,  priceChange, priceChangePercent, dateTime} = el;
                if (Number(priceChangePercent.slice(0,priceChangePercent.length-1)) >= PRICE_CHANGE_PERCENT 
                && 
                Number(percentOfPreviousCandle.slice(0,percentOfPreviousCandle.length-1)) >= VOLUME_CHANGE_PERCENT) {
                    message += `PUMP
                    ticket: ${ticket},
                    volume: ${volume}, 
                    volume%: ${percentOfPreviousCandle}, 
                    price change: ${priceChange}, 
                    prciceChange%: ${priceChangePercent},
                    dateTime: ${dateTime}

                    `
                }
            }


        }
        if(message) {
            bot.telegram.sendMessage(405531728,message)
        } else {
            console.log('Nothing found')
        } 
    }

    setInterval(() => {
    start(coins)
    }, 300000)



});
