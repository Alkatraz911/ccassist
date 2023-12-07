import { SpotTradingTickets } from "../models/SpotTradingTickets.js";
import { RSIcounter } from "../RSIcounter/RSIcounter.js";



export const deepCorrectionAtUptrendFinder = (
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