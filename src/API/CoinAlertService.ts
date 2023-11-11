import fetch from 'node-fetch'
let baseAPI = 'https://coinalert.me/public'


interface MarketsResponse {

    market: string;
    market_name: string;
    pair: string;
    last: string;
    change_24: number;
    low_24: string;
    high_24: string;
    vol: string;
    pid: number
    name: string;
    vol_change_24: number
}






export class BinanceService {

    static async coinAlertMarketssLoad() {

        let response = await fetch(baseAPI + '/api/?action=markets')
        

        if (response.ok) {
            let markets = await response.json() as MarketsResponse
            return markets
        } else {
            return response.status + ' ' + response.statusText
        }

    }

}