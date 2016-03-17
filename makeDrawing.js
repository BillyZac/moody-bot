module.exports = makeDrawing

function makeDrawing(frequency, amplitude) {
  return new Promise(function(resolve, reject) {
    // Pretend we created this image
    var pathName = './drawing.png'
    // Return the path to the image
    resolve(pathName)
  })
}
