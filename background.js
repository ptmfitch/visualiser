
let IMAGE

let GUI_BACKGROUND
let BG_CONFIG = {

  type: ['image', 'solid'],

  url: 'https://images.pexels.com/photos/2763927/pexels-photo-2763927.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',

  shake: 0.1,
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
    shakeAmpMin: 250,
    blur: 12,
  
    alpha: 180,
    alphaMin: 150,
    alphaMax: 180
  }


class Background {


    constructor() {
        this.rotation = 0
        this.alpha = BG_PRESET.alphaMin

        this.bgPrev = BG_CONFIG.url
    }


    update() {
        if(BASS_AMP > BG_PRESET.shakeAmpMin && BG_CONFIG.shake > 0) {
            this.rotation = random(-BG_CONFIG.shake, BG_CONFIG.shake)
        } else {
            this.rotation = 0
        }
        this.alpha = map(BASS_AMP, 0, 255, BG_PRESET.alphaMax, BG_PRESET.alphaMin)
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
        image(IMAGE, 0, 0, width + BG_CONFIG.zoom * 1.6, height + BG_CONFIG.zoom * 0.9)

        pop()

        if (BG_CONFIG.fade) {
            fill(0, this.alpha)
            rect(0, 0, width, height)
        }
        
    }


    setImage() {
        console.log('Loading image from URL: ' + BG_CONFIG.url)
        console.log('Previous URL: ' + this.bgPrev)
        // Avoid unecessarily updating the image
        if (BG_CONFIG.url == this.bgPrev || BG_CONFIG.url == '') { 
            console.log('Didn\'t need to reload')
            return
        }
    
        IMAGE = loadImage(BG_CONFIG.url, () => {
            IMAGE.filter(BLUR, BG_PRESET.blur)
        })
    
        this.bgPrev = BG_CONFIG.url
    }


}


function setBackground() {
    BACKGROUND = new Background()
}



