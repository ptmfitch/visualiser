#!/usr/bin/env node
/**
 * Copies p5.js, p5.sound, and quicksettings from node_modules into vendor/.
 * Run automatically via npm postinstall.
 */

const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const vendorDir = path.join(root, 'vendor')
const nm = path.join(root, 'node_modules')

const copies = [
  ['p5/lib/p5.js', 'p5.js'],
  ['p5/lib/addons/p5.sound.js', 'p5.sound.js'],
  ['quicksettings/quicksettings.js', 'quicksettings.js'],
]

const ffmpegCoreCopies = [
  ['@ffmpeg/core/dist/esm/ffmpeg-core.js', 'ffmpeg/ffmpeg-core.js'],
  ['@ffmpeg/core/dist/esm/ffmpeg-core.wasm', 'ffmpeg/ffmpeg-core.wasm'],
]

function copy(relativeFrom, filename) {
  const src = path.join(nm, relativeFrom)
  const dest = path.join(vendorDir, filename)

  if (!fs.existsSync(src)) {
    throw new Error(
      `Missing ${src}. Run "npm install" before installing vendor files.`
    )
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
  console.log(`vendor/${filename}`)
}

function copyDir(relativeFrom, destSubdir) {
  const srcDir = path.join(nm, relativeFrom)
  const destDir = path.join(vendorDir, destSubdir)

  if (!fs.existsSync(srcDir)) {
    throw new Error(
      `Missing ${srcDir}. Run "npm install" before installing vendor files.`
    )
  }

  fs.mkdirSync(destDir, { recursive: true })
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name)
    const dest = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      copyDir(path.join(relativeFrom, entry.name), path.join(destSubdir, entry.name))
    } else {
      fs.copyFileSync(src, dest)
    }
  }
  console.log(`vendor/${destSubdir}/`)
}

fs.mkdirSync(vendorDir, { recursive: true })

for (const [from, to] of copies) {
  copy(from, to)
}

for (const [from, to] of ffmpegCoreCopies) {
  copy(from, to)
}

copyDir('@ffmpeg/ffmpeg/dist/esm', 'ffmpeg/ffmpeg')
copyDir('@ffmpeg/util/dist/esm', 'ffmpeg/util')

console.log('Vendor libraries ready in vendor/')
