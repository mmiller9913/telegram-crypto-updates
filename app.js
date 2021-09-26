const express = require('express')
const bodyParser = require('body-parser');
const ejs = require('ejs');;

//Init the app (create the express app);
const app = express();

//Template engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

//Public folder setup
app.use(express.static(__dirname + '/public'));

//Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//index route
app.get('/', (req, res) => {
    res.render('index');
});

//to keep nodejs app running indefinitely on heroku
var http = require("http");
setInterval(function () {
    http.get("http://telegram-crypto-updates.herokuapp.com");
}, 30000); // used to run every 5 minutes, now run every 30 seconds

module.exports = app;