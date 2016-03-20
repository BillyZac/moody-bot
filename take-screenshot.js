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

function takeScreenshot(yFactor, emotionality) {
  yFactor = yFactor || 0
  emotionality = emotionality || 0
  // Set url params, which affect the visualization
  var imageUrl =
    [ baseImageUrl,
      '?',
      'yFactor=',
      yFactor,
      '&',
      'emotionality=',
      emotionality
    ].join('')
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
