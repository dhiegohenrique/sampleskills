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

      // let array = releaseDate.split(' ')
      // array[0] = numeroPorExtenso.porExtenso(array[0])
      // array[array.length - 1] = numeroPorExtenso.porExtenso(array[array.length - 1])

      // releaseDate = `Estréias de ${array.join(' ')}`
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
    let array = releaseDate.split(' ')
    array[0] = numeroPorExtenso.porExtenso(array[0])
    array[array.length - 1] = numeroPorExtenso.porExtenso(array[array.length - 1])

    releaseDate = `Estréias de ${array.join(' ')}`
    release.releaseDate = releaseDate
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
    arrayReleases = arrayReleases.filter((release) => {
      let date = release.releaseDate.trim()
      console.log('entrou aqui1: ', date)
      // date = date.replace('Estréias de ', '')
      // console.log('entrou aqui2: '.date)
      date = moment(date, 'DD de MMMM de YYYY')
      console.log('entrou aqui3: ' + date)

      if (date.isBetween(inicio, fim)) {
        console.log('entrou aqui4: ' + JSON.stringify(release))
        return release
      }
    })

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