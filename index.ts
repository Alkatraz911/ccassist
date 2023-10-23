
import "reflect-metadata"
import { DataSource } from "typeorm";
import { SpotTradingTickets } from "./src/models/SpotTradingTickets.js";
import * as Technicalindicators from 'technicalindicators'
import { BinanceKlinesLoaderReturn } from "./src/binanceKlinesLoader/binanceKlinesLoader.js";
import { binanceKlinesLoader } from "./src/binanceKlinesLoader/binanceKlinesLoader.js";
import { Telegraf } from "telegraf";
import { Big, RSI } from 'trading-signals'


const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 4001,
    username: "postgres",
    password: "admin",
    database: "ccassist",
    entities: [SpotTradingTickets],
    synchronize: true,
    logging: false,
});




type TicketWithRSI = {
    ticker: string;
    hourRsi: number;
    halfdayRsi: number;
    volumes: string[][];
}




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
    const rsi = 100 - (100 / (1 + (avgUpwardChange / avgDownwardChange)));

    return rsi;
}



AppDataSource.initialize()
    .then(async () => {
        let coins = await AppDataSource.manager.find(SpotTradingTickets)

        const deepCorrectionAtUptrendFinder = async () => {
            let result: TicketWithRSI[] = []

            let rsi = Technicalindicators.RSI
            if (coins) {
                for (const el of coins) {

                    let hoursArray = await binanceKlinesLoader(el.symbol, "1h", 15)
                    // let hourRsi = Math.round((calculatRSI(hoursArray.map(el => Number(el.closePrice))) + Number.EPSILON) * 100) / 100 
                    let [hourRsi] = rsi.calculate({ period: 14, values: hoursArray.map(el => Number(el.closePrice)) })
                    let volumes = hoursArray.map((el: BinanceKlinesLoaderReturn, i) => {
                        
                        let result: string[] = [];
                        let baseCandeleVolume = 0;
                        if (el.quoteAssetVolume) {
                            if (i === 0) {
                                let [volume] = el.quoteAssetVolume.split('.', 1)
                                if (volume) {
                                    result = [volume, 'base candle']
                                    baseCandeleVolume = Number(volume)
                                }
                            } else {
                                console.log(i)
                                let [volume] = el.quoteAssetVolume.split('.', 1)
                                let percent = Number(volume)/baseCandeleVolume * 100
                                if (volume) {
                                    result = [volume, `${percent}%`]
                                    baseCandeleVolume = Number(volume)
                                }
                            }
                        } else {
                            result = ['0', '0']
                        }

                        return result
                    })
                    let halfdayArray = await binanceKlinesLoader(el.symbol, "12h", 15)
                    let halfdayRsi = Math.round((calculatRSI(halfdayArray.map(el => Number(el.closePrice))) + Number.EPSILON) * 100) / 100
                    if (hourRsi && halfdayRsi && volumes) {
                        console.log({ ticker: el.symbol, hourRsi, halfdayRsi, volumes })
                        result.push({ ticker: el.symbol, hourRsi, halfdayRsi, volumes })
                    }
                }
                return result
            }
        }

        const token = '6017219652:AAHttibf83BofBNNBgplV6Xs2QUUKX7x0Ik'
        const bot = new Telegraf(token);

        // bot.command('start', async (ctx) => {
        //     await ctx.reply(
        //       `Please enter coin ticker you want to track. Example: If you want to track Bitcoin enter BTC`
        //     );
        //   })


        setTimeout(() => {
            deepCorrectionAtUptrendFinder().then(data => {
                if (data) {
                    let message = '📉Deep correction detected\n'
                    for (const el of data) {
                        if (el.hourRsi < 30 && el.halfdayRsi > 49) {
                            message += `Ticker: ${el.ticker} RSI1H: ${el.hourRsi} RSI12H: ${el.halfdayRsi}\n`
                        }
                    }
                    if (message)
                        // console.log(message)
                        bot.telegram.sendMessage(405531728, message)
                }
            })
        }, 30000)

    })





