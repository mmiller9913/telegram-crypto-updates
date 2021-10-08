let lastBtcPrice;
let lastEthPrice;
let coin;

const endpoints = require('./endpoints');
const messages = require('./messages');

exports.checkForDip = async() => {
    console.log('Checking for dip...');
    const currentBtcPrice = Math.trunc(await endpoints.getBTCPrice());
    const currentEthPrice = Math.trunc(await endpoints.getETHPrice());
    // console.log(lastBtcPrice, currentBtcPrice);
    if (lastBtcPrice && (1 - (currentBtcPrice / lastBtcPrice) >= 0.015)) { //looking for 1.5% drop every 10 minutes
    // if(lastBtcPrice && currentBtcPrice != lastBtcPrice) {
        coin = "BITCOIN";
        messages.sendDipAlertMessage(coin, currentBtcPrice, lastBtcPrice);
        // console.log(`BITCOIN IS DIPPING.\n\nIt dropped from $${lastBtcPrice} to $${btcPrice} over the last 10 minutes — a dip of ${Math.trunc((1-btcPrice/lastBtcPrice) * 100)}%\n\nBTFD!!`)
    }

    if (lastEthPrice && (1 - (currentEthPrice / lastEthPrice) >= 0.015)) { //looking for 1.5% drop every 10 minutes
        coin = "ETHEREUM";
        messages.sendDipAlertMessage(coin, currentEthPrice, lastEthPrice);
    }

    lastBtcPrice = currentBtcPrice;
    lastEthPrice = currentEthPrice;
}