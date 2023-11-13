import fetch from 'node-fetch'
let baseAPI = 'https://coinalert.me/public'


interface MarketResponse {

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

interface MarketsResponse {
    state: boolean;
    message: string;
    data: MarketResponse[]
}





export class CoinAlertService {

    static async coinAlertMarketssLoad() {

        let response = await fetch(baseAPI + '/api/?action=markets')
        

        if (response.ok) {
            let markets = await response.json() as MarketsResponse
            return markets.data
        } else {
            return response.status + ' ' + response.statusText
        }

    }

}