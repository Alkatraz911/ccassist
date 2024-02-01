
import { DataSource } from 'typeorm';
import { SpotTradingTickets } from '../models/SpotTradingTickets.js';
import { BinanceService } from '../API/BinanceService.js';

let filter = ["TOMOUSDT", "TKVUSDT"]

export const binanceSpotActiveTicketsLoader = (dataSource: DataSource) => {
    BinanceService.binanceSpotActiveTicketsLoad()
    .then(data => {
        if(typeof(data) != 'string') {
            
            data.map(async el => {
                if (!filter.includes(el.symbol))
                  await dataSource.manager
                    .createQueryBuilder()
                    .insert()
                    .into(SpotTradingTickets)
                    .values({
                      symbol: el.symbol,
                    })
                    .execute();
            })
        }

    })
}

// export const binanceSpotActiveTicketsLoader = () => {
//     return BinanceService.binanceSpotActiveTicketsLoad()
//     .then(data  => {
//         if(typeof(data) !== 'string') {
//             return data;
//         }

//     })
// }



