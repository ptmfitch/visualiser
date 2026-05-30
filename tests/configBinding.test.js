const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const {
  shouldSkipConfigKey,
  isRgbColorArray,
  isStringArray,
  sliderLimits,
  rgbArrayToHex,
} = require('../lib/configBinding.js')

describe('shouldSkipConfigKey', () => {
  it('skips min, max, and step companion keys', () => {
    assert.equal(shouldSkipConfigKey('weightMin'), true)
    assert.equal(shouldSkipConfigKey('weightMax'), true)
    assert.equal(shouldSkipConfigKey('weightStep'), true)
    assert.equal(shouldSkipConfigKey('weight'), false)
  })
})

describe('isRgbColorArray', () => {
  it('accepts three numeric RGB components', () => {
    assert.equal(isRgbColorArray([255, 17, 153]), true)
  })

  it('rejects string arrays used as dropdown options', () => {
    assert.equal(isStringArray(['ring', 'sides']), true)
    assert.equal(isRgbColorArray(['ring', 'sides']), false)
  })
})

describe('sliderLimits', () => {
  it('uses object min/max/step when present', () => {
    const object = { weight: 3, weightMin: 1, weightMax: 10, weightStep: 0.5 }
    assert.deepEqual(sliderLimits(object, 'weight', 3, { min: 0, max: 100, step: 1 }), {
      vmin: 1,
      vmax: 10,
      step: 0.5,
    })
  })

  it('clamps limits to the current value', () => {
    const object = { zoom: 100, zoomMin: 0, zoomMax: 500 }
    assert.deepEqual(sliderLimits(object, 'zoom', 100, { min: 0, max: 100, step: 1 }), {
      vmin: 0,
      vmax: 500,
      step: 1,
    })
  })
})

describe('rgbArrayToHex', () => {
  it('formats hex color strings', () => {
    assert.equal(rgbArrayToHex([17, 255, 238]), '#11ffee')
  })
})
