var Twit = require('twit')

require('dotenv').config()

var T = new Twit({
 consumer_key: process.env.CONSUMER_KEY,
 consumer_secret: process.env.CONSUMER_SECRET,
 access_token: process.env.ACCESS_TOKEN_KEY,
 access_token_secret: process.env.ACCESS_TOKEN_SECRET,
 timeout_ms: 60*1000
})

T.get('statuses/mentions_timeline', function(err, mentions) {
  console.log('There was an error getting the mentions', err)
  mentions.forEach(function(mention) {
    console.log(mention.text);
    console.log(mention.user.screen_name);
    var status = 'Hi @' + mention.user.screen_name
    T.post('statuses/update', { status: status }, function(err, data, response) {
      if (err) console.log('There was an error posting the tweet', err)
    })
  })
})
