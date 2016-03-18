var Twit = require('twit')
var makeDrawing = require('./makeDrawing')
var fs = require('fs')
var unirest = require('unirest')
var dbUrl = process.env.MONGOLAB_URI || 'localhost/twitter_bot'
var db = require('monk')(dbUrl)

var responseCollection = db.get('responses')

require('dotenv').config()

var online = process.env.APP_ONLINE || false

var T = new Twit({
 consumer_key: process.env.CONSUMER_KEY,
 consumer_secret: process.env.CONSUMER_SECRET,
 access_token: process.env.ACCESS_TOKEN_KEY,
 access_token_secret: process.env.ACCESS_TOKEN_SECRET,
 timeout_ms: 60*1000
})

T.get('statuses/mentions_timeline', function(err, mentions) {
  if (err) { console.log('There was an error getting the mentions', err) }

  mentions.forEach(function(mention) {
    console.log('Got a mention:', mention.text)

    responseCollection.find({ "original_mention_id": mention.id }).then(function(result) {
      if (result.length > 0) {
        console.log('Mention is in the DB, so not responding:');
        console.log(mention.id);
      } else {
        console.log('Mention is not in the DB.');
        if (online === 'online') {
          console.log('Going to respond', 'Online:', online);
          respond(mention)
        } else {
          console.log('Not going to respond', 'Online:', online);
        }
      }
    })
  })
})


function respond(mention) {
  // Fake the input for the image generation.
  // This will eventually come from the personality profile data.
  var frequency = Math.random() * 100

  unirest.get('https://personality.herokuapp.com/:' + mention.user.screen_name)
  .end(function(response) {
    var personality = response.body
    // console.log(personality.traits[0].children[2].name)
    var emotionality = Math.trunc(parseFloat(personality.traits[0].children[2].percentage) * 10)
    console.log(emotionality);
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

          // Construct a message to the mentioner
          // Using #user instead of @user to avoid violating Twitter's TOS
          var status =
          [
            '#',
            mention.user.screen_name,
            ' ',
            'I\'d rate you a ',
            emotionality,
            ' out of ten in terms of emotionality.'
          ].join('')


          var params = {
            status: status,
            // media_ids: [mediaIdStr]
          }

          params.status = 'Little cows make puppy chow.'

          T.post('statuses/update', params, function (error, data, response) {
            if (error) {
              console.log('There was an error posting to Twitter:', error)
            } else {
              console.log('Successfully posted.')
              var responseToMention = {
                original_mention_id: mention.id,
                response_id: data.id
              }
              console.log('To save to DB:', responseToMention);
              responseCollection.insert(responseToMention)
            }
            db.close()
          })
        })
    })
  })
}
