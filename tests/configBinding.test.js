const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const {
  shouldSkipConfigKey,
  isRgbColorArray,
  isStringArray,
  sliderLimits,
  rgbArrayToHex,
  hexToRgbArray,
  normalizeBindParams,
  waveControlVisibility,
  backgroundControlVisibility,
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

describe('hexToRgbArray', () => {
  it('parses hex strings', () => {
    assert.deepEqual(hexToRgbArray('#11ffee'), [17, 255, 238])
  })

  it('passes through rgb arrays', () => {
    assert.deepEqual(hexToRgbArray([255, 17, 153]), [255, 17, 153])
  })
})

describe('normalizeBindParams', () => {
  it('unwraps a single array argument', () => {
    assert.deepEqual(
      normalizeBindParams([['weight', 'stroke']], ['type', 'weight', 'stroke']),
      ['weight', 'stroke']
    )
  })

  it('falls back to object keys when empty', () => {
    assert.deepEqual(normalizeBindParams([], ['type', 'weight']), ['type', 'weight'])
  })
})

describe('waveControlVisibility', () => {
  it('shows only type when wave is none', () => {
    assert.deepEqual(waveControlVisibility({ type: 'none' }), {
      type: true,
      style: false,
      direction: false,
      colourMode: false,
      weight: false,
      distortion: false,
      offset: false,
      stroke: false,
      fill: false,
    })
  })

  it('shows stroke for open ring', () => {
    const v = waveControlVisibility({ type: 'ring', style: 'open' })
    assert.equal(v.style, true)
    assert.equal(v.stroke, true)
    assert.equal(v.fill, false)
  })

  it('shows stroke and fill for closed ring', () => {
    const v = waveControlVisibility({ type: 'ring', style: 'closed' })
    assert.equal(v.fill, true)
    assert.equal(v.stroke, true)
  })

  it('shows stroke for solid line', () => {
    const v = waveControlVisibility({ type: 'line', colourMode: 'solid' })
    assert.equal(v.direction, true)
    assert.equal(v.distortion, true)
    assert.equal(v.stroke, true)
  })

  it('hides stroke for rainbow line', () => {
    const v = waveControlVisibility({ type: 'line', colourMode: 'rainbow' })
    assert.equal(v.colourMode, true)
    assert.equal(v.stroke, false)
  })
})

describe('backgroundControlVisibility', () => {
  it('shows image controls for image type', () => {
    const v = backgroundControlVisibility({ type: 'image' })
    assert.equal(v.url, true)
    assert.equal(v.shake, true)
    assert.equal(v.zoom, true)
    assert.equal(v.fade, true)
    assert.equal(v.fill, false)
  })

  it('shows fill only for solid type', () => {
    const v = backgroundControlVisibility({ type: 'solid' })
    assert.equal(v.fill, true)
    assert.equal(v.url, false)
    assert.equal(v.shake, false)
    assert.equal(v.zoom, false)
    assert.equal(v.fade, false)
  })
})
