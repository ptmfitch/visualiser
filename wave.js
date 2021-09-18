let GUI_WAVE

let WAVE

let WAVE_TYPES = ['ring-mirror', 'line-h', 'line-v', 'none']

let WAVE_PARAMS = {


  weight: 3,
  weightMin: 1,
  weightMax: 10,

  color: [17, 255, 238],

  ringRadius: 200,
  ringRadiusMin: 1,
  ringRadiusMax: 500,

  lineBase: 0,
  lineBaseMin: -500,
  lineBaseMax: 500,
 
  waveHeight: 50,
  waveHeightMin: 1,
  waveHeightMax: 500,

}
let SPACE_BETWEEN_LINES


class LinearWave {


    constructor(type, waveBase, waveHeight, color, weight) {
        this.type = type             // Type of linear wave

        this.waveBase = waveBase     // Base position of wave
        this.waveHeight = waveHeight // Max height difference of wave

        this.color = color           // Colour of the line
        this.weight = weight         // Thickness of the line

        this.points = []             // Points along the line

        this.minHeight = this.waveBase - this.waveHeight
        this.maxHeight = this.waveBase + this.waveHeight
    }


    update() {

        this.points = []

        switch(this.type) {
            case 'ring-mirror':
                for (let i = 0; i <= 180; i += 1) {
                    let j = floor(map(i, 0, 180, 0, WAVEFORM.length - 1))
                    let r = map(WAVEFORM[j], -1, 1, this.minHeight, this.maxHeight) + BASS_AMP
                    let x = r * sin(i)
                    let y = r * cos(i)
                    let p = [x, y]

                    this.points.push(p)
                }
                break
            case 'line-h':
                for (var i = 0; i <= width; i += 1) {
                    let j = floor(map(i, 0, width, 0, WAVEFORM.length - 1))
                    let x = i - HALF_WIDTH
                    let y = map(WAVEFORM[j], -1, 1, this.minHeight, this.maxHeight)
                    let p = [x, y]
                    
                    this.points.push(p)
                }
                break
            case 'line-v':
                for (var i = 0; i <= height; i += 1) {
                    let j = floor(map(i, 0, height, 0, WAVEFORM.length - 1))
                    let y = i - HALF_HEIGHT
                    let x = map(WAVEFORM[j], -1, 1, this.minHeight, this.maxHeight)
                    let p = [x, y]
                    
                    this.points.push(p)
                }
                break
        }

    }


    show() {

        push()

        stroke(this.color)
        strokeWeight(this.weight)
        noFill()

        switch(this.type) {
            case 'ring-mirror':
                for (let t = -1; t <= 1; t += 2) { // Loop for each semi-circle
                    beginShape()
                    for (let i = 0; i < this.points.length; i++) {
                        let p = this.points[i]
                        vertex(p[0] * t, p[1]) // Invert x on the first loop
                    }
                    endShape()
                }
                break
            case 'line-h':
            case 'line-v':
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


function resetWave(qs) {
    let type = qs.value
    switch(type) {
        case 'ring-mirror':
            WAVE = new LinearWave(
                type, 
                WAVE_PARAMS.ringRadius, WAVE_PARAMS.waveHeight,
                WAVE_PARAMS.color, WAVE_PARAMS.weight
            )
            break
        case 'line-h':
        case 'line-v':
            WAVE = new LinearWave(
                type,
                WAVE_PARAMS.lineBase, WAVE_PARAMS.waveHeight,
                WAVE_PARAMS.color, WAVE_PARAMS.weight
            )
            break
        default:
            WAVE = null
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