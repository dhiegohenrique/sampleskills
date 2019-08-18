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
  (req, res) => {
    // const response = await request('https://samples.openweathermap.org/data/2.5/weather?q=London,uk&appid=b6907d289e10d714a6e88b30761fae22')
    // console.log('response.body: ' + response.body)
    // res
    //   .say('testando a resposta: ' + response.body)
    const url = 'https://samples.openweathermap.org/data/2.5/weather?q=London,uk&appid=b6907d289e10d714a6e88b30761fae22'
    // request.get(url, (error, response, body) => {
    //   console.log('error:', error); // Print the error if one occurred
    //   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //   console.log('body:', body); // Print the body

    //   res.say('Esta é a resposta: ' + body)
    // })
    // const response = await request.get(url)
    // console.log('response.body.weather.description: ' + response.body.weather.description)
    // res.say('Esta é a resposta: ' + response.body.weather.description)

    return request.get(url, (error, response, body) => {
      console.log('body >>>> ' + body)
      console.log('body.weather.description: ' + body.weather.description)
      res.say('esta é a resposta: ' + body.weather.description)
    })
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