import { binanceKlinesLoader, BinanceKlinesLoaderReturn } from "../binanceKlinesLoader/binanceKlinesLoader.js";

export const trackVolumes = async (
    ticket: string,
    timeframe: string,
    candlesNumber: number
) => {
    let candles = await binanceKlinesLoader(ticket, timeframe, candlesNumber);
    let baseCandleVolume = 0;
    let baseCandlePrice = 0
    let averageVolume = 0;
    let volumes = candles.map((el: BinanceKlinesLoaderReturn, i:number) => {
        let volume:string = '';
        let percentOfPreviousCandle:string = '';
        let priceChange: string = '';
        let priceChangePercent: string = '';
        let dateTime: string = '';

        if (el.quoteAssetVolume) {
            if (i === 0) {
                let [volumeValue] = el.quoteAssetVolume.split(".", 1);
                if (volumeValue) {
                    
                        volume = volumeValue;
                        percentOfPreviousCandle = "base candle";
                        priceChange = "base candle";
                        priceChangePercent = "base candle";
                        dateTime =
                            new Date(el.klineClose).toLocaleDateString() +
                            " " +
                            new Date(el.klineClose).toLocaleTimeString();
                    }
                    baseCandleVolume = Number(volumeValue);
                    averageVolume = Number(volumeValue);
                    baseCandlePrice = Number(el.closePrice)
                } else {
                let [volumeValue] = el.quoteAssetVolume.split(".", 1);
                let percent = (Number(volumeValue) / baseCandleVolume) * 100;

                if (volumeValue) {
                    
                        volume = volumeValue;
                        percentOfPreviousCandle = `${percent.toFixed()}%`;
                        priceChange  = (Number(el.closePrice) - baseCandlePrice).toFixed(2);
                        priceChangePercent = `${((Number(el.closePrice) - baseCandlePrice) / baseCandlePrice * 100).toFixed()}%`,
                        dateTime =
                            new Date(el.klineClose).toLocaleDateString() +
                            " " +
                            new Date(el.klineClose).toLocaleTimeString();
                    
                    baseCandleVolume = Number(volume);
                    averageVolume = (averageVolume + Number(volume)) / (i + 1);
                    baseCandlePrice = Number(el.closePrice)
                }
            }
        } else {
            
                volume = '0';
                percentOfPreviousCandle ='0';
                priceChange = "0";
                priceChangePercent = "0";
                dateTime =
                    new Date(el.klineClose).toLocaleDateString() +
                    " " +
                    new Date(el.klineClose).toLocaleTimeString();
        }
    
        return {volume, percentOfPreviousCandle, priceChange, priceChangePercent, dateTime};
       
    });
    return { ticket, timeframe, volumes };
};