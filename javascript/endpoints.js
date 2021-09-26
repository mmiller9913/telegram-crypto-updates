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

const year = new Date().getFullYear();
const endDateForBTCAPI = `${year}-01-01`;
const historicalBitcoinEndpoint = `https://api.coindesk.com/v1/bpi/historical/close.json?start=2020-05-10&end=${endDateForBTCAPI}`
exports.getHistoricalBTCPrice = async () => {
    const historicalBitcoinResponse = await fetch(historicalBitcoinEndpoint);
    const historicalBitcoinData = await historicalBitcoinResponse.json();
    const today = new Date();
    today.setMonth(today.getMonth() - 12); //setting the year to be 1 year ago
    const oneYearAgoToday = today.toISOString().slice(0, 10);
    const startOfYearBTCPrice = historicalBitcoinData.bpi[endDateForBTCAPI];
    const priceAt2020Halving = historicalBitcoinData.bpi['2020-05-11'];
    const priceOfBtcOnThisDayLastYear = historicalBitcoinData.bpi[oneYearAgoToday];
    return [priceAt2020Halving, startOfYearBTCPrice, priceOfBtcOnThisDayLastYear];
}

//need to check if the previous year was a leap year
function leapYear(year) {
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}
const daysOfDataToGetForEthAPI = leapYear(year - 1) ? 366 : 365;

const historicalEthereumEndpoint = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${daysOfDataToGetForEthAPI}&interval=1`; //the below api takes two arguments: # of days ago, and interval # of days
exports.getHistoricalETHPrice = async() => {
    const historicalEthereumResponse = await fetch(historicalEthereumEndpoint);
    const historicalEthereumData = await historicalEthereumResponse.json();
    const priceOfEthOnThisDayLastYear = historicalEthereumData.prices[0][1]; //the first entry in the results will be this day last year

    //figuring out how many days since the start of the year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff  = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const daysSinceStartOfTheYear =  Math.floor(diff / oneDay);

    const startOfYearEthPrice = historicalEthereumData.prices[daysOfDataToGetForEthAPI - daysSinceStartOfTheYear][1];

    return [priceOfEthOnThisDayLastYear, startOfYearEthPrice];
}