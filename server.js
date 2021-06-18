require('dotenv').config()
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { MessagingResponse } = require('twilio').twiml;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', (req, res) => {
  const cityName = req.body.Body.trim();
  const migraineApiKey = process.env.MIGRAINE_API_KEY;
  const migraineApiEndpoint = process.env.MIGRAINE_API_ENDPOINT;

  const axiosOptions = {
    headers: {
      apikey: migraineApiKey,
    },
  };

  axios.get(`${migraineApiEndpoint}?c=${cityName}`, axiosOptions)
    .then((response) => {
      const { migraineIndex } = response.data;
      let message = '';

      switch (true) {
        case migraineIndex >= 0 && migraineIndex <= 1.99:
          message = 'yay, no migraine today';
          break;
        case migraineIndex >= 2 && migraineIndex <= 3.99:
          message = 'nay, theres a headache change today';
          break;
        default:
          message = 'no forecast available';
          break;
      }

      return message;
    })
    .then((message) => {
      const twiml = new MessagingResponse();
      twiml.message(message);
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    });
});

http.createServer(app).listen(1337, () => {
  console.log('server up');
});
