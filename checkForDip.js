//NOTE: this script runs via a cron job at a specified time of day using Heroku Scheduler

const endpoints = require('./javascript/endpoints');
const telegramBot = require('./telegramBot');
const prices = require('./prices');
var fs = require('fs');
require('dotenv').config({ path: '.env' });


sendDipAlertMessage = (coin, currentPrice, lastPrice) => {
    const text = `${coin} IS DIPPING.\n\nIt dropped from $${lastPrice} to $${currentPrice} over the last 10 minutes—a dip of ${Math.trunc((1 - currentPrice / lastPrice) * 100)}%\n\nBTFD!!`;
    telegramBot.bot.sendMessage(telegramBot.chatId, text);
}

checkForDip = async () => {
    //reading lasyBtcPrice & lastEthPrice from the prices.js fi;e
    let lastEthPrice = prices.lastEthPrice;
    let lastBtcPrice = prices.lastBtcPrice;

    console.log(lastBtcPrice, lastEthPrice);
    console.log('Checking for dip...');

    const currentBtcPrice = Math.trunc(await endpoints.getBTCPrice());
    const currentEthPrice = Math.trunc(await endpoints.getETHPrice());

    if (lastBtcPrice && (1 - (currentBtcPrice / lastBtcPrice) >= 0.015)) { //looking for 1.5% drop every 10 minutes
        // if(lastBtcPrice && currentBtcPrice != lastBtcPrice) {
        let coin = "BITCOIN";
        sendDipAlertMessage(coin, currentBtcPrice, lastBtcPrice);
        // console.log(`BITCOIN IS DIPPING.\n\nIt dropped from $${lastBtcPrice} to $${btcPrice} over the last 10 minutes — a dip of ${Math.trunc((1-btcPrice/lastBtcPrice) * 100)}%\n\nBTFD!!`)
    }

    if (lastEthPrice && (1 - (currentEthPrice / lastEthPrice) >= 0.015)) { //looking for 1.5% drop every 10 minutes
        let coin = "ETHEREUM";
        sendDipAlertMessage(coin, currentEthPrice, lastEthPrice);
    }

    //updating lastBtcPrice & lastEthPrice in the prices.js file
    fs.writeFile('prices.js', `module.exports = {lastBtcPrice:${currentBtcPrice}, lastEthPrice:${currentEthPrice}}`, function (err) {
        if (err)
            console.log(err);
        else
        console.log('lastBtcPrice & lastEth price update in prices.js');
    });
}

checkForDip();
//https://www.tutorialsteacher.com/nodejs/nodejs-file-system

//need to turn off the bot
setTimeout(() => {
    console.log('Turning off the bot');
    telegramBot.bot.stopPolling();
}, 30000);

//THIS IS WHERE I LEFT OFF, NEED TO PUSH TO HEROKU AND TEST THIS FILE SPECIFICIALLY IN HEROKU SCHEDULER
//NEED TO KNOW IF VARIABLES ARE STORED
//they aren't, and get polling error that multiple instances of bot are running
//think it has to do w/ what's inside sendDipAlertMessage function