

type RSIdata = {
    period: number;
    values: Array<number>;
}

export const calculateRSI = ({ period, values }: RSIdata) : number | null => {
    if(values && period) {
        let gainDays = 0;
        let lossDays = 0;
        let loss = 0;
        let gain = 0;
        let RSI = 0;
        if (values.length < period) {
            return null
        } else {
            if (values.length > 0) {

                
                for (const el of values) {
                    let nextEl = values[values.indexOf(el) + 1]
                    if (nextEl) {
                        if (el < nextEl) {
                            gain += nextEl
                            gainDays += 1
                        } else {
                            loss += nextEl
                            lossDays += 1
                        }
                    } else {
                        let gainDaysEMA = gain / gainDays
                        let lossDaysEMA = loss / lossDays
                        let RS = gainDaysEMA / lossDaysEMA
                        RSI = 100 - 100 / (1 + RS)
                    }
                }
                return RSI
            }
        }
        return RSI
    } else {
        return null
    }
}