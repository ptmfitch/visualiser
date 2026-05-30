/**
 * Pure helpers for mapping config objects to QuickSettings widgets.
 * Used by controlPanels.js (browser) and tests (Node).
 */

function shouldSkipConfigKey(key) {
  return /^(.*min|.*max|.*step)$/i.test(key)
}

function isRgbColorArray(val) {
  return (
    Array.isArray(val) &&
    val.length === 3 &&
    typeof val[0] === 'number' &&
    typeof val[1] === 'number' &&
    typeof val[2] === 'number'
  )
}

function isStringArray(val) {
  return Array.isArray(val) && val.length > 0 && typeof val[0] === 'string'
}

function sliderLimits(object, key, val, defaults) {
  const vmin = Math.min(
    val,
    object[key + 'Min'] ?? object[key + 'min'] ?? defaults.min
  )
  const vmax = Math.max(
    val,
    object[key + 'Max'] ?? object[key + 'max'] ?? defaults.max
  )
  const step = object[key + 'Step'] ?? object[key + 'step'] ?? defaults.step
  return { vmin, vmax, step }
}

function rgbArrayToHex(rgb) {
  return (
    '#' +
    rgb
      .map(function (value) {
        return ('0' + value.toString(16)).slice(-2)
      })
      .join('')
  )
}

function hexToRgbArray(hex) {
  if (Array.isArray(hex)) {
    return hex
  }
  if (typeof hex !== 'string' || !/^#([a-f0-9]{6})$/i.test(hex)) {
    return [0, 0, 0]
  }
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

function normalizeBindParams(params, objectKeys) {
  if (params.length === 0) {
    return objectKeys
  }
  if (params.length === 1 && Array.isArray(params[0])) {
    return params[0]
  }
  return params
}

function waveControlVisibility(config) {
  var visibility = {
    type: true,
    style: false,
    direction: false,
    colourMode: false,
    weight: false,
    distortion: false,
    offset: false,
    stroke: false,
    fill: false,
  }

  if (config.type === 'none') {
    return visibility
  }

  if (config.type === 'ring') {
    visibility.style = true
    visibility.weight = true
    visibility.distortion = true
    if (config.style === 'open') {
      visibility.stroke = true
    } else if (config.style === 'closed') {
      visibility.stroke = true
      visibility.fill = true
    }
    return visibility
  }

  if (config.type === 'line') {
    visibility.direction = true
    visibility.colourMode = true
    visibility.weight = true
    visibility.distortion = true
    visibility.offset = true
    if (config.colourMode === 'solid') {
      visibility.stroke = true
    }
    return visibility
  }

  return visibility
}

function backgroundControlVisibility(config) {
  var visibility = {
    type: true,
    colourMode: false,
    url: false,
    shake: false,
    zoom: false,
    fade: false,
    fill: false,
  }

  if (config.type === 'image') {
    visibility.url = true
    visibility.shake = true
    visibility.zoom = true
    visibility.fade = true
  } else if (config.type === 'solid') {
    visibility.fill = true
  } else if (config.type === 'hearts') {
    visibility.colourMode = true
    if (config.colourMode !== 'rainbow') {
      visibility.fill = true
    }
  }

  return visibility
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    shouldSkipConfigKey,
    isRgbColorArray,
    isStringArray,
    sliderLimits,
    rgbArrayToHex,
    hexToRgbArray,
    normalizeBindParams,
    waveControlVisibility,
    backgroundControlVisibility,
  }
}
