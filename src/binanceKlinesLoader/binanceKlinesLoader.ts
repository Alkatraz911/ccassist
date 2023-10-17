
import { BinanceService } from "../API/BinanceService.js";
interface BinanceKlinesLoaderReturn {
    klineOpen: number;
    openPrice: string;
    highPrice: string;
    lowPrice: string;
    closePrice: string;
    volume: string;
    klineClose: string;
    quoteAssetVolume: number;
    numberOfTrades: number;
    takerBuyBaseAsserVolume: string;
    takerBuyQuoteAssetVolume: string;

}


export const binanceKlinesLoader = async (ticket:string, interval:string, limit:number):Promise<Array<BinanceKlinesLoaderReturn>> => {
    let data = await BinanceService.binanceKlinesLoad(ticket, interval,limit)
    return data.map((el:Array<any>) => {
        return {
            klineOpen: el[0],      // Kline open time
            openPrice: el[1],       // Open price
            highPrice: el[2],       // High price
            lowPrice: el[3],       // Low price
            closePrice: el[4],       // Close price
            volume: el[5],  // Volume
            klineClose: el[6],      // Kline Close time
            quoteAssetVolume: el[7],    // Quote asset volume
            numberOfTrades: el[8],                // Number of trades
            takerBuyBaseAsserVolume: el[9],    // Taker buy base asset volume
            takerBuyQuoteAssetVolume: el[10],      // Taker buy quote asset volume
        }
    })

}