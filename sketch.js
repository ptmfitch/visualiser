let GUI_VISIBLE = true
let GUI_WIDTH = 200
let GUI_PADDING = 10

// SONG

let SONG
let SONG_URL = 'assets/Catmosphere - Candy-Coloured Sky.mp3'

let FFT
let FFT_SMOOTHING = 0.3

let SPECTRUM
let WAVEFORM
let BASS_AMP

let PLAY_BUTTON

// BACKGROUND

let GUI_BACKGROUND

let BG

let BG_PARAMS_PRESET = {
  bassFreqMin: 90,
  bassFreqMax: 200,
  shakeAmpMin: 250,
  blur: 12
}

let BG_PARAMS = {
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
let BG_PREV = BG_PARAMS.url

let HALF_HEIGHT
let HALF_WIDTH


function preload() {
  SONG = loadSound(SONG_URL)
  BG = loadImage(BG_PARAMS.url)
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

  BG.filter(BLUR, BG_PARAMS_PRESET.blur)

  resetParticleEmitter({value: PARTICLE_TYPES[0]})
  resetWave({value: WAVE_TYPES[0]})

  noLoop()

}


function draw() {

  background(0)

  SPECTRUM = FFT.analyze()
  WAVEFORM = FFT.waveform()
  BASS_AMP = FFT.getEnergy(BG_PARAMS_PRESET.bassFreqMin, BG_PARAMS_PRESET.bassFreqMax) // Returns 0-255 based on amplitude between 2 frequencies

  translate(HALF_WIDTH, HALF_HEIGHT) // Draw relative to the center of the window

  // Shakes background slightly on higher amplitudes
  push()
  if(BASS_AMP > BG_PARAMS_PRESET.shakeAmpMin && BG_PARAMS.shake > 0) {
    rotate(random(-BG_PARAMS.shake, BG_PARAMS.shake))
  }
  image(BG, 0, 0, width + BG_PARAMS.zoom * 1.6, height + BG_PARAMS.zoom * 0.9)
  pop()

  // Applies an alpha layer over the background image
  // Dynamically fades background on lower amplitudes
  if(BG_PARAMS.fade) {
    fadeBackground(BASS_AMP)
  }

  if (PARTICLE_EMITTER) {
    PARTICLE_EMITTER.update()
    PARTICLE_EMITTER.show()
  }

  if (WAVE) {
    WAVE.update()
    WAVE.show()
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
    if (!GUI_VISIBLE) {
      toggleGui()
    }
    PLAY_BUTTON.show()
    noLoop()
  }
  else {
    SONG.play()
    if (GUI_VISIBLE) {
      toggleGui()
    }
    PLAY_BUTTON.hide()
    loop()
  }
}


function setupGui() {

  GUI_WAVE = createGui("Wave")
  GUI_WAVE.setPosition(GUI_PADDING, GUI_PADDING)
  GUI_WAVE.prototype.addDropDown('type', WAVE_TYPES, resetWave)
  GUI_WAVE.addObject(WAVE_PARAMS)

  GUI_PARTICLES = createGui("Particles")
  GUI_PARTICLES.setPosition(GUI_WIDTH + 2*GUI_PADDING, GUI_PADDING)
  GUI_PARTICLES.prototype.addDropDown('type', PARTICLE_TYPES, resetParticleEmitter)
  GUI_PARTICLES.addObject(PARTICLE_PARAMS)

  GUI_BACKGROUND = createGui("Background")
  GUI_BACKGROUND.setPosition(2*GUI_WIDTH+ 3*GUI_PADDING, GUI_PADDING)
  GUI_BACKGROUND.addObject(BG_PARAMS)

  PLAY_BUTTON = createButton('Play')
  PLAY_BUTTON.position(HALF_WIDTH - PLAY_BUTTON.width / 2, HALF_HEIGHT - PLAY_BUTTON.height / 2)
  PLAY_BUTTON.mousePressed(togglePlay)

}


function toggleGui() { 
  if (!GUI_VISIBLE) {
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


// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight)
//   BG = loadImage(BG_PARAMS.url, function() {
//     BG.filter(BLUR, BG_PARAMS_PRESET.blur)
//     image(BG, 0, 0, width + BG_PARAMS.zoom * 1.6, height + BG_PARAMS.zoom * 0.9)
//   })
//   HALF_HEIGHT = height / 2
//   HALF_WIDTH = width / 2
// }


function fadeBackground(amp) {
  var alpha = map(amp, 0, 255, 180, 150)
  fill(0, alpha)
  rect(0, 0, width, height)
}


function reloadBackground() {

  // windowResized() temporarily moved here because it slows everything down...
  resizeCanvas(windowWidth, windowHeight)
  BG = loadImage(BG_PARAMS.url, function() {
    BG.filter(BLUR, BG_PARAMS_PRESET.blur)
    image(BG, 0, 0, width + BG_PARAMS.zoom * 1.6, height + BG_PARAMS.zoom * 0.9)
  })
  HALF_HEIGHT = height / 2
  HALF_WIDTH = width / 2

  if(BG_PARAMS.url != prevBgUrl) {
    BG = loadImage(BG_PARAMS.url, function() {
      BG.filter(BLUR, BG_PARAMS_PRESET.blur)
      image(BG, 0, 0, width + BG_PARAMS.zoom * 1.6, height + BG_PARAMS.zoom * 0.9)
    })
    prevBgUrl = BG_PARAMS.url
  }

}
