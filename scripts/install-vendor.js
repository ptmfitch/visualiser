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

function copy(relativeFrom, filename) {
  const src = path.join(nm, relativeFrom)
  const dest = path.join(vendorDir, filename)

  if (!fs.existsSync(src)) {
    throw new Error(
      `Missing ${src}. Run "npm install" before installing vendor files.`
    )
  }

  fs.copyFileSync(src, dest)
  console.log(`vendor/${filename}`)
}

fs.mkdirSync(vendorDir, { recursive: true })

for (const [from, to] of copies) {
  copy(from, to)
}

console.log('Vendor libraries ready in vendor/')
