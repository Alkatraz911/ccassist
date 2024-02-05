import { CoinAlertVolumes } from './src/models/CoinAlertVolumes.js';
import "reflect-metadata";
import { DataSource } from "typeorm";
import { SpotTradingTickets } from "./src/models/SpotTradingTickets.js";

import { trackVolumes } from "./src/binanceVolumeTracker/binanceVolumeTracker.js";


import { bot } from "./src/bot/bot.js";
import { binanceSpotActiveTicketsLoader } from './src/binanceSpotActiveTicketsLoader/binanceSpotActiveTicketsLoader.js'
import { trackCoinAlertVolumes } from './dailyVolumesTrack.js'
import { TelegramError } from 'telegraf';


const PRICE_CHANGE_PERCENT = 2
const VOLUME_CHANGE_PERCENT = 200



export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 4001,
    username: "postgres",
    password: "admin",
    database: "ccassist",
    entities: [SpotTradingTickets, CoinAlertVolumes],
    synchronize: true,
    logging: false,
});



const boot = () => {
    AppDataSource.initialize().then(async () => {

        // bot.launch();
        // deepCorrectionAtUptrendFinder(coins, '1h', '12h', 14, 30, 50)
        // setInterval(()=>{deepCorrectionAtUptrendFinder(coins, '1h', '12h', 14, 30, 50)}, 300000)
    
        const trackBinanceVolumes = async () => {
            let coins = await AppDataSource.manager.find(SpotTradingTickets);
            let chatId = 405531728;
    
            if (coins.length === 0) {
                binanceSpotActiveTicketsLoader(AppDataSource)
                coins = await AppDataSource.manager.find(SpotTradingTickets);
            }
            let message = '';
            for (const el of coins) {
                let result = await trackVolumes(el.symbol, "1m", 3)
                let { volumes, ticket, timeframe } = result
                for (const el of volumes) {
                    let { volume, percentOfPreviousCandle, priceChange, priceChangePercent, dateTime } = el;
                    if (Number(priceChangePercent.slice(0, priceChangePercent.length - 1)) >= PRICE_CHANGE_PERCENT
                        ||
                        Number(percentOfPreviousCandle.slice(0, percentOfPreviousCandle.length - 1)) >= VOLUME_CHANGE_PERCENT) {
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
            if (message) {
                try{
                    bot.telegram.sendMessage(chatId, message)
                } catch(e) {
                    if(e instanceof TelegramError) {
                        if(e.response.description === 'Bad Request: message is too long') {
                            let messagesArray = message.split(`
                            
                            `)
                            let firstHalfMessagesArray = messagesArray.splice(0,messagesArray.length/2)
                            let firstMessage = firstHalfMessagesArray.join(`
                            
                            `)
                            let secondMessage = messagesArray.join(`
                            
                            `)
                            bot.telegram.sendMessage(chatId, firstMessage)
                            bot.telegram.sendMessage(chatId, secondMessage)
                        }
                    }
    
                }
                
            } else {
                bot.telegram.sendMessage(chatId, 'Not found')
            }
        }
    
        const bootstrapTrackBinanceVolumes = () => {
    
            trackBinanceVolumes();
            setInterval(() => {
                trackBinanceVolumes()
            }, 60000)
        }
        bootstrapTrackBinanceVolumes()
        // trackCoinAlertVolumes()

        process.on("uncaughtException", () =>{
            bootstrapTrackBinanceVolumes()
        })
        
        process.on("unhandledRejection", () =>{
            bootstrapTrackBinanceVolumes()
        })
    
    });


}

boot()



