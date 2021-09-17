class Particle {
    constructor(pos, acc, size, col, terVel, life, ampResponsive=true, invertFade=false) {
        this.pos = pos
        this.acc = acc 
        this.vel = createVector(0, 0)
        this.terVel = terVel
        this.ampResponsive = ampResponsive

        this.size = size
        this.col = color(col)
        this.maxLife = life
        this.life = life
        this.invertFade = invertFade
    }
    update(amp) {
        this.vel.add(this.acc)
        this.vel.limit(this.terVel)
        if(this.ampResponsive) {
            this.pos.add(this.vel.copy().mult(amp / 50))
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

function ringParticle(radius) {
    let pos = p5.Vector.random2D().mult(radius)
    let acc = pos.copy().mult( // Accelerate away from center
        random(particleParamsPreset.accMin, particleParamsPreset.accMax)
    ) 
    return new Particle(
        pos, 
        acc, 
        particleParams.size,
        particleParams.color,
        particleParamsPreset.velMax,
        particleParams.life
    )
}

function horizontalParticle(x) {
    return new Particle(
        new p5.Vector(x, random(-HALF_HEIGHT, HALF_HEIGHT)),
        new p5.Vector(random(particleParamsPreset.accMin, particleParamsPreset.accMax), 0)
            .mult(particleParams.horizontalAcceleration),
        particleParams.size,
        particleParams.color,
        particleParamsPreset.velMax,
        particleParams.life
    )
}

function randomEdgeVector() {
    let dir = floor(random(0,4)) // Pick a random direction
    let edge
    if(dir < 1) { // Left
        edge = new p5.Vector(-HALF_WIDTH, random(-HALF_HEIGHT, HALF_HEIGHT))
    } else if(dir < 2) { // Up
        edge = new p5.Vector(random(-HALF_WIDTH, HALF_WIDTH), -HALF_HEIGHT)
    } else if (dir < 3) { // Right
        edge = new p5.Vector(HALF_WIDTH, random(-HALF_HEIGHT, HALF_HEIGHT))
    } else { // Down
        edge = new p5.Vector(random(-HALF_WIDTH, HALF_WIDTH), HALF_HEIGHT)
    }
    return edge
}

function starwarsParticle() {
    let pos = new p5.Vector(0, 0)
    let acc = p5.Vector.random2D().mult(random(particleParamsPreset.accMin, particleParamsPreset.accMax) * 150)
    // let acc = edge.copy().sub(pos.copy()).mult(random(0.00001, 0.00005))
    return new Particle(
        pos,
        acc,
        3,
        [255, 255, 255],
        8,
        750,
        false,
        true
    )
}