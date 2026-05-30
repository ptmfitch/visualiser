const WAVE_TYPE_OPTIONS = ['ring', 'line', 'none']
const WAVE_STYLE_OPTIONS = ['open', 'closed']
const WAVE_DIRECTION_OPTIONS = ['horizontal', 'vertical']
const WAVE_COLOUR_OPTIONS = ['solid', 'rainbow']

let WAVE_CONFIG = {
  type: 'ring',
  style: 'open',
  direction: 'horizontal',
  colourMode: 'solid',

  weight: 3,
  weightMin: 1,
  weightMax: 10,

  distortion: 50,
  distortionMin: 1,
  distortionMax: 500,

  offset: 0,
  offsetMin: -500,
  offsetMax: 500,

  stroke: [17, 255, 238],
  fill: [0, 0, 0],
}

let RING_CONFIG = {
    radius: 200,
    radiusMin: 1,
    radiusMax: 500
}

let SPACE_BETWEEN_LINES

class LinearWave {
    constructor() {
        this.points = []
        this.hueOffset = 0
    }

    update() {
        this.points = []

        let waveform = AUDIO.getWaveform()
        let { type, direction, colourMode, offset, distortion } = WAVE_CONFIG

        if (type === 'ring') {
            let minHeight = height / 6 - height / 24
            let maxHeight = height / 6 + height / 24
            for (let i = 0; i <= 180; i += 1) {
                let j = floor(map(i, 0, 180, 0, waveform.length - 1))
                let r = map(waveform[j], -1, 1, minHeight, maxHeight) + AUDIO.getBassAmp()
                let x = r * sin(i)
                let y = r * cos(i)
                this.points.push([x, y])
            }
        } else if (type === 'line') {
            let minBound = offset - distortion
            let maxBound = offset + distortion
            if (direction === 'horizontal') {
                for (var i = 0; i <= width; i += 1) {
                    let j = floor(map(i, 0, width, 0, waveform.length - 1))
                    let x = i - HALF_WIDTH
                    let y = map(waveform[j], -1, 1, minBound, maxBound)
                    this.points.push([x, y])
                }
            } else {
                for (var i = 0; i <= height; i += 1) {
                    let j = floor(map(i, 0, height, 0, waveform.length - 1))
                    let y = i - HALF_HEIGHT
                    let x = map(waveform[j], -1, 1, minBound, maxBound)
                    this.points.push([x, y])
                }
            }
            if (colourMode === 'rainbow') {
                this.hueOffset += map(AUDIO.getVolumeAmp(), 0, 255, 0.5, 6)
            }
        }
    }

    show() {
        push()

        stroke(WAVE_CONFIG.stroke[0], WAVE_CONFIG.stroke[1], WAVE_CONFIG.stroke[2])
        strokeWeight(WAVE_CONFIG.weight)

        let { type, style, direction, colourMode } = WAVE_CONFIG

        if (type === 'ring' && style === 'open') {
            noFill()
            for (let t = -1; t <= 1; t += 2) {
                beginShape()
                for (let i = 0; i < this.points.length; i++) {
                    let p = this.points[i]
                    vertex(p[0] * t, p[1])
                }
                endShape()
            }
        } else if (type === 'ring' && style === 'closed') {
            stroke(WAVE_CONFIG.stroke[0], WAVE_CONFIG.stroke[1], WAVE_CONFIG.stroke[2])
            fill(WAVE_CONFIG.fill[0], WAVE_CONFIG.fill[1], WAVE_CONFIG.fill[2])
            beginShape()
            for (let i = 0; i < this.points.length; i++) {
                let p = this.points[i]
                vertex(p[0], p[1])
            }
            for (let i = this.points.length - 1; i >= 0; i--) {
                let p = this.points[i]
                vertex(p[0] * -1, p[1])
            }
            endShape(CLOSE)
        } else if (type === 'line' && colourMode === 'solid') {
            noFill()
            beginShape()
            for (let i = 0; i < this.points.length; i++) {
                let p = this.points[i]
                vertex(p[0], p[1])
            }
            endShape()
        } else if (type === 'line' && colourMode === 'rainbow') {
            colorMode(HSB, 360, 100, 100)
            strokeWeight(WAVE_CONFIG.weight)
            strokeCap(ROUND)
            noFill()
            let hueSpan = direction === 'horizontal' ? HALF_WIDTH : HALF_HEIGHT
            let brightness = map(AUDIO.getVolumeAmp(), 0, 255, 55, 100)
            for (let i = 0; i < this.points.length - 1; i++) {
                let p1 = this.points[i]
                let p2 = this.points[i + 1]
                let coord = direction === 'horizontal' ? p1[0] : p1[1]
                let hue = (map(coord, -hueSpan, hueSpan, 0, 360) + this.hueOffset) % 360
                stroke(hue, 90, brightness)
                line(p1[0], p1[1], p2[0], p2[1])
            }
        }

        pop()
    }

}
