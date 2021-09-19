let GUI_VISIBLE = true
let GUI_WIDTH = 200
let GUI_PADDING = 10

let GUI_BACKGROUND
let GUI_PARTICLES
let GUI_WAVE

let ICON_INFO
let ICON_PLAY

let AUDIO

let BACKGROUND
let PARTICLE_EMITTER
let WAVE

let HALF_HEIGHT
let HALF_WIDTH

// Load assets before running setup()
function preload() {
  AUDIO = new Audio()
  BACKGROUND = new Background()

  ICON_INFO = loadImage('assets/icons8-info-30.png')
  ICON_PLAY = loadImage('assets/icons8-circled-play-30.png')
}

// Initialise canvas and globals
function setup() {

  createCanvas(windowWidth, windowHeight)
  
  // TODO are these globals needed
  HALF_HEIGHT = height / 2
  HALF_WIDTH = width / 2
  SPACE_BETWEEN_LINES = width / 128 // TODO: Add to bar wave class

  setupGui()

  angleMode(DEGREES)
  imageMode(CENTER)
  rectMode(CENTER)

  PARTICLE_EMITTER = setParticleEmitter({value: PARTICLE_TYPES[0]})
  WAVE = setWave({value: WAVE_TYPES[0]})

}

// Initialise GUIs
// TODO: Add to respective classes
function setupGui() {

  GUI_WAVE = createGui("Wave")
  GUI_WAVE.setPosition(GUI_PADDING, GUI_PADDING)
  GUI_WAVE.prototype.addDropDown('type', WAVE_TYPES, setWave)
  GUI_WAVE.addObject(WAVE_CONFIG)

  GUI_PARTICLES = createGui("Particles")
  GUI_PARTICLES.setPosition(GUI_WIDTH + 2*GUI_PADDING, GUI_PADDING)
  GUI_PARTICLES.prototype.addDropDown('type', PARTICLE_TYPES, setParticleEmitter)
  GUI_PARTICLES.addObject(PARTICLE_CONFIG)

  GUI_BACKGROUND = createGui("Background")
  GUI_BACKGROUND.setPosition(2*GUI_WIDTH+ 3*GUI_PADDING, GUI_PADDING)
  GUI_BACKGROUND.addObject(BG_CONFIG)

  // TODO credit icons8.com for icon
  PLAY_BUTTON = createButton('Play')
  PLAY_BUTTON.position(HALF_WIDTH - PLAY_BUTTON.width / 2, HALF_HEIGHT - PLAY_BUTTON.height / 2)
  PLAY_BUTTON.mousePressed(playButtonPressed)

}

// Called every frame
function draw() {

  AUDIO.update()

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

// Handle key presses
function keyPressed() {
  switch(key) {
    case 'p':
    case ' ':
      playButtonPressed()
      break
    case 'h':
      toggleGui()
      break
    case 'r':
      BACKGROUND.setImage()
      break
  }
}

// Handle toggling song and GUI
function playButtonPressed() {
  if (AUDIO.togglePlay()) {
    if (GUI_VISIBLE) {
      toggleGui()
    }
    PLAY_BUTTON.hide()
  } else {
    if (!GUI_VISIBLE) {
      toggleGui()
    }
    PLAY_BUTTON.show()
  }
}

// Switch GUIs on and off
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
