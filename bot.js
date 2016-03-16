var moment = require('moment')
var Twit = require('twit')


require('dotenv').config()

var T = new Twit({
 consumer_key: process.env.CONSUMER_KEY,
 consumer_secret: process.env.CONSUMER_SECRET,
 access_token: process.env.ACCESS_TOKEN_KEY,
 access_token_secret: process.env.ACCESS_TOKEN_SECRET,
 timeout_ms: 60*1000
})

var now = moment()
// console.log(now);

setInterval(function() {

  T.get('statuses/mentions_timeline', function(err, mentions) {
    if (err) { console.log('There was an error getting the mentions', err) }

    mentions.forEach(function(mention) {
      // if the mention is newer than lastPostingTime, respond
      console.log('Got a mention at ', moment(mention.created_at).format('dddd, h:mm:ss'))
      respond(mention)

    })
  })
}, 240 * 1000)

function respond(mention) {
  var status = 'Hi @' + mention.user.screen_name
  console.log('Going to respond with this:', status);
  // T.post('statuses/update', { status: status }, function(err, data, response) {
  //   if (err) console.log('There was an error posting the tweet', err)
  // })
}
