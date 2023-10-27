import { Telegraf } from "telegraf";
import { Markup } from 'telegraf';
import { callbackQuery } from "telegraf/filters";

let timeframes = ['15m', '1h', '4h', '12h', '1d', '1w'];
const token = '6017219652:AAHttibf83BofBNNBgplV6Xs2QUUKX7x0Ik'
let valueType = '';
let value = 0;
let values = {};

export const bot = new Telegraf(token);

bot.command('start', async (ctx) => {
    return await ctx.reply(
        'Hello, this bot helps you to track binance spot market tickets volumes and RSI values. Please select either you want to track all tickets or some exact tickets',
        Markup.inlineKeyboard([
            Markup.button.callback('All', 'All'),
            Markup.button.callback('Enter exact tickets', 'exact'),
        ])
    )
})





bot.on(callbackQuery("data"), async (ctx) => {
    let data = ctx.callbackQuery.data;
    console.log(data)
    if (data === 'All') {
        return await ctx.reply(
            'Please select what you want to track',
            Markup.inlineKeyboard([
                Markup.button.callback('RSI', 'rsi'),
                Markup.button.callback('Volume', 'volume'),
            ])
        )
    } else if (data === 'exact') {
        return await ctx.reply('Please enter one ticket in format BTCUSDT or some tickets separate by ,')
    } else if (data === 'rsi') {
        valueType = 'rsi'
        return await ctx.reply(
            'Please type timeframe. Available timeframes 15m,1h,4h,12h,1d,1w',
            Markup.inlineKeyboard(timeframes.map(el => Markup.button.callback(el, el)))
        )
    } else if (timeframes.includes(data)) {
        return await ctx.reply(
            'Please enter value',
        )
    } else if (data === 'volume') {
        valueType = 'volume'
        return await ctx.reply(
            'Please type timeframe. Available timeframes 15m,1h,4h,12h,1d,1w',
            Markup.inlineKeyboard(timeframes.map(el => Markup.button.callback(el, el)))
        )
    } else if (data === '<' || data === '>') {
        Object.assign({},values,{type: valueType, value, sign: data })
        console.log(values)
        return await ctx.reply(
            'Tracking'
        )
    }

})

// bot.action('All', async (ctx)=>{
//     return await ctx.reply(
//         'Please select what you want to track',
//         Markup.inlineKeyboard([
//             Markup.button.callback('RSI', 'rsi'),
//             Markup.button.callback('Volumes', 'volumes'),
//         ])
//     )
// })

// bot.action('exact', async (ctx)=> {
//     return  await ctx.reply('Please enter one ticket in format BTCUSDT or some tickets separate by ,')
// })

// bot.action('rsi', async (ctx)=> {
//     return await ctx.reply(
//         'Please select timeframe',
//         Markup.inlineKeyboard([
//             Markup.button.callback('15m', '15m'),
//             Markup.button.callback('1h', '1h'),
//             Markup.button.callback('4h', '4h'),
//             Markup.button.callback('12h', '12h'),
//             Markup.button.callback('1d', '1d'),
//             Markup.button.callback('1w', '1w'),
//         ])
//     )

// })

// bot.action('15m', async (ctx)=>{
//     timeframe = '15m'
//     return await ctx.answerCbQuery('Please enter RSI value use next format rsi<30 or rsi>30')

// })

bot.on('text', async (ctx) => {
    let message = ctx.message.text
    if (!/[a-zа-яё]/i.test(message)) {
        let inputValue = Number(message)
        if (valueType === 'rsi') {
            (inputValue > 0 && inputValue < 100)
                ?
                (async () => {
                    value = inputValue;
                    return await ctx.reply(
                        'Please select which values bot should track lower or higher',
                        Markup.inlineKeyboard([
                            Markup.button.callback('<', '<'),
                            Markup.button.callback('>', '>'),
                        ])
                    )
                })()

                :
                await ctx.reply(
                    'Please enter value afrom 1 to 99',
                )
        } else {


        }

    } else {
        console.log(123)
    }

})