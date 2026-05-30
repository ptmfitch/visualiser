const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const {
  EXPORT_MODES,
  exportModeFromLabel,
  shouldStopRecording,
  buildExportFilename,
  pickRecorderMimeType,
} = require('../lib/videoExport.js')

describe('exportModeFromLabel', () => {
  it('maps UI labels to export modes', () => {
    assert.equal(exportModeFromLabel('Full song'), EXPORT_MODES.FULL)
    assert.equal(exportModeFromLabel('Manual stop'), EXPORT_MODES.MANUAL)
    assert.equal(exportModeFromLabel('Fixed length'), EXPORT_MODES.CLIP)
  })
})

describe('shouldStopRecording', () => {
  it('stops manual mode only when requested', () => {
    assert.equal(
      shouldStopRecording(EXPORT_MODES.MANUAL, 10, 60, true, false),
      false
    )
    assert.equal(
      shouldStopRecording(EXPORT_MODES.MANUAL, 10, 60, true, true),
      true
    )
  })

  it('stops clip mode when elapsed reaches target', () => {
    assert.equal(
      shouldStopRecording(EXPORT_MODES.CLIP, 14.9, 15, true, false),
      false
    )
    assert.equal(
      shouldStopRecording(EXPORT_MODES.CLIP, 15, 15, true, false),
      true
    )
  })

  it('stops full song near duration or when playback ends', () => {
    assert.equal(
      shouldStopRecording(EXPORT_MODES.FULL, 59.7, 60, true, false),
      false
    )
    assert.equal(
      shouldStopRecording(EXPORT_MODES.FULL, 59.85, 60, true, false),
      true
    )
    assert.equal(
      shouldStopRecording(EXPORT_MODES.FULL, 10, 60, false, false),
      true
    )
  })

  it('does not stop full song before duration is known', () => {
    assert.equal(
      shouldStopRecording(EXPORT_MODES.FULL, 0, 0, true, false),
      false
    )
  })
})

describe('buildExportFilename', () => {
  it('builds a safe mp4 filename from the song url', () => {
    const name = buildExportFilename('Catmosphere - Candy-Coloured Sky.mp3')
    assert.match(name, /^Catmosphere-Candy-Coloured-Sky-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.mp4$/)
  })
})

describe('pickRecorderMimeType', () => {
  it('prefers mp4 when supported', () => {
    const mime = pickRecorderMimeType(function (type) {
      return type === 'video/mp4' || type === 'video/webm'
    })
    assert.equal(mime, 'video/mp4')
  })

  it('falls back to webm when mp4 is unavailable', () => {
    const mime = pickRecorderMimeType(function (type) {
      return type.indexOf('webm') !== -1
    })
    assert.equal(mime, 'video/webm;codecs=vp9,opus')
  })

  it('returns empty string when nothing is supported', () => {
    assert.equal(pickRecorderMimeType(function () { return false }), '')
  })
})
