let PARTICLE_PRESET = {
  accMin: 0.00001,
  accMax: 0.0001,
  velMax: 3,

  ampResponsive: true,
  invertFade: false
}

let PARTICLE_CONFIG = {
  w: 5,
  wMin: 1,
  wMax: 10,

  fill: [255, 17, 153],

  freq: 5,
  freqMin: 1,
  freqMax: 10,

  life: 255,
  lifeMin: 127,
  lifeMax: 1027,

  acc: 50
}

let PARTICLE_TYPES = ['ring', 'sides', 'flames', 'cascade', 'starwars', 'none']

class ParticleEmitter {

    constructor(type) {
        this.particles = []

        this.particle
        switch(type) {
            case 'ring':
                this.particle = ringParticle
                break
            case 'sides':
                this.particle = sideParticle
                break
            case 'flames':
                this.particle = flameParticle
                break
            case 'cascade':
                this.particle = cascadeParticle
                break
            case 'starwars':
                this.particle = starwarsParticle
                break
        }
    }

    update() {
        // Only add new particles while song is playing
        if (AUDIO.isPlaying()) {
            for (let i = 0; i < PARTICLE_CONFIG.freq; i++) {
                this.particles.push(this.particle())
            }
        }
        // Allow particles to fade after the song ends
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (!this.particles[i].isOutOfBounds(HALF_WIDTH, HALF_HEIGHT)) {
                this.particles[i].update()
            } else {
                this.particles.splice(i, 1)
            }
        }
    }

    show() {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].show()
        }
    }

}

function ringParticle() {
    let pos = p5.Vector.random2D().mult(RING_CONFIG.radius + AUDIO.getBassAmp())
    let acc = pos.copy().mult(random(PARTICLE_PRESET.accMin, PARTICLE_PRESET.accMax))
    let vel = acc.copy().mult(100)
    return new Particle(pos, vel, acc, undefined, undefined, undefined, true)
}

function sideParticle() {
    let side = 1
    if (random(0, 1) < 0.5) {  // 50% chance to come from right or left of screen
        side *= -1
    }

    let pos = new p5.Vector(HALF_WIDTH * side, random(-HALF_HEIGHT, HALF_HEIGHT))
    let acc = new p5.Vector(-(random(PARTICLE_PRESET.accMin, PARTICLE_PRESET.accMax) * side), 0).mult(PARTICLE_CONFIG.acc)
    let vel = createVector(0, 0)
    let velMax = -(PARTICLE_PRESET.velMax * side)
    return new Particle(pos, vel, acc, undefined, undefined, velMax)
}

function flameParticle() {
    let pos = new p5.Vector(random(-HALF_WIDTH, HALF_WIDTH), HALF_HEIGHT) // Start at the top of the screen
    let acc = new p5.Vector(0, -random(PARTICLE_PRESET.accMin, PARTICLE_PRESET.accMax))
        .mult(PARTICLE_CONFIG.acc)                                        // Accelerate downwards
    let vel = createVector(0, 0)
    return new Particle(pos, vel, acc)
}

function cascadeParticle() {
    let pos = new p5.Vector(random(-HALF_WIDTH, HALF_WIDTH), -HALF_HEIGHT) // Start at the top of the screen
    let acc = new p5.Vector(0, random(PARTICLE_PRESET.accMin, PARTICLE_PRESET.accMax))
        .mult(PARTICLE_CONFIG.acc)                                         // Accelerate downwards
    let vel = createVector(0, 0)
    return new Particle(pos, vel, acc)
}

function starwarsParticle() {
    let pos = new p5.Vector(random(-10, 10), random(-10, 10)) // Start around the middle of the screen
    let acc = p5.Vector.random2D()                            // Accelerate outwards
        .mult(random(PARTICLE_PRESET.accMin, PARTICLE_PRESET.accMax) * 200) 
    let ampResponsive = false                                 // Don't respond to changes in amplitude
    let vel = acc.copy().mult(100)                            // Start with 100 frames of acceleration
    let velMax = 16                                           // Higher max speed
    let w = 3                                                 // Smaller width
    let white = [255, 255, 255]
    let longLife = 750
    let invertFade = true                                     // Get less transparent as you go
    return new Particle(pos, vel, acc, w, white, velMax, ampResponsive, longLife, invertFade)
}
