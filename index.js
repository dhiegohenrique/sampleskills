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

module.exports = app