//NOTE: this script runs via a cron job at a specified time of day using Heroku Scheduler

const endpoints = require('./javascript/endpoints');
const telegramBot = require('./telegramBot');
require('dotenv').config({ path: '.env' });

sendGoodMorningMessage = async() => {
    const currentBtcPrice = Math.trunc(await endpoints.getBTCPrice());
    const currentEthPrice = Math.trunc(await endpoints.getETHPrice());
    const historicalBitcoinValues = await endpoints.getHistoricalBTCPrice();
    const historicalEthereumValues = await endpoints.getHistoricalETHPrice();
    const priceofBtcAt2020Halving = historicalBitcoinValues[0];
    const priceofBtcAtStartOfYear = historicalBitcoinValues[1];
    const priceOfBtcOnThisDayLastYear = historicalBitcoinValues[2];
    const priceOfEthAtStartOfYear = historicalEthereumValues[1];
    const priceOfEthOnThisDayLastYear = historicalEthereumValues[0];

    const text = `gm crypto gang.\n\nHere's your daily update:
    \n-Bitcoin: $${currentBtcPrice.toLocaleString()} (${currentBtcPrice > priceofBtcAt2020Halving ? 'up' : 'down'} ${Math.trunc((currentBtcPrice/priceofBtcAt2020Halving - 1) * 100)}% since the 2020 halving and ${currentBtcPrice > priceofBtcAtStartOfYear ? 'up' : 'down'} ${Math.trunc((currentBtcPrice/priceofBtcAtStartOfYear - 1) * 100)}% YTD)
    \n-Ethereum: $${currentEthPrice.toLocaleString()} (${currentEthPrice > priceOfEthAtStartOfYear ? 'up' : 'down'} ${Math.trunc((currentEthPrice/priceOfEthAtStartOfYear - 1) * 100)}% YTD)
    \nOn this day last year, the price of Bitcoin was $${(Math.trunc(priceOfBtcOnThisDayLastYear)).toLocaleString()} and the price of Ethereum was $${(Math.trunc(priceOfEthOnThisDayLastYear)).toLocaleString()}
    `;
    telegramBot.bot.sendMessage(telegramBot.chatId, text);
}

sendGoodMorningMessage();


//need to turn off the bot after 15 seconds
setTimeout(() => {
    console.log('Turning off the bot');
    telegramBot.bot.stopPolling();
}, 15000);