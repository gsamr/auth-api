const express = require('express')
const app = express();
var bodyParser = require('body-parser');

const port = 3000

var uploadRouter = require('./routes/upload_router');


app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());

app.use('/', uploadRouter);
// app.get('/', (req, res) => res.send('Hello World!'))


app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`Express server is listening to ${port}`)
})