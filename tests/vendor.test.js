const { describe, it, before } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')

const vendorDir = path.join(__dirname, '..', 'vendor')

const requiredFiles = ['p5.js', 'p5.sound.js', 'quicksettings.js']
const ffmpegFiles = [
  'ffmpeg/ffmpeg-core.js',
  'ffmpeg/ffmpeg-core.wasm',
  'ffmpeg/ffmpeg/index.js',
  'ffmpeg/util/index.js',
]

describe('vendor libraries', () => {
  before(() => {
    if (!fs.existsSync(path.join(vendorDir, 'p5.js'))) {
      throw new Error(
        'vendor/ is empty. Run "npm install" to download libraries before testing.'
      )
    }
  })

  for (const file of requiredFiles) {
    it(`includes ${file}`, () => {
      const filePath = path.join(vendorDir, file)
      assert.ok(fs.existsSync(filePath), `${file} missing — run npm install`)
      assert.ok(fs.statSync(filePath).size > 1000, `${file} looks truncated`)
    })
  }

  for (const file of ffmpegFiles) {
    it(`includes ${file}`, () => {
      const filePath = path.join(vendorDir, file)
      assert.ok(fs.existsSync(filePath), `${file} missing — run npm install`)
      assert.ok(fs.statSync(filePath).size > 0, `${file} looks empty`)
    })
  }

  it('does not commit root-level legacy vendor copies', () => {
    const legacy = ['p5.js', 'p5.sound.js', 'p5.gui.js', 'quicksettings.js'].map((f) =>
      path.join(__dirname, '..', f)
    )
    for (const filePath of legacy) {
      assert.ok(!fs.existsSync(filePath), `remove committed copy: ${path.basename(filePath)}`)
    }
  })
})
