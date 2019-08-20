module.change_code = 1

const alexa = require('alexa-app')
const app = new alexa.app('alexa-cine-skill')
const moment = require('moment')
const cheerio = require('cheerio')
const axios = require('axios')
const numero = require('numero-por-extenso')
const Speech = require('ssml-builder')
const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

app.launch((request, response) => {
  response
    .say('Bem-vindo aos lançamentos do cinema')
    .reprompt('Você deseja saber os lançamentos deste mês ou desta semana?')
    .shouldEndSession(false)
})

app.error = (error, request, response) => {
  console.error(`Erro: ${error.message}`)
  response
    .say(`Desculpe, algum erro ocorreu: ${error.message}`)
}

const getMonthlySchedule = () => {
  return new Promise(async (resolve) => {
    const currentDate = moment()
    let month = parseInt(currentDate.month())
    month = month + 1

    if (month < 10 && !month.toString().startsWith('0')) {
      month = `0${month}`
    }

    const year = currentDate.year()
    const url = `http://www.adorocinema.com/filmes/agenda/mes/mes-${year}-${month}/`

    const res = await axios.get(url)
    const $ = cheerio.load(res.data)

    const arrayReleases = []
    $('.movie-agenda-month').each((index, el) => {
      let releaseDate = $('.title-inter', el).first().text().trim()
      releaseDate = releaseDate.replace('Estreias de ', '')
      
      let arrayDate = releaseDate.split(' ')
      arrayDate = arrayDate.filter((item) => {
        return item !== 'de'
      })

      let monthIndex = months.findIndex((month) => {
        return month.toLowerCase() === arrayDate[1].toLowerCase()
      })
      monthIndex = monthIndex + 1
      arrayDate[1] = `${monthIndex}`
      releaseDate = arrayDate.join('/')

      const objRelease = {
        releaseDate,
        movies: []
      }

      $('.month-movies-link', el).each((index, el) => {
        const movie = $(el).text().trim()
        objRelease.movies.push(movie)
      })

      arrayReleases.push(objRelease)
    })

    resolve(arrayReleases)
  })
}

const formatDate = (arrayReleases) => {
  return arrayReleases.map((release) => {
    const releaseDate = release.releaseDate
    let arrayDate = releaseDate.split('/')

    arrayDate[0] = numero.porExtenso(arrayDate[0])
    arrayDate[1] = months[arrayDate[1] - 1]
    arrayDate[2] = numero.porExtenso(arrayDate[2])

    release.releaseDate = `Estréias de ${arrayDate.join(' de ')}`
    return release
  })
}

const getWeeklySchedule = () => {
  return new Promise(async (resolve) => {
    const currentDate = moment()
    const startDate = currentDate.day(0)
    const endDate = currentDate.day(6)

    let arrayReleases = await getMonthlySchedule()
    arrayReleases = arrayReleases.filter((release) => {
      let date = moment(release.releaseDate, `DD/MM/YYYY`)
      return date.isBetween(startDate, endDate)
    })

    resolve(arrayReleases)
  })
}

app.intent('MonthlyScheduleIntent',
  {
    'utterances': [
      'deste mês']
  },
  (req, res) => {
    return new Promise(async (resolve) => {
      let arrayReleases = await getMonthlySchedule()
      arrayReleases = formatDate(arrayReleases)
      await sayReleases(res, arrayReleases)
      resolve()
    })
  }
)

app.intent('WeeklyScheduleIntent',
  {
    'utterances': [
      'desta semana']
  },
  (req, res) => {
    return new Promise(async (resolve) => {
      let arrayReleases = await getWeeklySchedule()
      arrayReleases = formatDate(arrayReleases)
      await sayReleases(res, arrayReleases)
      resolve()
    })
  }
)

app.intent('AMAZON.HelpIntent', {
  'slots': {},
  'utterances': []
},
  (request, response) => {
    const helpOutput = 'Você pode escolher entre a programação deste mês ou desta semana'
    const reprompt = 'Qual programação você deseja saber?'
    // AMAZON.HelpIntent must leave session open -> .shouldEndSession(false)
    response
      .say(helpOutput)
      .reprompt(reprompt)
      .shouldEndSession(false)
  }
)

const sayReleases = (res, arrayReleases) => {
  return new Promise((resolve) => {
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

module.exports = app