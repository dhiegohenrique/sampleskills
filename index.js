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

const getMonthlySchedule = () => {
  return new Promise(async (resolve) => {
    const currentDate = moment()
    let month = parseInt(currentDate.month())
    month = month + 1

    if (parseInt(month) < 10 && !month.toString().startsWith('0')) {
      month = `0${month}`
    }

    const year = currentDate.year()
    const url = `http://www.adorocinema.com/filmes/agenda/mes/mes-${year}-${month}/`

    const response = await axios.get(url)
    const $ = cheerio.load(response.data)

    const arrayReleases = []
    $('.movie-agenda-month').each((index, el) => {
      let releaseDate = $('.title-inter', el).first().text().trim()
      releaseDate = releaseDate.replace('Estreias de ', '')
      let array = releaseDate.split(' ')
      array = array.filter((item) => {
        return item !== 'de'
      })

      let monthIndex = months.findIndex((month) => {
        return month.toLowerCase() === array[1].toLowerCase()
      })
      monthIndex = monthIndex + 1
      array[1] = `${monthIndex}`
      releaseDate = array.join('/')

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

    resolve(arrayReleases)
  })
}

const formatDate = (arrayReleases) => {
  return arrayReleases.map((release) => {
    let releaseDate = release.releaseDate
    let arrayDate = releaseDate.split('/')

    arrayDate[0] = numero.porExtenso(arrayDate[0])
    arrayDate[1] = months[arrayDate[1] - 1]
    arrayDate[2] = numero.porExtenso(arrayDate[2])

    release.releaseDate = `Estréias de ${arrayDate.join(' de ')}`
  })
}

const getWeeklySchedule = () => {
  return new Promise(async (resolve) => {
    const currentDate = moment()
    const year = currentDate.year()
    const day = currentDate.day()

    let month = parseInt(currentDate.month())
    month = month + 1

    if (parseInt(month) < 10 && !month.toString().startsWith('0')) {
      month = `0${month}`
    }

    let agora = moment();

    let inicio = moment().day(0); // domingo desta semana
    let fim = moment().day(6); // sábado desta semana

    // imprimir as datas no formato desejado
    let formato = 'DD/MM/YYYY';
    console.log('agora=', agora.format(formato));
    console.log('início=', inicio.format(formato));
    console.log('fim=', fim.format(formato));

    let arrayReleases = await getMonthlySchedule()
    let arrayWeekly = []
    for (let index = 0;index < arrayReleases.length;index++) {
      const release = arrayReleases[index]
      let date = moment(release.releaseDate, `DD/MM/YYYY`)
      if (date.isBetween(inicio, fim)) {
        console.log('entrou aqui0: ' + JSON.stringify(release))
        arrayWeekly.push(release)
      }

      if (date.isAfter(fim)) {
        break
      }
    }

    arrayReleases = arrayReleases.filter((release) => {
      let date = moment(release.releaseDate, `DD/MM/YYYY`)
      return date.isBetween(inicio, fim)
    })

    console.log('arrayReleases: ' + JSON.stringify(arrayReleases))
    arrayReleases = arrayWeekly
    resolve(arrayReleases)
  })
}

app.intent('CheckStatusIntent',
  {
    'utterances': [
      'deste site']
  },
  (req, res) => {
    return new Promise(async (resolve) => {
      let arrayReleases = await getWeeklySchedule()
      arrayReleases = formatDate(arrayReleases)
      // const arrayReleases = await getMonthlySchedule()
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