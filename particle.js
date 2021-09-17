class Particle {
    constructor(pos, acc, size, col, terVel, life) {
        this.pos = pos
        this.acc = this.pos.copy().mult(acc) // Accelerate away from center
        this.vel = createVector(0, 0)
        this.terVel = terVel

        this.size = size
        this.col = color(col)
        this.life = life
    }
    update(amp) {
        this.vel.add(this.acc)
        this.vel.limit(this.terVel)
        this.pos.add(this.vel.copy().mult(amp / 50))
        this.life -= 1
        this.col.setAlpha(this.life)
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

function ringParticle(radius) {
    return new Particle(
        p5.Vector.random2D().mult(radius), 
        random(particleParamsPreset.accMin, particleParamsPreset.accMax), 
        particleParams.size,
        particleParams.color,
        particleParamsPreset.velMax,
        particleParams.life
    )
}