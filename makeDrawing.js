const Canvas = require('canvas')
const fs = require('fs')

const width = 800
const height = 800
const canvas = new Canvas(width, height, 'png');
var ctx = canvas.getContext('2d');

module.exports = makeDrawing

function makeDrawing(frequency, amplitude) {

  return new Promise(function(resolve, reject) {

    for (var t = 0; t < 1000; t+= 1) {
      var hue = x1(t) % 360
      var color = 'hsla(' + hue + ', 100%, 50%, 0.1)'
      drawLine(x1(t), y1(t), x2(t), y2(t), color)
      // drawPoint([x1(t), y1(t)], color)
    }

    var pathName =
      ['./drawings/',
       'drawing-',
       Date.now(),
       '.png'].join('')

    fs.writeFile(pathName, canvas.toBuffer(), function() {
      resolve(pathName)
    })
  })

  ////////
  function x1(t) {
    var x = Math.sin(t / frequency) * amplitude +
            Math.sin(t / 5) * 200
    return x
  }

  function y1(t) {
    var f = frequency / 10
    var y = Math.cos(t / f) * amplitude
    return y
  }

  function x2(t) {
    var f = frequency / 10
    var a = amplitude * 2
    var x = Math.sin(t / f) * a +
            Math.sin(t) * 2
    return x
  }

  function y2(t) {
    var f = frequency / 5
    var a = amplitude * 2
    var y = Math.cos(t / f) * a +
            Math.cos(t / 12) * 20
    return y
  }

  function drawPoint(points, color) {
    var translatedPoints = points.map(function(coord) {
      return coord + width / 2
    })
    ctx.fillStyle = color || 'black'
    ctx.beginPath();
    ctx.rect(translatedPoints[0], translatedPoints[1], 5, 5);
    ctx.fill();
  }

  function drawLine(x1, y1, x2, y2, color) {
    color = color || 'black'
    ctx.beginPath();
    ctx.moveTo(xScale(x1), yScale(y1));
    ctx.lineTo(xScale(x2), yScale(y2));
    ctx.strokeStyle = color
    ctx.lineWidth = 10
    ctx.stroke();
  }

  function xScale(x) {
    return x + width / 2
  }

  function yScale(y) {
    return y + width / 2
  }
}
