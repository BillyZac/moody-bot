var webshot = require('webshot')

var imageUrl = 'https://moodymeeks.firebaseapp.com/personality.html'

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

function takeScreenshot() {
  return new Promise(function(resolve, reject) {
    var fileName = 'images/' + Date.now() + '.png'
    webshot(imageUrl, fileName, options, function(error) {
      if (error) reject(error)
      resolve(fileName)
    })
  })
}

module.exports = takeScreenshot
