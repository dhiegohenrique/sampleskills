module.change_code = 1

const alexa = require('alexa-app')
const app = new alexa.app('alexa-cine-skill')
const request = require("request")
// const moment = require('moment')
const cheerio = require('cheerio')
const axios = require('axios')
const numeroPorExtenso = require('numero-por-extenso')
var Speech = require('ssml-builder');

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
    let url = 'https://samples.openweathermap.org/data/2.5/weather?q=London,uk&appid=b6907d289e10d714a6e88b30761fae22'
    url = 'http://www.adorocinema.com/filmes/agenda/mes/mes-2019-07/'

    return new Promise(async (resolve) => {
      // não funcionou:
      // const response = await request.get(url)
      // const body = JSON.parse(response.body)
      // console.log('body.weather.description: ' + body.name)
      // res.say('esta é a resposta: ' + body.name)
      // resolve()

      // request.get(url, (error, response, body) => {
      //   body = JSON.parse(body)
      //   console.log('body.weather.description: ' + body.name)
      //   res.say('esta é a resposta: ' + body.name)
      //   resolve()
      // })

      // const currentDate = moment()
      // const month = currentDate.month()
      // const year = currentDate.year()
      // res.say(`o mês atual é ${month} e o ano atual é ${year}`)
      // resolve()

      const response = await axios.get(url)
      const $ = cheerio.load(response.data)
      const prefix = 'Estreias de '

      $('.title-inter').each((index, el) => {
        let title = $(el).text().trim()
        title = title.replace(prefix, '')

        let array = title.split(' ')
        array[0] = numeroPorExtenso.porExtenso(array[0])
        array[array.length - 1] = numeroPorExtenso.porExtenso(array[array.length - 1])

        title = `${prefix}${array.join(' ')}`

        console.log(`title: ${title}`)
        // res
        //   .say(title)

        var speech = new Speech()
          .say(title)
          .pause('2s')

        // change 'true' to 'false' if you want to include the surrounding <speak/> tag
        var speechOutput = speech.ssml(true);
        res.say(speechOutput);
      })

      resolve()
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