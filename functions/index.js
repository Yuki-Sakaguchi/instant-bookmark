const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const request = require('request')
const cheerio = require('cheerio')
// const url = 'https://nathan.tokyo/'
const results = {}

exports.getOgp = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const url = req.query['url']
    fetch(url, () => {
      res.json(results)
    })
  });
});

function fetch (url, afterCallback) {
  request(url, (e, response, body) => {
      if (e) {
          console.error(e)
      }
      try {
          const $ = cheerio.load(body)
          $('head meta').each((i, el) => {
            const property = $(el).attr('property')
            const content = $(el).attr('content')
            if (property && content) {
              results[property] = content
            }
          })
          afterCallback();
      } catch (err) {
          console.error(err)
          afterCallback();
      }
  })
}