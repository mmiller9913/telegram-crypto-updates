const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config({ path: '.env' });

//bot name = "Daily Price Update Bot", bot username = 'matts_daily_price_update_bot'
// const token = '1684374267:AAE4UhwNQ4O5hsB33y1aX3wakbrA8-JMwGY';

//bot name = "Daily Price Update Bot v2", bot username = 'matts_daily_price_update_v2_bot'
const token = process.env.V2_BOT_TELEGRAM_TOKEN;

//bot name = "Daily Price Update Bot v3", bot username = 'matts_daily_price_update_v3_bot'
//this is the bot that's currently deployed and active in the telegram group
// const token = process.env.V3_BOT_TELEGRAM_TOKEN;

//bot name = "Daily Price Update Bot v4", bot username = 'matts_daily_price_update_v3_bot'
// const token = process.env.V4_BOT_TELEGRAM_TOKEN;


//imports
const messages = require('./javascript/messages');
const checkForDip = require('./javascript/checkForDip')
const botCommands = require('./javascript/botCommands');

exports.bot = new TelegramBot(token, { polling: true });

setInterval(function () {
    var date = new Date();
    const hour = date.getHours();
    const minutes = date.getMinutes();
    // if (hour === 11 && minutes === 00) {
     if (hour === 13) {   
        console.log('sending message');
        messages.sendGoodMorningMessage();
    }
}, 60000) //runs every 1 minute

setInterval(checkForDip.checkForDip, 600000); //runs every 10 minutes to check for dip

//FOR TESTING
messages.sendGoodMorningMessage();

//make sure these are uncommented on app load
botCommands.insultBrendan();
botCommands.addInsult();