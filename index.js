module.change_code = 1

const alexa = require('alexa-app')
const app = new alexa.app('alexa-cine-skill')
const request = require("request")

app.launch((request, response) => {
  response
    .say('Bem-vindo a programação do cinema')
    .reprompt('Qual programação você deseja saber?')
    .shouldEndSession(false)
})

app.error = (error, request, response) => {
  response
    .say('Desculpe, algum erro ocorreu: ' + error.message)
}

app.intent('MonthlyScheduleIntent',
  {
    'utterances': [
      'deste mês']
  },
  (request, response) => {
    response.say('Digo deste mês')
  }
)

app.intent('WeeklyScheduleIntent',
  {
    'utterances': [
      'desta semana']
  },
  (request, response) => {
    response.say('Digo da semana')
  }
)

app.intent('CheckStatusIntent',
  {
    'utterances': [
      'deste site']
  },
  async (req, res) => {
    const response = await request('http://api.openweathermap.org/data/2.5/weather?q=London')
    console.log('response.body: ' + response.body)
    res
      .say('testando a resposta: ' + response.body)
  }
)

app.intent('AMAZON.HelpIntent', {
  'slots': {},
  'utterances': []
},
  (request, response) => {
    var helpOutput = 'Você pode escolher entre a programação do mês ou da semana';
    var reprompt = 'Qual programação você deseja saber?';
    // AMAZON.HelpIntent must leave session open -> .shouldEndSession(false)
    response.say(helpOutput).reprompt(reprompt).shouldEndSession(false);
  }
);

module.exports = app