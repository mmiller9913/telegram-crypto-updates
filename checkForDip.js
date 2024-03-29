//NOTE: this script runs via a cron job at a specified time of day using Heroku Scheduler

const endpoints = require('./javascript/endpoints');
const keys = require('./google-credentials.json');
var { google } = require('googleapis');
require('dotenv').config({ path: '.env' });
process.env.NTBA_FIX_319 = 1; //this is here b/c: https://stackoverflow.com/questions/65289566/node-telegram-bot-api-deprecated-automatic-enabling-of-cancellation-of-promises
const moment = require('moment');

checkForDip = async (priceArray, cl) => {
    let lastEthPrice = priceArray[1][1];
    let lastBtcPrice = priceArray[0][1];

    const currentBtcPrice = Math.trunc(await endpoints.getBTCPrice());
    const currentEthPrice = Math.trunc(await endpoints.getETHPrice());

    updateGoogleSheet(currentBtcPrice, currentEthPrice, cl);

    if (lastBtcPrice != 'undefined' && (1 - (currentBtcPrice / lastBtcPrice) >= 0.015)) { //looking for 1.5% drop every 10 minutes
        let coin = "BITCOIN";
        const telegramBot = require('./telegramBot');
        sendDipAlertMessage(coin, currentBtcPrice, lastBtcPrice, telegramBot);
        turnOffBot(telegramBot, coin);
    }

    if (lastEthPrice != 'undefined' && (1 - (currentEthPrice / lastEthPrice) >= 0.015) ) { //looking for 1.5% drop every 10 minutes
        let coin = "ETHEREUM";
        const telegramBot = require('./telegramBot');
        sendDipAlertMessage(coin, currentEthPrice, lastEthPrice, telegramBot);
        turnOffBot(telegramBot, coin);
    }

    if (lastBtcPrice != 'undefined' && ( ((currentBtcPrice - lastBtcPrice)/lastBtcPrice) * 100 >= 2 )) { //looking for 2% increase every 10 minutes
        let coin = "BITCOIN";
        const telegramBot = require('./telegramBot');
        sendPumpAlertMessage(coin, currentBtcPrice, lastBtcPrice, telegramBot);
        turnOffBot(telegramBot, coin);
    }

    if (lastEthPrice != 'undefined' && ( ((currentEthPrice - lastEthPrice)/lastEthPrice) * 100 >= 2 )) { //looking for 2% increase every 10 minutes
        let coin = "ETHEREUM";
        const telegramBot = require('./telegramBot');
        sendPumpAlertMessage(coin, currentEthPrice, lastEthPrice, telegramBot);
        turnOffBot(telegramBot, coin);
    }
}

sendDipAlertMessage = (coin, currentPrice, lastPrice, telegramBot) => {
    const text = `${coin} IS DIPPING 🚨🚨🚨\n\nIt dropped from $${lastPrice} to $${currentPrice} over the last 10 minutes—a dip of ${Math.trunc((1 - currentPrice / lastPrice) * 100)}%\n\nBTFD!!`;
    telegramBot.bot.sendMessage(telegramBot.chatId, text);
    console.log(`${moment().format('dddd')}, ${moment().format('l')} ${moment().format('LTS')} | Dip alert message sent for ${coin}`)
}

sendPumpAlertMessage = (coin, currentPrice, lastPrice, telegramBot) => {
    const text = `${coin} IS PUMPING 🚀🚀🚀\n\nIt went from $${lastPrice} to $${currentPrice} over the last 10 minutes—a pump of ${Math.trunc(((currentPrice - lastPrice)/lastPrice)* 100)}%!!`;
    telegramBot.bot.sendMessage(telegramBot.chatId, text);
    console.log(`${moment().format('dddd')}, ${moment().format('l')} ${moment().format('LTS')} | Pump alert message sent for ${coin}`)
}

//https://www.tutorialsteacher.com/nodejs/nodejs-file-system

//need to turn off the bot after 10 seconds
function turnOffBot(telegramBot, coin) {
    setTimeout(() => {
        console.log(`Turning off the bot after sending dip alert message for ${coin}`);
        telegramBot.bot.stopPolling();
    }, 10000);
}

function connectToGoogleSheet() {
    const client = new google.auth.JWT(
        keys.client_email,
        null,
        keys.private_key,
        ['https://www.googleapis.com/auth/spreadsheets'] //this is the SCOPE
    );

    client.authorize(function (err, tokens) {
        if (err) {
            console.log(err);
        } else {
            // console.log('Connected to Google Sheet');
            getDataFromGoogleSheet(client);
        }
    })
}

async function getDataFromGoogleSheet(cl) {
    const gsapi = google.sheets({
        version: 'v4',
        auth: cl,
    });

    const options = {
        spreadsheetId: '13Auq8MGLT_RA2J6yA9inkL5TAeURyrUTww3bD2JzgYI',
        range: 'prices!A1:B',
    };

    let priceData = await gsapi.spreadsheets.values.get(options);
    const priceArray = priceData.data.values;
    checkForDip(priceArray, cl);
}

async function updateGoogleSheet(btcPrice, ethPrice, cl) {

    const gsapi = google.sheets({
        version: 'v4',
        auth: cl,
    });

    const newGoogleSheetArray = [['Last BTC Price', btcPrice], ['Last ETH Price', ethPrice]]

    const updateOptions = {
        spreadsheetId: '13Auq8MGLT_RA2J6yA9inkL5TAeURyrUTww3bD2JzgYI',
        range: 'prices!A1:B',
        valueInputOption: 'USER_ENTERED',
        resource: { values: newGoogleSheetArray },
    };

    let response = await gsapi.spreadsheets.values.update(updateOptions);

    console.log(`${moment().format('dddd')}, ${moment().format('l')} ${moment().format('LTS')} | Google Sheet successfuly updated with new BTC & ETH prices`)

}

connectToGoogleSheet();