module.change_code = 1;
'use strict';

const alexa = require('alexa-app');
const app = new alexa.app('myskill');


app.launch((request, response) => {
  response.say('Welcome to Alexa World').reprompt('Ask Something.').shouldEndSession(false);
});


app.error = (error, request, response) => {
  response.say('Sorry some error occured ' + error.message);
};

app.intent('sayHello',
  {
    "utterances": [
      "say Hello",
      "Hello alexa",
      "What's up",
      "Hey alexa"]
  },
  (request, response) => {
    response.say("Hello, Welcome to alexa world.");
  }
);

module.exports = app;