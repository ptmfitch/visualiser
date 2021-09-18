class Particle {


    constructor(
        pos, vel, acc, 
        w=PARTICLE_CONFIG.w, fill=PARTICLE_CONFIG.fill,
        velMax=PARTICLE_PRESET.velMax, ampResponsive=PARTICLE_PRESET.ampResponsive,
        life=PARTICLE_CONFIG.life, invertFade=PARTICLE_PRESET.invertFade
    ) {
        this.pos = pos
        this.acc = acc 
        this.vel = vel

        this.velMax = velMax
        this.ampResponsive = ampResponsive

        this.size = w
        this.fill = color(fill)

        this.maxLife = life
        this.life = life
        this.invertFade = invertFade
    }


    update() {

        this.vel.add(this.acc)
        this.vel.limit(this.velMax)

        if(this.ampResponsive) {
            this.pos.add(this.vel.copy().mult(BASS_AMP / 64))
        } else {
            this.pos.add(this.vel)
        }

        this.life -= 1
        if(this.invertFade) {
            this.fill.setAlpha(map(this.life, 0, this.maxLife, 255, 0))
        } else {
            this.fill.setAlpha(map(this.life, 0, this.maxLife, 0, 255))
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
        fill(this.fill)
        ellipse(this.pos.x, this.pos.y, this.size)
    }


}
