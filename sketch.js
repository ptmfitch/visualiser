let GUI_VISIBLE = true
let GUI_WIDTH = 200
let GUI_PADDING = 10

let BACKGROUND
let PARTICLE_EMITTER
let WAVE


// SONG

let SONGS = [
  'Catmosphere - Candy-Coloured Sky.mp3',
  'JJD - A New Adventure (feat. Molly Ann) [NCS Release].mp3',
  'Papa Khan - Wounds [NCS Release].mp3',
  'Rival - Throne (ft. Neoni) (Lost Identities Remix) [NCS Release].mp3'
]
let SONG
let SONG_URL

let FFT
let FFT_SMOOTHING = 0.3

let SPECTRUM
let WAVEFORM
let BASS_AMP

let PLAY_BUTTON

let HALF_HEIGHT
let HALF_WIDTH


function preload() {
  SONG_URL = 'assets/' + random(SONGS)
  SONG = loadSound(SONG_URL)
  IMAGE = loadImage(BG_CONFIG.url)
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

  IMAGE.filter(BLUR, BG_PRESET.blur)

  setBackground()
  setParticleEmitter({value: PARTICLE_TYPES[0]})
  setWave({value: WAVE_TYPES[0]})

  noLoop()

}


function draw() {

  SPECTRUM = FFT.analyze()
  WAVEFORM = FFT.waveform()
  BASS_AMP = FFT.getEnergy(BG_PRESET.bassFreqMin, BG_PRESET.bassFreqMax) // Returns 0-255 based on amplitude between 2 frequencies

  translate(HALF_WIDTH, HALF_HEIGHT) // Draw relative to the center of the window, easier for centred drawing

  if (BACKGROUND) {
    BACKGROUND.update()
    BACKGROUND.show()
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
      BACKGROUND.setImage()
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
  GUI_WAVE.prototype.addDropDown('type', WAVE_TYPES, setWave)
  GUI_WAVE.addObject(WAVE_PARAMS)

  GUI_PARTICLES = createGui("Particles")
  GUI_PARTICLES.setPosition(GUI_WIDTH + 2*GUI_PADDING, GUI_PADDING)
  GUI_PARTICLES.prototype.addDropDown('type', PARTICLE_TYPES, setParticleEmitter)
  GUI_PARTICLES.addObject(PARTICLE_CONFIG)

  GUI_BACKGROUND = createGui("Background")
  GUI_BACKGROUND.setPosition(2*GUI_WIDTH+ 3*GUI_PADDING, GUI_PADDING)
  GUI_BACKGROUND.addObject(BG_CONFIG)

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
