let GUI_VISIBLE = true
let GUI_WIDTH = 200
let GUI_PADDING = 10

// SONG

let SONG
let SONG_URL = 'assets/Catmosphere - Candy-Coloured Sky.mp3'

let FFT
let FFT_SMOOTHING = 0.3

var PLAY_BUTTON

// WAVE

let GUI_WAVE

let waveParamsPreset = {
  smooth: 1
}

let waveParams = {

  type: ['bars', 'ring', 'line', 'none'],

  weight: 3,
  weightMin: 1,
  weightMax: 10,

  color: [17, 255, 238],

  ringRadius: 200,
  ringRadiusMin: 1,
  ringRadiusMax: 500,

  lineBase: 0,
  lineBaseMin: -500,
  lineBaseMax: 500,
 
  waveHeight: 50,
  waveHeightMin: 1,
  waveHeightMax: 500,

  barType: ['vLines', 'hLines']

}
let SPACE_BETWEEN_LINES

// PARTICLES

let GUI_PARTICLES

var PARTICLES = []

let particleParamsPreset = {
  accMin: 0.00001,
  accMax: 0.0001,
  velMax: 3
}

let particleParams = {
  
  on: true,
  
  size: 5,
  sizeMin: 1,
  sizeMax: 10,

  color: [255, 17, 153],

  frequency: 5,
  frequencyMin: 1,
  frequencyMax: 10,

  life: 255,
  lifeMin: 127,
  lifeMax: 1027,

  horizontalAcceleration: 50

}

// BACKGROUND

let GUI_BACKGROUND

let BG

let bgParamsPreset = {
  bassFreqMin: 20,
  bassFreqMax: 200,
  shakeAmpMin: 250,
  blur: 12
}

let bgParams = {
  shake: 0.1,
  shakeMin: 0,
  shakeMax: 2,
  shakeStep: 0.1,

  zoom: 100,
  zoomMin: 0,
  zoomMax: 500,

  fade: true,

  url: 'https://images.pexels.com/photos/2763927/pexels-photo-2763927.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
}
let BG_PREV = bgParams.url

var HALF_HEIGHT
var HALF_WIDTH


function preload() {
  SONG = loadSound(SONG_URL)
  BG = loadImage(bgParams.url)
}


function setup() {

  createCanvas(windowWidth, windowHeight)
  HALF_HEIGHT = height / 2
  HALF_WIDTH = width / 2
  SPACE_BETWEEN_LINES = width / 128

  setupGui()

  angleMode(DEGREES)
  imageMode(CENTER)
  rectMode(CENTER)

  FFT = new p5.FFT(FFT_SMOOTHING)

  BG.filter(BLUR, bgParamsPreset.blur)

}


function draw() {

  background(0)

  var spectrum = FFT.analyze()
  var wave = FFT.waveform()
  var amp = FFT.getEnergy(bgParamsPreset.bassFreqMin, bgParamsPreset.bassFreqMax) // Returns 0-255 based on amplitude between 2 frequencies

  translate(HALF_WIDTH, HALF_HEIGHT) // Draw relative to the center of the window

  // Shakes background slightly on higher amplitudes
  push()
  if(amp > bgParamsPreset.shakeAmpMin && bgParams.shake > 0) {
    rotate(random(-bgParams.shake, bgParams.shake))
  }
  image(BG, 0, 0, width + bgParams.zoom * 1.6, height + bgParams.zoom * 0.9)
  pop()

  // Applies an alpha layer over the background image
  // Dynamically fades background on lower amplitudes
  if(bgParams.fade) {
    fadeBackground(amp)
  }

  // Displays waveform as a ring
  // Particles are a child of this element
  if(waveParams.type == 'ring') {

    // Displays fading particles emerging from circle waveform
    if (particleParams.on) {
      if (SONG.isPlaying()) {
        for (var i = 0; i < particleParams.frequency; i++) {
          PARTICLES.push(starwarsParticle(waveParams.ringRadius))
        }
      }
      for (var i = PARTICLES.length - 1; i >= 0; i--) {
        if (!PARTICLES[i].isOutOfBounds(HALF_WIDTH, HALF_HEIGHT)) {
          PARTICLES[i].update(amp)
          PARTICLES[i].show()
        } else {
          PARTICLES.splice(i, 1)
        }
      }
    }

    push()

    stroke(waveParams.color)
    strokeWeight(waveParams.weight)
    noFill()
  
    for (var t = -1; t <=1; t += 2) { // Loop for each semi-circle
      beginShape()
      for (var i = 0; i <= 180; i += waveParamsPreset.smooth) {
        var index = floor(map(i, 0, 180, 0, wave.length - 1))
        var r = map(wave[index], -1, 1, waveParams.ringRadius - waveParams.waveHeight, waveParams.ringRadius + waveParams.waveHeight) + amp
        var x = r * sin(i) * t
        var y = r * cos(i)
        vertex(x, y)
      }
      endShape()
    }
  
    pop()

  } else if(waveParams.type == 'line') {

    // Displays fading particles emerging from edge of screen
    if (particleParams.on) {
      if (SONG.isPlaying()) {
        for (var i = 0; i < particleParams.frequency; i++) {
          PARTICLES.push(horizontalParticle(-HALF_WIDTH))
        }
      }
      for (var i = PARTICLES.length - 1; i >= 0; i--) {
        if (!PARTICLES[i].isOutOfBounds(HALF_WIDTH, HALF_HEIGHT)) {
          PARTICLES[i].update(amp)
          PARTICLES[i].show()
        } else {
          PARTICLES.splice(i, 1)
        }
      }
    }
    
    push()

    stroke(waveParams.color)
    strokeWeight(waveParams.weight)
    noFill()
  
    beginShape()
    for (var i = 0; i <= width; i += waveParamsPreset.smooth) {
      var index = floor(map(i, 0, width, 0, wave.length - 1))
      var r = map(wave[index], -1, 1, waveParams.lineBase - waveParams.waveHeight, waveParams.lineBase + waveParams.waveHeight)
      var x = i - HALF_WIDTH
      var y = r
      vertex(x, y)
    }
    endShape()
  
    pop()
  } else if(waveParams.type == 'bars') {

    // Credit https://nishanc.medium.com/audio-visualization-in-javascript-with-p5-js-cf3bc7f1be07

    push()

    translate(-HALF_WIDTH, -HALF_HEIGHT)

    for (let i = 0; i < spectrum.length; i++) {
      stroke(waveParams.color)
      let y = map(spectrum[i], 0, 256, height, 0)
      if (waveParams.barType == 'vLines') {
        line(i * SPACE_BETWEEN_LINES, height, i * SPACE_BETWEEN_LINES, y)
      } else if (waveParams.barType == 'hLines') {
        line(width - (i * SPACE_BETWEEN_LINES), y, SPACE_BETWEEN_LINES, height - y) // TODO: BROKEN
      }
    }

    pop()

  }

}


function keyPressed() {
  switch(key) {
    case 'p':
    case ' ':
      togglePlay()
      break
    case 'h':
      toggleGui()
      break
    case 'r':
      reloadBackground()
      break
  }
}


function togglePlay() {
  if (SONG.isPlaying()) {
    SONG.pause()
    PLAY_BUTTON.show()
    noLoop()
  }
  else {
    SONG.play()
    PLAY_BUTTON.hide()
    loop()
  }
}


function setupGui() {

  GUI_WAVE = createGui("Wave")
  GUI_WAVE.setPosition(GUI_PADDING, GUI_PADDING)
  GUI_WAVE.addObject(waveParams)

  GUI_PARTICLES = createGui("Particles")
  GUI_PARTICLES.setPosition(GUI_WIDTH + 2*GUI_PADDING, GUI_PADDING)
  GUI_PARTICLES.addObject(particleParams)

  GUI_BACKGROUND = createGui("Background")
  GUI_BACKGROUND.setPosition(2*GUI_WIDTH+ 3*GUI_PADDING, GUI_PADDING)
  GUI_BACKGROUND.addObject(bgParams)

  PLAY_BUTTON = createButton('Play')
  PLAY_BUTTON.position(HALF_WIDTH - PLAY_BUTTON.width / 2, HALF_HEIGHT - PLAY_BUTTON.height / 2)
  PLAY_BUTTON.mousePressed(togglePlay)

}


function toggleGui() { 
  if (GUI_VISIBLE) {
    GUI_WAVE.show()
    GUI_PARTICLES.show()
    GUI_BACKGROUND.show()
  } else {
    GUI_WAVE.hide()
    GUI_PARTICLES.hide()
    GUI_BACKGROUND.hide()
  }
  GUI_VISIBLE = !GUI_VISIBLE
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  BG = loadImage(bgParams.url, function() {
    BG.filter(BLUR, bgParamsPreset.blur)
    image(BG, 0, 0, width + bgParams.zoom * 1.6, height + bgParams.zoom * 0.9)
  })
  HALF_HEIGHT = height / 2
  HALF_WIDTH = width / 2
}


function fadeBackground(amp) {
  var alpha = map(amp, 0, 255, 180, 150)
  fill(0, alpha)
  rect(0, 0, width, height)
}


function reloadBackground() {
  if(bgParams.url != prevBgUrl) {
    BG = loadImage(bgParams.url, function() {
      BG.filter(BLUR, bgParamsPreset.blur)
      image(BG, 0, 0, width + bgParams.zoom * 1.6, height + bgParams.zoom * 0.9)
    })
    prevBgUrl = bgParams.url
  }
}
