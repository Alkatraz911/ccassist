
import "reflect-metadata"
import { DataSource } from "typeorm";
import { SpotTradingTickets } from "./src/models/SpotTradingTickets.js";
import * as Technicalindicators from 'technicalindicators'
import { binanceSpotActiveTicketsLoader } from "./src/binanceSpotActiveTicketsLoader/binanceSpotActiveTicketsLoader.js";
import { binanceKlinesLoader } from "./src/binanceKlinesLoader/binanceKlinesLoader.js";
import { Telegraf } from "telegraf";

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




AppDataSource.initialize()
.then(() => {
    interface TicketWithRSI {
        ticker: string;
        hourRsi: number;
        halfdayRsi: number;
    }

    const deepCorrectionAtUptrendFinder = async () => {
        let result: TicketWithRSI[] = [] 
        let rsi = Technicalindicators.RSI
        let coins = await binanceSpotActiveTicketsLoader()
        if (coins) {
            for (const el of coins) {
                    let minutesArray = await binanceKlinesLoader(el.symbol, "1h", 15)
                    let [hourRsi] = rsi.calculate({period: 14, values: minutesArray.map(el => Number(el.closePrice))})
                    let halfdayArray = await binanceKlinesLoader(el.symbol, "12h", 15)
                    let [halfdayRsi] = rsi.calculate({period: 14, values: halfdayArray.map(el => Number(el.closePrice))})
                    if(hourRsi && halfdayRsi)
                    result.push({ticker: el.symbol, hourRsi, halfdayRsi})
            }
            return result
        }
    }

    const token = '6017219652:AAHttibf83BofBNNBgplV6Xs2QUUKX7x0Ik'
    const bot = new Telegraf(token);
    

    setInterval(()=>{
        deepCorrectionAtUptrendFinder().then(data => {
            if(data){
                let message = ''
                console.log(data)
                for (const el of data) {
                    if(el.hourRsi < 30 && el.halfdayRsi > 49) {
                        message += `Ticker: ${el.ticker} RSI1H: ${el.hourRsi} RSI12H: ${el.halfdayRsi}\n`
                    }
                }
                if(message)
                bot.telegram.sendMessage(405531728, message)
            }
        })
    }, 60000)





    // const token = '6017219652:AAHttibf83BofBNNBgplV6Xs2QUUKX7x0Ik'
    // const bot = new Telegraf(token);

    // if (bot) {
    // //   bot.command("start", async (ctx) => {
    // //     await ctx.reply(
    // //       `Please enter coin ticker you want to track. Example: If you want to track Bitcoin enter BTC`
    // //     );
    // //   });

    //   bot.on("web_app_data", async (ctx) => {
    //     let coin = ctx.message.text.toLocaleUpperCase();
    //     if (
    //       (await checkApi(coin)) &&
    //       !(await checkTrackingCoins(AppDataSource, coin))
    //     ) {
    //       loader(coin);
    //       trackCoin(AppDataSource, coin);
    //       await ctx.reply(`Now ${coin} is tracking`);
    //     } else if (!(await checkApi(coin))) {
    //       await ctx.reply(`Enter right coin please`);
    //     } else {
    //       await ctx.reply(`Coin is tracked already`);
    //     }
    //   });

    //   bot.launch();
    // }
   

    
    // console.log(rsi.calculate({period:14, values:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,1,2,10,6,8,12,43,56,121,95,76,43,21]}))
})





