const BG_TYPE_OPTIONS = ['image', 'solid', 'hearts']
const BG_COLOUR_MODE_OPTIONS = ['solid', 'rainbow']

const HEARTS_START_SCALE = 0.06
const HEART_LIFETIME_MS = 10000
const HEART_SPAWN_AGE_MS = 3200
const HEARTS_VERTEX_STEP = 0.12
const HEARTS_EXTENT = 1.05
const HEARTS_GRADIENT_STEPS = 5

let BG_CONFIG = {
  type: 'image',
  colourMode: 'solid',

  url: 'https://images.pexels.com/photos/2763927/pexels-photo-2763927.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',

  shake: 1.0,
  shakeMin: 0,
  shakeMax: 2,
  shakeStep: 0.1,

  zoom: 100,
  zoomMin: 0,
  zoomMax: 500,

  fade: true,

  fill: [255, 55, 95],
}

let BG_PRESET = {
    bassFreqMin: 90,
    bassFreqMax: 200,
    shakeAmpMin: 200,
    blur: 12,

    alpha: 180,
    alphaMin: 150,
    alphaMax: 180
  }

function heartsBaseSize() {
    return min(HALF_WIDTH, HALF_HEIGHT) * 1.05
}

function heartsEndScale() {
    let screenReach = sqrt(HALF_WIDTH * HALF_WIDTH + HALF_HEIGHT * HALF_HEIGHT) * 1.2
    return screenReach / (heartsBaseSize() * HEARTS_EXTENT)
}

function scaleForAge(ageMs) {
    let t = constrain(ageMs / HEART_LIFETIME_MS, 0, 1)
    return lerp(HEARTS_START_SCALE, heartsEndScale(), t)
}

function nextHeartColorLevel(firstColorLevel) {
    return (firstColorLevel - 1 + HEARTS_GRADIENT_STEPS) % HEARTS_GRADIENT_STEPS
}

function buildHeartOutline(scale) {
    let size = heartsBaseSize() * scale
    let points = []
    let twoPi = Math.PI * 2
    for (let a = 0; a < twoPi; a += HEARTS_VERTEX_STEP) {
        let x = 16 * pow(Math.sin(a), 3) * size / 17
        let y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * size / 17
        points.push([x, y])
    }
    return points
}

class Background {
    constructor(alpha=BG_PRESET.alphaMin) {
        this.image
        this.prevUrl = ''
        this.setImage()

        this.rotation = 0
        this.alpha = alpha
        this.heartRings = []
        this.heartHueCounter = 0
    }

    resetHeartRings() {
        this.heartRings = [{
            birthTime: millis(),
            colorLevel: 0,
            hueIndex: 0,
        }]
        this.heartHueCounter = 1
    }

    heartAge(ring, now) {
        return now - ring.birthTime
    }

    updateShake() {
        let bassAmp = AUDIO.getBassAmp()
        if (bassAmp > BG_PRESET.shakeAmpMin && BG_CONFIG.shake > 0) {
            this.rotation = random(-BG_CONFIG.shake, BG_CONFIG.shake)
        } else {
            this.rotation = 0
        }
        this.alpha = map(bassAmp, 0, 255, BG_PRESET.alphaMax, BG_PRESET.alphaMin)
    }

    heartFillColor(colorLevel, hueIndex) {
        let mix = colorLevel / (HEARTS_GRADIENT_STEPS - 1)

        push()
        let result
        if (BG_CONFIG.colourMode === 'rainbow') {
            colorMode(HSB, 360, 100, 100)
            let hue = (hueIndex * 72) % 360
            result = color(hue, map(mix, 0, 1, 95, 8), map(mix, 0, 1, 95, 100))
        } else {
            colorMode(RGB, 255)
            let strong = color(BG_CONFIG.fill[0], BG_CONFIG.fill[1], BG_CONFIG.fill[2])
            result = lerpColor(strong, color(255, 255, 255), mix)
        }
        pop()
        return result
    }

    spawnHeart(now) {
        let newColorLevel = 0
        if (this.heartRings.length > 0) {
            newColorLevel = nextHeartColorLevel(this.heartRings[0].colorLevel)
        }

        this.heartRings.unshift({
            birthTime: now,
            colorLevel: newColorLevel,
            hueIndex: this.heartHueCounter,
        })
        this.heartHueCounter++
    }

    updateHearts() {
        let now = millis()

        if (this.heartRings.length === 0) {
            this.resetHeartRings()
            return
        }

        for (let i = this.heartRings.length - 1; i >= 0; i--) {
            if (this.heartAge(this.heartRings[i], now) >= HEART_LIFETIME_MS) {
                this.heartRings.splice(i, 1)
            }
        }

        if (this.heartRings.length === 0 ||
            this.heartAge(this.heartRings[0], now) >= HEART_SPAWN_AGE_MS) {
            this.spawnHeart(now)
        }
    }

    drawHeartRing(ring, now) {
        let scale = scaleForAge(this.heartAge(ring, now))
        let outline = buildHeartOutline(scale)
        fill(this.heartFillColor(ring.colorLevel, ring.hueIndex))
        noStroke()
        beginShape()
        for (let i = 0; i < outline.length; i++) {
            vertex(outline[i][0], outline[i][1])
        }
        endShape(CLOSE)
    }

    showHearts() {
        background(255)

        push()
        noStroke()
        let now = millis()

        for (let i = this.heartRings.length - 1; i >= 0; i--) {
            this.drawHeartRing(this.heartRings[i], now)
        }
        pop()
        colorMode(RGB, 255)
    }

    update() {
        if (BG_CONFIG.type === 'hearts') {
            this.updateHearts()
            return
        }
        this.updateShake()
    }

    show() {
        if (BG_CONFIG.type === 'solid') {
            background(BG_CONFIG.fill[0], BG_CONFIG.fill[1], BG_CONFIG.fill[2])
            return
        }

        if (BG_CONFIG.type === 'hearts') {
            this.showHearts()
            return
        }

        push()
        if (this.rotation > 0) {
            rotate(this.rotation)
        }
        image(this.image, 0, 0, width + BG_CONFIG.zoom * 1.6, height + BG_CONFIG.zoom * 0.9)
        pop()

        if (BG_CONFIG.fade) {
            fill(0, this.alpha)
            rect(0, 0, width, height)
        }
    }

    setImage(url=BG_CONFIG.url) {
        console.log('Loading image from URL: ' + url)
        if (url == this.prevUrl || url == '') {
            return
        }

        this.image = loadImage(url, () => {
            this.blurImage()
        })

        this.prevUrl = url
    }

    blurImage(level=BG_PRESET.blur) {
        this.image.filter(BLUR, level)
    }

}
