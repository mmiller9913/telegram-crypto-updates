//NOTE: this script runs via a cron job at a specified time of day using Heroku Scheduler

const endpoints = require('./javascript/endpoints');
require('dotenv').config({ path: '.env' });
process.env.NTBA_FIX_319 = 1; //this is here b/c: https://stackoverflow.com/questions/65289566/node-telegram-bot-api-deprecated-automatic-enabling-of-cancellation-of-promises
const moment = require('moment');
const telegramBot = require('./telegramBot'); //this must be after the 'process.env.NTBA_FIX_319 = 1' to avoid the "node-telegram-bot-api deprecated Automatic enabling of cancellation of promises is deprecated." warning

sendGoodMorningMessage = async() => {
    const currentBtcPrice = Math.trunc(await endpoints.getBTCPrice());
    const currentEthPrice = Math.trunc(await endpoints.getETHPrice());
    const historicalBitcoinValues = await endpoints.getHistoricalBTCPrice();
    const historicalEthereumValues = await endpoints.getHistoricalETHPrice();
    const priceofBtcAtStartOfYear = historicalBitcoinValues[1];
    const priceOfBtcOnThisDayLastYear = historicalBitcoinValues[0];
    const priceOfEthAtStartOfYear = historicalEthereumValues[1];
    const priceOfEthOnThisDayLastYear = historicalEthereumValues[0];

    const text = `gm crypto gang.\n\nHere's your daily update:
    \n-Bitcoin: $${currentBtcPrice.toLocaleString()} (${currentBtcPrice > priceofBtcAtStartOfYear ? 'up' : 'down'} ${Math.trunc((currentBtcPrice/priceofBtcAtStartOfYear - 1) * 100)}% YTD)
    \n-Ethereum: $${currentEthPrice.toLocaleString()} (${currentEthPrice > priceOfEthAtStartOfYear ? 'up' : 'down'} ${Math.trunc((currentEthPrice/priceOfEthAtStartOfYear - 1) * 100)}% YTD)
    \nOn this day last year, the price of Bitcoin was $${(Math.trunc(priceOfBtcOnThisDayLastYear)).toLocaleString()} and the price of Ethereum was $${(Math.trunc(priceOfEthOnThisDayLastYear)).toLocaleString()}
    `;
    telegramBot.bot.sendMessage(telegramBot.chatId, text);
    console.log(`${moment().format('dddd')}, ${moment().format('l')} | Good Morning message sent`)
}

sendGoodMorningMessage();

//need to turn off the bot after 10 seconds
setTimeout(() => {
    console.log('Turning off the bot after sending Good Morning message');
    telegramBot.bot.stopPolling();
}, 10000);