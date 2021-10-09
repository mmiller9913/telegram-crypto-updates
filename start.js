require('dotenv').config({ path: '.env' });

const app = require('./app');
app.set('port', process.env.PORT || 3000);
const server = app.listen(app.get('port'), () => {
  console.log(`App started: Express running → PORT ${server.address().port}`);
});
