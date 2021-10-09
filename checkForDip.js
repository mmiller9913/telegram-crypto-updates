//NOTE: this script runs via a cron job at a specified time of day using Heroku Scheduler

const endpoints = require('./javascript/endpoints');
const telegramBot = require('./telegramBot');
const keys = require('./google-credentials.json');
var { google } = require('googleapis');
require('dotenv').config({ path: '.env' });


sendDipAlertMessage = (coin, currentPrice, lastPrice) => {
    const text = `${coin} IS DIPPING.\n\nIt dropped from $${lastPrice} to $${currentPrice} over the last 10 minutes—a dip of ${Math.trunc((1 - currentPrice / lastPrice) * 100)}%\n\nBTFD!!`;
    telegramBot.bot.sendMessage(telegramBot.chatId, text);
}

checkForDip = async (priceArray, cl) => {
    let lastEthPrice = priceArray[1][1];
    let lastBtcPrice = priceArray[0][1];

    console.log('Checking for dip...');

    const currentBtcPrice = Math.trunc(await endpoints.getBTCPrice());
    const currentEthPrice = Math.trunc(await endpoints.getETHPrice());

    if (lastBtcPrice != 'undefined' && (1 - (currentBtcPrice / lastBtcPrice) >= 0.015)) { //looking for 1.5% drop every 10 minutes
        // if(lastBtcPrice && currentBtcPrice != lastBtcPrice) {
        let coin = "BITCOIN";
        sendDipAlertMessage(coin, currentBtcPrice, lastBtcPrice);
        // console.log(`BITCOIN IS DIPPING.\n\nIt dropped from $${lastBtcPrice} to $${btcPrice} over the last 10 minutes — a dip of ${Math.trunc((1-btcPrice/lastBtcPrice) * 100)}%\n\nBTFD!!`)
    }

    if (lastEthPrice != 'undefined' && (1 - (currentEthPrice / lastEthPrice) >= 0.015)) { //looking for 1.5% drop every 10 minutes
        let coin = "ETHEREUM";
        sendDipAlertMessage(coin, currentEthPrice, lastEthPrice);
    }

    updateGoogleSheet(currentBtcPrice, currentEthPrice, cl);
}

//https://www.tutorialsteacher.com/nodejs/nodejs-file-system

//need to turn off the bot after 20 seconds
setTimeout(() => {
    console.log('Turning off the bot');
    telegramBot.bot.stopPolling();
}, 20000);

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
            console.log('Connected to Google Sheet');
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

    console.log('Google Sheet successfuly updated with new BTC & ETH prices');

}

connectToGoogleSheet();