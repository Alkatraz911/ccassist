import * as Technicalindicators from "technicalindicators";
import { SpotTradingTickets } from "../models/SpotTradingTickets.js";
import { binanceKlinesLoader } from "../binanceKlinesLoader/binanceKlinesLoader.js";
import { Big, RSI } from "trading-signals";

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

export const RSIcounter = async (
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