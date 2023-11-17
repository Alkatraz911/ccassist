import { AppDataSource } from './index.js';
import { CoinAlertService } from "./src/API/CoinAlertService.js";
import { CoinAlertVolumes } from './src/models/CoinAlertVolumes.js';


type CoinAlertMarketElement = {
    market: string;
    market_name: string;
    pair: string;
    last: string;
    change_24: number;
    low_24: string;
    high_24: string;
    vol: string;
    pid: number;
    name: string;
    vol_change_24: number
}




const writeToDB = async (el:CoinAlertMarketElement) => { 
    let check = await AppDataSource.manager
    .exists(CoinAlertVolumes, {where: {market: el.market, pair: el.pair, date: new Date().toLocaleDateString()}})
    
    if(!check) {
        AppDataSource.manager.insert(CoinAlertVolumes, {
            market: el.market,
            pair: el.pair,
            vol: el.vol,
            vol_change_24: el.vol_change_24,
            last: el.last,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        })  
    } else {
        console.log("Found duplicate, not written to db")
        return
    }
}

export const trackCoinAlertVolumes = async () => {
    
    let markets = await CoinAlertService.coinAlertMarketssLoad()
   
    if(Array.isArray(markets)) {
        for (const el of markets) {
            writeToDB(el)
        }
        console.log("Writing to DB finished")
    }
    
}





