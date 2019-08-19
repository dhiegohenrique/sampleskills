module.change_code = 1

const alexa = require('alexa-app')
const app = new alexa.app('alexa-cine-skill')
const moment = require('moment')
const cheerio = require('cheerio')
const axios = require('axios')
const numeroPorExtenso = require('numero-por-extenso')
const Speech = require('ssml-builder')

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
    const currentDate = moment()
    let month = parseInt(currentDate.month())
    month = month + 1

    if (parseInt(month) < 10 && !month.toString().startsWith('0')) {
      month = `0${month}`
    }
    
    const year = currentDate.year()
    const url = `http://www.adorocinema.com/filmes/agenda/mes/mes-${year}-${month}/`

    return new Promise(async (resolve) => {
      const response = await axios.get(url)
      const $ = cheerio.load(response.data)

      const arrayReleases = []
      $('.movie-agenda-month').each((indexAgenda, el) => {
        let releaseDate = $('.title-inter', el).first().text().trim()
        releaseDate = releaseDate.replace('Estreias de ', '')

        let array = releaseDate.split(' ')
        array[0] = numeroPorExtenso.porExtenso(array[0])
        array[array.length - 1] = numeroPorExtenso.porExtenso(array[array.length - 1])

        releaseDate = `Estréias de ${array.join(' ')}`
        const obj = {
          releaseDate,
          movies: []
        }

        $('.month-movies-link', el).each((index, el) => {
          const movie = $(el).text().trim()
          obj.movies.push(movie)
        })

        arrayReleases.push(obj)
      })

      arrayReleases.forEach((release) => {
        let speech = new Speech()
          .say(release.releaseDate)
          .pause('2s')

        let speechOutput = speech.ssml(true)
        res.say(speechOutput)

        release.movies.forEach((movie) => {
          speech = new Speech()
            .say(movie)
            .pause('1s')

          speechOutput = speech.ssml(true)
          res.say(speechOutput)
        })
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
    var helpOutput = 'Você pode escolher entre a programação do mês ou da semana'
    var reprompt = 'Qual programação você deseja saber?'
    // AMAZON.HelpIntent must leave session open -> .shouldEndSession(false)
    response.say(helpOutput).reprompt(reprompt).shouldEndSession(false)
  }
)

module.exports = app