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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    shouldSkipConfigKey,
    isRgbColorArray,
    isStringArray,
    sliderLimits,
    rgbArrayToHex,
  }
}
