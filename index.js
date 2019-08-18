module.change_code = 1
'use strict'

const alexa = require('alexa-app')
const app = new alexa.app('myskill')


app.launch((request, response) => {
  response
    .say('Bem-vindo a programação do cinema')
    .reprompt('Ask Something.')
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