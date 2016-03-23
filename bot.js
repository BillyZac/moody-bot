var Twit = require('twit')
// var makeDrawing = require('./makeDrawing')
var fs = require('fs')
var unirest = require('unirest')
var dbUrl = process.env.MONGOLAB_URI || 'localhost/twitter_bot'
var db = require('monk')(dbUrl)
var takeScreenshot = require('./take-screenshot')

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

if (online === 'online') {
  T.get('statuses/mentions_timeline', function(err, mentions) {
    if (err) { console.log('There was an error getting the mentions', err) }

    mentions.forEach(function(mention) {
      console.log('Got a mention:', mention.text)

      responseCollection
      .find({ "original_mention_id": mention.id })
      .then(function(result) {
        // If the mention has not already received a response, respond
        if (result.length === 0) {
          console.log('Going to respond to', mention.text);
          respond(mention)
        } else {
          console.log('Not to responding to', mention.text);
        }
      })
    })
  })
}

function respond(mention) {
  unirest.get('https://personality.herokuapp.com/:' + mention.user.screen_name)
  .end(function(response) {
    ///////////////////////////////////////
    var watsonPersonality = response.body
    console.log(watsonPersonality);

    var personality = {
      openness: getTraitPercentage(0, watsonPersonality),
      conscientiousness: getTraitPercentage(1, watsonPersonality),
      extraversion: getTraitPercentage(2, watsonPersonality),
      agreeableness: getTraitPercentage(3, watsonPersonality),
      neuroticism: getTraitPercentage(0, watsonPersonality),
      emotionality: getEmotionality(watsonPersonality) // Special case -- nested under Openness
    }

    ///////////////////////////////////////


    // Make the image
    var yFactor = 4 // Expects 0 - 8 TODO: Expect 0 - 100
    // emotionality = 40
    takeScreenshot(personality)
    .then(function(filePath) {
      // Read the image file
      var b64content = fs.readFileSync(filePath, { encoding: 'base64' })

      // Upload the image to Twitter
      T.post('media/upload', { media_data: b64content }, function (err, data, response) {

        var status = [
          '@',
          mention.user.screen_name,
          ' ',
          'I drew a picture of you!',
          ' ',  
          'https://moodymeeks.firebaseapp.com/',
          getUrlParams(personality)
        ].join('')

        // Post a tweet with a reference to the image file
        var mediaIdStr = data.media_id_string

        var params = {
            status: status,
            media_ids: [mediaIdStr]
          }

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
        })
      })
    })
  })
}

// Take a personality result from Watson,
// Return a personality score ranging from 0 - 100
function getEmotionality(personality) {
  var emotionality = 0 // Default value
  // In Watson's representation of the Big Five system
  // The first element in Traits is Openness
  // The third element in Openness is Emotionality
  var value = Math.trunc(parseFloat(personality.traits[0].children[2].percentage) * 100)
  if (value >= 0 || value <= 100) {
    emotionality = value
  }
  return emotionality
}

function getTraitPercentage(index, personality) {
  var traitPercentage = 0 // Default value
  var value = Math.trunc(parseFloat(personality.traits[index].percentage) * 100)
  if (value >= 0 || value <= 100) {
    traitPercentage = value
  }
  return traitPercentage
}

function getCompliment() {
  var comment = ''

  var compliments =
    [
      'You\'re a peach.',
      'Ima like u.',
      'Luv it or shove it.',
      'Yes, I\'ve got a lot going on, but I\'m never too busy for you.',
      'Can I have that recipe?',
      'I was just thinking about you.',
      'When I grow up, I want to be you.',
      'John Hollowlegs is knocking on my door.',
      'Happy cabbage burning a hole in my pocket!',
      'Oy, I got the zings.'
    ]

  var index = Math.trunc((Math.random() * 10))
  comment = compliments[index] || 'Hm, maybe not.'
  index = Math.trunc((Math.random() * 10))
  comment += ' ' + compliments[index] || 'Hm, maybe not.'

  return comment
}

function getUrlParams(personality) {
  var urlParams =
  [
    '?',
    'openness=',
    personality.openness,
    '&',
    'conscientiousness=',
    personality.conscientiousness,
    '&',
    'extraversion=',
    personality.extraversion,
    '&',
    'agreeableness=',
    personality.agreeableness,
    '&',
    'neuroticism=',
    personality.neuroticism,
    '&',
    'emotionality=',
    personality.emotionality
  ].join('')
  return urlParams
}
