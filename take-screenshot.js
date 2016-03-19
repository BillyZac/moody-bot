var webshot = require('webshot')

var options = {
  screenSize: {
    width: 1024,
    height: 800
  },
  shotSize: {
    width: 400,
    height: 400
  },
  shotOffset: {
    left: 0,
    right: 0,
    top: 100,
    bottom: 0
  }
}

function takeScreenshot() {
  return new Promise(function(resolve, reject) {
    var fileName = 'images/' + Date.now() + '.png'
    webshot('flickr.com', fileName, options, function(error) {
      if (error) reject(error)
      resolve(fileName)
    })
  })
}

module.exports = takeScreenshot
