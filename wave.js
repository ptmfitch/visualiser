let WAVE_TYPES = ['ring-mirror', 'circle-mirror', 'line-h', 'line-v', 'none']

let WAVE_CONFIG = {
  weight: 3,
  weightMin: 1,
  weightMax: 10,

  stroke: [17, 255, 238],
  fill: [0, 0, 0],

  distortion: 50,
  distortionMin: 1,
  distortionMax: 500,
}

let RING_CONFIG = {
    radius: 200,
    radiusMin: 1,
    radiusMax: 500
}

let LINE_CONFIG = {
    height: 0,
    heightMin: -500,
    heightMax: 500
}

let SPACE_BETWEEN_LINES

class LinearWave {
    constructor(type) {
        this.type = type // Type of linear wave
        this.points = [] // Points along the line
    }

    update() {
        this.points = []

        let waveform = AUDIO.getWaveform()

        let minHeight
        let maxHeight

        switch(this.type) {
            case 'ring-mirror':
            case 'circle-mirror':
                minHeight = height / 6 - height / 24
                maxHeight = height / 6 + height / 24
                for (let i = 0; i <= 180; i += 1) {
                    let j = floor(map(i, 0, 180, 0, waveform.length - 1))
                    let r = map(waveform[j], -1, 1, minHeight, maxHeight) + AUDIO.getBassAmp()
                    let x = r * sin(i)
                    let y = r * cos(i)
                    let p = [x, y]

                    this.points.push(p)
                }
                break
            case 'line-h':
                minHeight = LINE_CONFIG.height - WAVE_CONFIG.distortion
                maxHeight = LINE_CONFIG.height + WAVE_CONFIG.distortion
                for (var i = 0; i <= width; i += 1) {
                    let j = floor(map(i, 0, width, 0, waveform.length - 1))
                    let x = i - HALF_WIDTH
                    let y = map(waveform[j], -1, 1, minHeight, maxHeight)
                    let p = [x, y]
                    
                    this.points.push(p)
                }
                break
            case 'line-v':
                minHeight = LINE_CONFIG.height - WAVE_CONFIG.distortion
                maxHeight = LINE_CONFIG.height + WAVE_CONFIG.distortion
                for (var i = 0; i <= height; i += 1) {
                    let j = floor(map(i, 0, height, 0, waveform.length - 1))
                    let y = i - HALF_HEIGHT
                    let x = map(waveform[j], -1, 1, minHeight, maxHeight)
                    let p = [x, y]
                    
                    this.points.push(p)
                }
                break
        }
    }

    show() {
        push()

        stroke(WAVE_CONFIG.stroke)
        strokeWeight(WAVE_CONFIG.weight)
        
        switch(this.type) {
            case 'ring-mirror':
                noFill()
                for (let t = -1; t <= 1; t += 2) { // Loop for each semi-circle
                    beginShape()
                    for (let i = 0; i < this.points.length; i++) {
                        let p = this.points[i]
                        vertex(p[0] * t, p[1]) // Invert x on the first loop
                    }
                    endShape()
                }
                break
            case 'circle-mirror':
                fill(WAVE_CONFIG.fill)
                beginShape() // Draw whole ring at once
                for (let i = 0; i < this.points.length; i++) {
                    let p = this.points[i]
                    vertex(p[0] * 1, p[1])
                }
                // Go backwards through inverted points to continue ring
                for (let i = this.points.length - 1; i >= 0; i--) { 
                    let p = this.points[i]
                    vertex(p[0] * -1, p[1])
                }
                endShape(CLOSE)
                break
            case 'line-h':
            case 'line-v':
                noFill()
                beginShape()
                for (let i = 0; i < this.points.length; i++) {
                    let p = this.points[i]
                    vertex(p[0], p[1])
                }
                endShape()
                break
        }

        pop()
    }

}
  
//   } else if(waveParams.type == 'bars') {

//     // Credit https://nishanc.medium.com/audio-visualization-in-javascript-with-p5-js-cf3bc7f1be07

//     push()

//     translate(-HALF_WIDTH, -HALF_HEIGHT)

//     for (let i = 0; i < spectrum.length; i++) {
//       stroke(waveParams.color)
//       let y = map(spectrum[i], 0, 256, height, 0)
//       if (waveParams.barType == 'vLines') {
//         line(i * SPACE_BETWEEN_LINES, height, i * SPACE_BETWEEN_LINES, y)
//       } else if (waveParams.barType == 'hLines') {
//         line(width - (i * SPACE_BETWEEN_LINES), y, SPACE_BETWEEN_LINES, height - y) // TODO: BROKEN
//       }
//     }

//     pop()

//   }