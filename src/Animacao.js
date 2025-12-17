import * as THREE from 'three';

class Animacao {
    constructor (app) {
        this.app = app;
        const init = this.app.initValues;
        this.direction = new THREE.Vector3(init.dirX, init.dirY, init.dirZ);
        this.t = this.app.initValues.t;
        this.position = this.app.path.getPointAt(this.t);
        this.velocidadeBase = init.Speed;
        this.isPlaying = this.app.initValues.AutoPlay;
        this.gravity = init.Gravity;
    }

    play() {
        this.isPlaying = true;
    }

    pause() {
        this.isPlaying = false;
    }

    update(delta) {
        if (!this.isPlaying) {
            delta=0;
        }
        this.t +=  delta * this.getSpeed();
        if (this.t > 1) {
            this.t -= 1;
        }
        if(delta>0){
            this.app.controllers.get("Playback").setValue(this.t);
        }
        this.position = this.app.path.getPointAt(this.t);
        this.direction = this.calcDirection();
    }

    calcDirection() {
        return this.app.path.getTangentAt(this.t);
    }

    getPosition() {
        return this.position;
    }

    getDirection() {
        return this.direction;
    }

    getT() {
        return this.t;
    }

    setT(t) {
        this.t = t;
        this.app.render(0);
    }

    setGravity(gravity) {
        this.gravity = gravity;
    }

    setVelocidadeBase(Speed) {
        this.velocidadeBase = Speed;
    }

    getSpeed() {
        const down = (Math.min(this.direction.y,0))**2 * this.gravity * 2.0;
        const speed =  (265.0/this.app.path.getLength()) * 0.025 * this.velocidadeBase * (1.0 + down);
        return speed;
    }
}

export default Animacao;