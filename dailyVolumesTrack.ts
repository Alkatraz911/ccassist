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

export const trackCoinAlertVolumes = async () => {
    
    let markets = await CoinAlertService.coinAlertMarketssLoad()
   
    if(Array.isArray(markets)) {
        markets.forEach((el) => { 
            AppDataSource.manager.insert(CoinAlertVolumes, {
                market: el.market,
                pair: el.pair,
                vol: el.vol,
                vol_change_24: el.vol_change_24,
                last: el.last,
                date: new Date(new Date().getTime() - 86400000).toLocaleDateString()
            })
        })
    }
    
}

const start = () => {
     trackCoinAlertVolumes()
     setInterval(()=>{}, 86400000)
}

