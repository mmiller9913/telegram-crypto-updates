const fetch = require("node-fetch");

const bitcoinEndpoint = 'https://api.coindesk.com/v1/bpi/currentprice.json';
exports.getBTCPrice = async () => {
    const bitcointResponse = await fetch(bitcoinEndpoint);
    const bitcoinData = await bitcointResponse.json();
    const bitcoinPrice = bitcoinData.bpi.USD.rate_float;
    return bitcoinPrice;
}
const ethereumEndpoint = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
exports.getETHPrice = async () => {
    const ethereumResponse = await fetch(ethereumEndpoint);
    const ethereumData = await ethereumResponse.json();
    const ethereumPrice = ethereumData.ethereum.usd;
    return ethereumPrice;
}

//need to check if the previous year was a leap year
const year = new Date().getFullYear();
function leapYear(year) {
    return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}
const daysOfDataToGetForAPI = leapYear(year - 1) ? 366 : 365;

//figuring out how many days since the start of the year
const now = new Date();
const start = new Date(now.getFullYear(), 0, 1);
const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
const oneDay = 1000 * 60 * 60 * 24;
const daysSinceStartOfTheYear = Math.floor(diff / oneDay);


const historicalBitcoinEndpoint = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${daysOfDataToGetForAPI}&interval=1`; //the below api takes two arguments: # of days ago, and interval # of days
exports.getHistoricalBTCPrice = async () => {
    const historicalBitcoinResponse = await fetch(historicalBitcoinEndpoint);
    const historicalBitcoinData = await historicalBitcoinResponse.json();
    const priceOfBtcOnThisDayLastYear = historicalBitcoinData.prices[0][1]; //the first entry in the results will be this day last year
    const startOfYearBTCPrice = historicalBitcoinData.prices[daysOfDataToGetForAPI - daysSinceStartOfTheYear][1];
    return [priceOfBtcOnThisDayLastYear, startOfYearBTCPrice];
}


const historicalEthereumEndpoint = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${daysOfDataToGetForAPI}&interval=1`; //the below api takes two arguments: # of days ago, and interval # of days
exports.getHistoricalETHPrice = async () => {
    const historicalEthereumResponse = await fetch(historicalEthereumEndpoint);
    const historicalEthereumData = await historicalEthereumResponse.json();
    const priceOfEthOnThisDayLastYear = historicalEthereumData.prices[0][1]; //the first entry in the results will be this day last year
    const startOfYearEthPrice = historicalEthereumData.prices[daysOfDataToGetForAPI - daysSinceStartOfTheYear][1];

    return [priceOfEthOnThisDayLastYear, startOfYearEthPrice];
}