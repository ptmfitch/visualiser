let GUI_PARTICLES

let PARTICLE_PARAMS_PRESET = {
  accMin: 0.00001,
  accMax: 0.0001,
  velMax: 3
}

let PARTICLE_PARAMS = {
  
  size: 5,
  sizeMin: 1,
  sizeMax: 10,

  color: [255, 17, 153],

  frequency: 5,
  frequencyMin: 1,
  frequencyMax: 10,

  life: 255,
  lifeMin: 127,
  lifeMax: 1027,

  horizontalAcceleration: 50

}


class Particle {


    constructor(pos, vel, acc, size, col, terVel, life, ampResponsive=true, invertFade=false) {
        this.pos = pos
        this.acc = acc 
        this.vel = vel
        this.terVel = terVel
        this.ampResponsive = ampResponsive

        this.size = size
        this.col = color(col)
        this.maxLife = life
        this.life = life
        this.invertFade = invertFade
    }


    update() {
        this.vel.add(this.acc)
        this.vel.limit(this.terVel)
        if(this.ampResponsive) {
            this.pos.add(this.vel.copy().mult(BASS_AMP / 64))
        } else {
            this.pos.add(this.vel)
        }
        this.life -= 1
        if(this.invertFade) {
            this.col.setAlpha(map(this.life, 0, this.maxLife, 255, 0))
        } else {
            this.col.setAlpha(map(this.life, 0, this.maxLife, 0, 255))
        }
        
    }


    isOutOfBounds(width, height) {
        return this.pos.x < -width 
        || this.pos.x > width 
        || this.pos.y < -height
        || this.pos.y > height
        || this.life < 0
    }


    show() {
        noStroke()
        fill(this.col)
        ellipse(this.pos.x, this.pos.y, this.size)
    }


}


function ringParticle() {
    let pos = p5.Vector.random2D().mult(WAVE_PARAMS.ringRadius + BASS_AMP)
    let acc = pos.copy().mult(random(PARTICLE_PARAMS_PRESET.accMin, PARTICLE_PARAMS_PRESET.accMax))
    let vel = acc.copy().mult(100)
    return new Particle(
        pos, vel, acc, 
        PARTICLE_PARAMS.size,
        PARTICLE_PARAMS.color,
        PARTICLE_PARAMS_PRESET.velMax,
        PARTICLE_PARAMS.life
    )
}


function horizontalParticle() {
    return new Particle(
        new p5.Vector(-HALF_WIDTH, random(-HALF_HEIGHT, HALF_HEIGHT)),
        createVector(0, 0),
        new p5.Vector(random(PARTICLE_PARAMS_PRESET.accMin, PARTICLE_PARAMS_PRESET.accMax), 0)
            .mult(PARTICLE_PARAMS.horizontalAcceleration),
        PARTICLE_PARAMS.size,
        PARTICLE_PARAMS.color,
        PARTICLE_PARAMS_PRESET.velMax,
        PARTICLE_PARAMS.life
    )
}


function starwarsParticle() {
    let pos = new p5.Vector(random(-10, 10), random(-10, 10))
    let acc = p5.Vector.random2D().mult(random(PARTICLE_PARAMS_PRESET.accMin, PARTICLE_PARAMS_PRESET.accMax) * 200)
    let vel = acc.copy().mult(100)
    return new Particle(
        pos, vel, acc,
        3,
        [255, 255, 255],
        16,
        750,
        false,
        true
    )
}

