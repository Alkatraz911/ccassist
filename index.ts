
import "reflect-metadata"
import { DataSource } from "typeorm";
import { SpotTradingTickets } from "./src/models/SpotTradingTickets.js";
import * as Technicalindicators from 'technicalindicators'
import { binanceSpotActiveTicketsLoader } from "./src/binanceSpotActiveTicketsLoader/binanceSpotActiveTicketsLoader.js";
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


type RSIdata = {
    period: number;
    values: Array<number>;
}

type TicketWithRSI = {
    ticker: string;
    hourRsi: number ;
    halfdayRsi: number;
}


const calculateRSI = ({ period, values }: RSIdata) : number | null => {
    if(values && period) {
        let gainDays = 0;
        let lossDays = 0;
        let loss = 0;
        let gain = 0;
        let RSI = 0;
        if (values.length < period) {
            return null
        } else {
            if (values.length > 0) {

                
                for (const el of values) {
                    let nextEl = values[values.indexOf(el) + 1]
                    if (nextEl) {
                        if (el < nextEl) {
                            gain += nextEl
                            gainDays += 1
                        } else {
                            loss += nextEl
                            lossDays += 1
                        }
                    } else {
                        let gainDaysEMA = gain / gainDays
                        let lossDaysEMA = loss / lossDays
                        let RS = gainDaysEMA / lossDaysEMA
                        RSI = 100 - 100 / (1 + RS)
                    }
                }
                return RSI
            }
        }
        return RSI
    } else {
        return null
    }
}



AppDataSource.initialize()
    .then(() => {


        const deepCorrectionAtUptrendFinder = async () => {
            let result: TicketWithRSI[] = []
            let rsi = Technicalindicators.RSI
            let coins = await AppDataSource.manager.find(SpotTradingTickets)
            let halfdayrsi = new RSI(14)
            let hourrsi = new RSI(14)
            if (coins) {
                for (const el of coins) {
                    
                    let hoursArray = await binanceKlinesLoader(el.symbol, "1h", 15)
                    
                    for (const element of hoursArray) {
                        hourrsi.update(Number(element.closePrice))
                    }
                    let hourRsi = Number(hourrsi.getResult().toFixed(2))
                
                    // let myHourRSI = calculateRSI({ period: 14, values: <Array<number>>hoursArray.map(el => Number(el.closePrice)) })

                    let halfdayArray = await binanceKlinesLoader(el.symbol, "12h", 15)
                    
                    for (const element of halfdayArray) {
                        halfdayrsi.update(Number(element.closePrice))
                    }
                    let halfdayRsi = Number(halfdayrsi.getResult().toFixed(2))
                    if (hourRsi && halfdayRsi)
                    console.log({ ticker: el.symbol, hourRsi, halfdayRsi })
                        result.push({ ticker: el.symbol, hourRsi, halfdayRsi })
                }
                return result
            }
        }

        const token = '6017219652:AAHttibf83BofBNNBgplV6Xs2QUUKX7x0Ik'
        const bot = new Telegraf(token);


        setInterval(() => {
            deepCorrectionAtUptrendFinder().then(data => {
                if (data) {
                    let message = ''
                    for (const el of data) {
                        if (el.hourRsi < 30 && el.halfdayRsi > 49) {
                            message += `Ticker: ${el.ticker} RSI1H: ${el.hourRsi} RSI12H: ${el.halfdayRsi}\n`
                        }
                    }
                    if(message) 

                    bot.telegram.sendMessage(405531728, message)
                }
            })
        }, 60000)


    })





