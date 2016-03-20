var webshot = require('webshot')

var baseImageUrl = 'https://moodymeeks.firebaseapp.com/'

var options = {
  screenSize: {
    width: 800,
    height: 800
  },
  shotSize: {
    width: 800,
    height: 800
  },
  shotOffset: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }
}

function takeScreenshot(personality) {
  // Set url params, which affect the visualization
  var imageUrl = baseImageUrl + getUrlParams(personality)
  console.log('Getting image from here:', imageUrl);

  return new Promise(function(resolve, reject) {
    var fileName = 'images/' + Date.now() + '.png'
    webshot(imageUrl, fileName, options, function(error) {
      if (error) reject(error)
      resolve(fileName)
    })
  })
}

module.exports = takeScreenshot


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
