let PARTICLE_EMITTER
let PARTICLES

let PARTICLE_TYPES = ['ring', 'line-h', 'line-v', 'starwars', 'none']

class ParticleEmitter {

    constructor(type) {
        PARTICLES = []

        this.particle
        switch(type) {
            case 'ring':
                this.particle = ringParticle
                break
            case 'line-h':
                this.particle = horizontalParticle
                break
            case 'line-v':
                this.particle = verticalParticle
                break
            case 'starwars':
                this.particle = starwarsParticle
                break
        }
    }

    update() {
        for (let i = 0; i < PARTICLE_PARAMS.frequency; i++) {
            PARTICLES.push(this.particle())
        }
        for (let i = PARTICLES.length - 1; i >= 0; i--) {
            if (!PARTICLES[i].isOutOfBounds(HALF_WIDTH, HALF_HEIGHT)) {
                PARTICLES[i].update()
            } else {
                PARTICLES.splice(i, 1)
            }
        }
    }

    show() {
        for (let i = 0; i < PARTICLES.length; i++) {
            PARTICLES[i].show()
        }
    }

}

function resetParticleEmitter(qs) {
    let type = qs.value
    if (type != 'none') {
        PARTICLE_EMITTER = new ParticleEmitter(type)
    } else {
        PARTICLE_EMITTER = null
    }
}
