import fetch from 'node-fetch'

interface BinanceExchangeInfoResponse {

    timezone: string;
    serverTime: number;
    rateLimits: [];
    exchangeFilters: [];
    symbols: Symbol[];
}

interface Symbol {
    status: string;
    quoteAsset: string
    symbol:string;
}




export class BinanceService {

    static async binanceSpotActiveTicketsLoad() {

        let response = await fetch('https://api.binance.com/api/v3/exchangeInfo')
        let markets = await response.json() as BinanceExchangeInfoResponse

        if (Array.isArray(markets.symbols)) {
            let usdtMarkets = markets.symbols.filter(el => el.quoteAsset === 'USDT' && el.status === 'TRADING')
            return usdtMarkets.map(el => { return {symbol: el.symbol}})
        } else {
            return response.status + ' ' + response.statusText
        }

    }

    static async binanceKlinesLoad(ticket:string, interval:string, limit:number) {
        let response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${ticket}&interval=${interval}&limit=${limit}`)
        return await response.json() as Array<[]>

    }
}