//NOTE: this script runs via a cron job at a specified time of day using Heroku Scheduler

const endpoints = require('./javascript/endpoints');
const telegramBot = require('./telegramBot');
require('dotenv').config({ path: '.env' });

// //Telegram bot stuff
// const TelegramBot = require('node-telegram-bot-api');

// //bot name = "Daily Price Update Bot", bot username = 'matts_daily_price_update_bot'
// // const token = '1684374267:AAE4UhwNQ4O5hsB33y1aX3wakbrA8-JMwGY';

// //bot name = "Daily Price Update Bot v2", bot username = 'matts_daily_price_update_v2_bot'
// const token = process.env.V2_BOT_TELEGRAM_TOKEN;

// //bot name = "Daily Price Update Bot v3", bot username = 'matts_daily_price_update_v3_bot'
// //this is the bot that's currently deployed and active in the telegram group
// // const token = process.env.V3_BOT_TELEGRAM_TOKEN;

// //bot name = "Daily Price Update Bot v4", bot username = 'matts_daily_price_update_v3_bot'
// // const token = process.env.V4_BOT_TELEGRAM_TOKEN;

// bot = new TelegramBot(token, { polling: true });

// const chatId = process.env.CHAT_ID_WITH_ME;
// // const chatId = process.env.CHAT_ID_WITH_GROUP;

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
