
import { DataSource } from 'typeorm';
import { SpotTradingTickets } from '../models/SpotTradingTickets.js';
import { BinanceService } from '../API/BinanceService.js';



export const binanceSpotActiveTicketsLoader = (dataSource: DataSource) => {
    BinanceService.binanceSpotActiveTicketsLoad()
    .then(data => {
        if(typeof(data) != 'string') {
            data.map(async el => {
                await dataSource.manager
                .createQueryBuilder()
                .insert()
                .into(SpotTradingTickets)
                .values({
                  symbol: el.symbol
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



