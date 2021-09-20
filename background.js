let BG_CONFIG = {
  type: ['image', 'solid'],

  url: 'https://images.pexels.com/photos/2763927/pexels-photo-2763927.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',

  shake: 1.0,
  shakeMin: 0,
  shakeMax: 2,
  shakeStep: 0.1,

  zoom: 100,
  zoomMin: 0,
  zoomMax: 500,

  fade: true,

  fill: [0, 0, 0]
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


class Background {
    constructor(alpha=BG_PRESET.alphaMin) {
        this.image
        this.prevUrl = ''
        this.setImage()

        this.rotation = 0
        this.alpha = alpha
    }

    update() {
        let bassAmp = AUDIO.getBassAmp()
        if(bassAmp > BG_PRESET.shakeAmpMin && BG_CONFIG.shake > 0) {
            this.rotation = random(-BG_CONFIG.shake, BG_CONFIG.shake)
        } else {
            this.rotation = 0
        }
        this.alpha = map(bassAmp, 0, 255, BG_PRESET.alphaMax, BG_PRESET.alphaMin)
    }

    show() {
        if (BG_CONFIG.type == 'solid') {
            background(BG_CONFIG.fill) // Clear the canvas
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
        // Avoid unecessarily updating the image
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
