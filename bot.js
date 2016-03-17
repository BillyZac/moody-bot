var moment = require('moment')
var Twit = require('twit')
var makeDrawing = require('./makeDrawing')
var fs = require('fs')

require('dotenv').config()

var T = new Twit({
 consumer_key: process.env.CONSUMER_KEY,
 consumer_secret: process.env.CONSUMER_SECRET,
 access_token: process.env.ACCESS_TOKEN_KEY,
 access_token_secret: process.env.ACCESS_TOKEN_SECRET,
 timeout_ms: 60*1000
})

var frequency = Math.random() * 100

// Make the image
makeDrawing(frequency, 100)
  .then(function(filePath) {
    console.log('Finished making the drawing:', filePath);

    // Read the image file
    var b64content = fs.readFileSync(filePath, { encoding: 'base64' })

    // Upload the image to Twitter
    T.post('media/upload', { media_data: b64content }, function (err, data, response) {

      // Post a tweet with a reference to the image file
      var mediaIdStr = data.media_id_string
      var params = { status: frequency + '#moody', media_ids: [mediaIdStr] }

      T.post('statuses/update', params, function (err, data, response) {
        // Confirmation that the post was successful
        console.log('=========================', data.created_at, data.text)
      })
    })
  })










//
// var now = moment()
// console.log('Looking for mentions at', now)
//
// T.get('statuses/mentions_timeline', function(err, mentions) {
//   if (err) { console.log('There was an error getting the mentions', err) }
//
//   mentions.forEach(function(mention) {
//     console.log('Got a mention at ', moment(mention.created_at).format('dddd, h:mm:ss'))
//     respond(mention)
//   })
// })
//
//
// function respond(mention) {
//   var status = 'Hi @' + mention.user.screen_name
//   console.log('Going to respond with this:', status);
//   // T.post('statuses/update', { status: status }, function(err, data, response) {
//   //   if (err) console.log('There was an error posting the tweet', err)
//   // })
// }
