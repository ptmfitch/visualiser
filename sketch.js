// Peter Fitch
// Audio Visualisation

let GUI_VISIBLE = true
let GUI_WIDTH = 200
let GUI_PADDING = 10
const GUI_IDLE_HIDE_MS = 2000
let lastMouseActivityMs = 0

let GUI_BACKGROUND
let GUI_PARTICLES
let GUI_WAVE
let GUI_EXPORT

let PLAY_BUTTON

let ICON_INFO

let AUDIO
let VIDEO_EXPORT
let RECORDING_LOCK = false
let GUI_VISIBLE_BEFORE_EXPORT = false
let PLAY_BUTTON_VISIBLE_BEFORE_EXPORT = false

let EXPORT_CONFIG = {
  duration: 'Full song',
  clipSeconds: 30,
  clipSecondsMin: 5,
  clipSecondsMax: 120,
}

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
}

// Initialise canvas and globals
function setup() {

  createCanvas(windowWidth, windowHeight)
  
  HALF_HEIGHT = height / 2
  HALF_WIDTH = width / 2
  SPACE_BETWEEN_LINES = width / 128 // TODO: Add to bar wave class

  setupGui()
  setupExportPanel()

  angleMode(DEGREES)
  imageMode(CENTER)
  rectMode(CENTER)

  setParticleEmitter({value: PARTICLE_TYPES[0]})

  lastMouseActivityMs = millis()
  document.addEventListener('mousemove', onMouseActivity)

}

// Initialise GUIs
function setupGui() {

  // TODO Create editor mode/viewer mode

  setupWaveGui()

  GUI_PARTICLES = createControlPanel("Particles", GUI_WIDTH + 2 * GUI_PADDING, GUI_PADDING)
  GUI_PARTICLES.addDropDown('type', PARTICLE_TYPES, setParticleEmitter)
  GUI_PARTICLES.addObject(PARTICLE_CONFIG)

  setupBackgroundGui()

  // TODO credit icons8.com for icon
  PLAY_BUTTON = createButton('Play')
  PLAY_BUTTON.position(HALF_WIDTH - PLAY_BUTTON.width / 2, HALF_HEIGHT - PLAY_BUTTON.height / 2)
  PLAY_BUTTON.mousePressed(playButtonPressed)

}

function setupExportPanel() {
  GUI_EXPORT = createControlPanel('Export', 3 * GUI_WIDTH + 4 * GUI_PADDING, GUI_PADDING)
  GUI_EXPORT.addDropDown('duration', EXPORT_DURATION_OPTIONS, onExportDurationChange)
  GUI_EXPORT.bindRange(
    'clipSeconds',
    EXPORT_CONFIG.clipSecondsMin,
    EXPORT_CONFIG.clipSecondsMax,
    EXPORT_CONFIG.clipSeconds,
    1,
    EXPORT_CONFIG
  )
  GUI_EXPORT.setControlVisibility('clipSeconds', false)
  GUI_EXPORT.addButton('Export MP4', exportButtonPressed)
  GUI_EXPORT.addButton('Stop', stopExportPressed)
  GUI_EXPORT.setControlVisibility('Stop', false)
  GUI_EXPORT.addText('status', 'Ready')

  VIDEO_EXPORT = new VideoExporter(AUDIO, function () {
    return document.querySelector('canvas')
  })
  VIDEO_EXPORT.onStatusChange = function (status) {
    GUI_EXPORT.setValue('status', status)
  }
  VIDEO_EXPORT.onRecordingStart = onExportRecordingStart
  VIDEO_EXPORT.onRecordingEnd = onExportRecordingEnd
}

function onExportDurationChange(qs) {
  EXPORT_CONFIG.duration = qs.value
  GUI_EXPORT.setControlVisibility('clipSeconds', qs.value === 'Fixed length')
}

async function exportButtonPressed() {
  if (VIDEO_EXPORT.isBusy()) {
    return
  }
  if (!AUDIO.isLoaded()) {
    GUI_EXPORT.setValue('status', 'Error: Audio not loaded')
    return
  }

  const mode = exportModeFromLabel(EXPORT_CONFIG.duration)
  GUI_EXPORT.setControlVisibility('Stop', mode === EXPORT_MODES.MANUAL)

  try {
    await VIDEO_EXPORT.start(mode, EXPORT_CONFIG.clipSeconds)
  } catch (err) {
    GUI_EXPORT.setValue('status', 'Error: ' + err.message)
    onExportRecordingEnd()
  }
}

function stopExportPressed() {
  VIDEO_EXPORT.requestStop()
}

function onExportRecordingStart() {
  RECORDING_LOCK = true
  GUI_VISIBLE_BEFORE_EXPORT = GUI_VISIBLE
  PLAY_BUTTON_VISIBLE_BEFORE_EXPORT = PLAY_BUTTON.elt.style.display !== 'none'
  GUI_WAVE.hide()
  GUI_PARTICLES.hide()
  GUI_BACKGROUND.hide()
  GUI_VISIBLE = false
  PLAY_BUTTON.hide()
}

function onExportRecordingEnd() {
  RECORDING_LOCK = false
  GUI_EXPORT.setControlVisibility('Stop', false)
  if (GUI_VISIBLE_BEFORE_EXPORT) {
    showGui()
  } else {
    GUI_EXPORT.show()
  }
  if (PLAY_BUTTON_VISIBLE_BEFORE_EXPORT) {
    PLAY_BUTTON.show()
  }
}

function setupWaveGui() {
  GUI_WAVE = createControlPanel("Wave", GUI_PADDING, GUI_PADDING)
  GUI_WAVE.addBoundDropDown('type', WAVE_TYPE_OPTIONS, WAVE_CONFIG, onWaveConfigChange)
  GUI_WAVE.addBoundDropDown('style', WAVE_STYLE_OPTIONS, WAVE_CONFIG, onWaveConfigChange)
  GUI_WAVE.addBoundDropDown('direction', WAVE_DIRECTION_OPTIONS, WAVE_CONFIG, onWaveConfigChange)
  GUI_WAVE.addBoundDropDown('colourMode', WAVE_COLOUR_OPTIONS, WAVE_CONFIG, onWaveConfigChange)
  GUI_WAVE.syncDropDown('type', WAVE_TYPE_OPTIONS, WAVE_CONFIG.type)
  GUI_WAVE.syncDropDown('style', WAVE_STYLE_OPTIONS, WAVE_CONFIG.style)
  GUI_WAVE.syncDropDown('direction', WAVE_DIRECTION_OPTIONS, WAVE_CONFIG.direction)
  GUI_WAVE.syncDropDown('colourMode', WAVE_COLOUR_OPTIONS, WAVE_CONFIG.colourMode)
  GUI_WAVE.addObject(WAVE_CONFIG, ['weight', 'distortion', 'offset', 'stroke', 'fill'])
  refreshWaveControls()
  syncWave()
}

function setupBackgroundGui() {
  GUI_BACKGROUND = createControlPanel("Background", 2 * GUI_WIDTH + 3 * GUI_PADDING, GUI_PADDING)
  GUI_BACKGROUND.addBoundDropDown('type', BG_TYPE_OPTIONS, BG_CONFIG, onBackgroundConfigChange)
  GUI_BACKGROUND.syncDropDown('type', BG_TYPE_OPTIONS, BG_CONFIG.type)
  GUI_BACKGROUND.addObject(BG_CONFIG, ['url', 'shake', 'zoom', 'fade', 'fill'])
  refreshBackgroundControls()
}

function onBackgroundConfigChange() {
  refreshBackgroundControls()
}

function refreshBackgroundControls() {
  let visibility = backgroundControlVisibility(BG_CONFIG)
  for (let key in visibility) {
    GUI_BACKGROUND.setControlVisible(key, visibility[key])
  }
}

function onWaveConfigChange() {
  syncWave()
  refreshWaveControls()
}

function syncWave() {
  if (WAVE_CONFIG.type === 'none') {
    WAVE = null
  } else if (!WAVE) {
    WAVE = new LinearWave()
  }
}

function refreshWaveControls() {
  let visibility = waveControlVisibility(WAVE_CONFIG)
  for (let key in visibility) {
    GUI_WAVE.setControlVisible(key, visibility[key])
  }
}

function setParticleEmitter(qs) {
  let type = qs.value
  if (type != 'none') {
      PARTICLE_EMITTER = new ParticleEmitter(type)
  } else {
      PARTICLE_EMITTER = null
  }
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

  // Display info button with credits
  if (GUI_VISIBLE && !(VIDEO_EXPORT && VIDEO_EXPORT.isRecording())) {
    let margin = 10
    let w = ICON_INFO.width
    push()
    noStroke()
    // TODO abstract this to make it reusable
    if (margin <= mouseX
      && mouseX <= margin + w
      && height - (margin + w) <= mouseY
      && margin <= height - margin) {
      fill(255) // Highlight
      push()
      textSize(20)
      stroke(255)
      strokeWeight(3)
      fill(0)
      text("Music provided by Argofox:", -HALF_WIDTH + margin, HALF_HEIGHT - 100)
      text("Catmosphere - Candy-Coloured Sky", -HALF_WIDTH + margin, HALF_HEIGHT - 75)
      text("https://youtu.be/AZjYZ8Kjgs8", -HALF_WIDTH + margin, HALF_HEIGHT - 50)
      pop()
    } else {
      fill(128) // Grey out
    }
    ellipse(-HALF_WIDTH + margin + w/2, HALF_HEIGHT - (margin + w/2), w+1)
    image(ICON_INFO, -HALF_WIDTH + margin + w/2, HALF_HEIGHT - (margin + w/2))
    pop()
  }

  if (VIDEO_EXPORT && VIDEO_EXPORT.isRecording()) {
    VIDEO_EXPORT.tick()
  }

  updateGuiAutoHide()
  
}

// Handle key presses
function keyPressed() {
  if (VIDEO_EXPORT && VIDEO_EXPORT.isBusy()) {
    return false
  }
  switch(key) {
    case 'p':
    case ' ':
      playButtonPressed()
      break
    case 'h':
      hideButtonPressed()
      break
    case 'r':
      BACKGROUND.setImage()
      break
    case 'e':
      exportButtonPressed()
      break
  }
}

// Handle toggling song and GUI
function playButtonPressed() {
  if (AUDIO.togglePlay()) {
    hideGui()
    PLAY_BUTTON.hide()
  } else {
    showGui()
    lastMouseActivityMs = millis()
    PLAY_BUTTON.show()
  }
}

function hideButtonPressed() {
  toggleGui()
  lastMouseActivityMs = millis()
}

function onMouseActivity() {
  lastMouseActivityMs = millis()
  if (!GUI_VISIBLE) {
    showGui()
  }
}

function updateGuiAutoHide() {
  if (!GUI_VISIBLE || mouseIsPressed) {
    return
  }
  if (millis() - lastMouseActivityMs >= GUI_IDLE_HIDE_MS) {
    hideGui()
  }
}

function showGui() {
  if (GUI_VISIBLE) {
    return
  }
  GUI_WAVE.show()
  GUI_PARTICLES.show()
  GUI_BACKGROUND.show()
  GUI_EXPORT.show()
  GUI_VISIBLE = true
}

function hideGui() {
  if (!GUI_VISIBLE) {
    return
  }
  GUI_WAVE.hide()
  GUI_PARTICLES.hide()
  GUI_BACKGROUND.hide()
  GUI_EXPORT.hide()
  GUI_VISIBLE = false
}

function toggleGui() {
  if (GUI_VISIBLE) {
    hideGui()
  } else {
    showGui()
  }
}

// Triggers on window resize
function windowResized() {
  if (RECORDING_LOCK) {
    return
  }
  resizeCanvas(windowWidth, windowHeight)
  BACKGROUND.setImage()
  HALF_HEIGHT = height / 2
  HALF_WIDTH = width / 2
  PLAY_BUTTON.position(
    HALF_WIDTH - PLAY_BUTTON.width / 2, 
    HALF_HEIGHT - PLAY_BUTTON.height / 2
  )
}
