module.change_code = 1
'use strict'

const alexa = require('alexa-app')
const app = new alexa.app('alexa-cine-skill')


app.launch((request, response) => {
  response
    .say('Bem-vindo a programação do cinema')
    .reprompt('Pergunte-me algo')
    .shouldEndSession(false)
})


app.error = (error, request, response) => {
  response
    .say('Desculpe, algum erro ocorreu: ' + error.message)
}

app.intent('programacao',
  {
    'utterances': [
      'deste mês',
      'desta semana']
  },
  (request, response) => {
    response.say('Até mais')
  }
)

app.intent("AMAZON.HelpIntent", {
  "slots": {},
  "utterances": []
},
  function (request, response) {
    var helpOutput = "Você pode escolher entre a programação do mês ou da semana";
    var reprompt = "Qual programação você deseja saber?";
    // AMAZON.HelpIntent must leave session open -> .shouldEndSession(false)
    response.say(helpOutput).reprompt(reprompt).shouldEndSession(false);
  }
);

module.exports = app