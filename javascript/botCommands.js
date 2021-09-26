const telegram2 = require('../telegram2');
const arrayOfInsults = require('./insults');

//https://stackoverflow.com/questions/38565952/how-to-receive-messages-in-group-chats-using-telegram-bot-api
  //useful link for changing setting of Telegram bot -- by default, they only recieve messages when '/' is in front
exports.insultBrendan = () => {
telegram2.bot.on('message', (msg) => {
    const chatId = msg.chat.id; 
    if (msg.text.toLowerCase().includes('insult brendan')) {
      const insult = arrayOfInsults[Math.floor(Math.random() * arrayOfInsults.length)];
      telegram2.bot.sendMessage(chatId, insult);
    }
  })
}

//https://www.sitepoint.com/how-to-build-your-first-telegram-chatbot-with-node-js/
//for adding an insult
exports.addInsult = () => {
telegram2.bot.onText(/\/insult/, (msg, match) => {
  const chatId = msg.chat.id; 
  const insult = match.input.split(' - ')[1];
  if (insult === undefined) {
      telegram2.bot.sendMessage(
          chatId,
          'Please provide an insult to Brendan!',
      );
      return;
    }
  arrayOfInsults.push(insult);
  function makeBulletedListOfInsults(insult) {
    return `\n-${insult}`;
  }
  const niceLookingArrayOfInsults = arrayOfInsults.map(makeBulletedListOfInsults).join('');
  telegram2.bot.sendMessage(
    chatId,
    `The Brendan insult has been successfully saved! Here's the new list of insults:\n${niceLookingArrayOfInsults}`,
  );
})};