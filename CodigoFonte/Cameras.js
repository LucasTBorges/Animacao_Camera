import * as THREE from 'three';
class Cameras {
    constructor(scene) {
        this.cameras = new Map();
        this.helpers = new Map();
        this.scene = scene;
        this.activeCamera = null;
        this.rotationGroup = new THREE.Group();
        this.translationGroup = new THREE.Group();
        this.translationGroup.add(this.rotationGroup);
        scene.add(this.translationGroup);
    }

    getPosition() {
        return this.translationGroup.position;
    }

    addObject(object) {
        this.rotationGroup.add(object);
        return this;
    }

    getObject(name) {
        return this.rotationGroup.getObjectByName(name);
    }

    removeObject(name) {
        this.rotationGroup.remove(this.rotationGroup.getObjectByName(name));
        return this;
    }

    addCamera(camera, name) {
        camera.name = name;
        this.cameras.set(name, camera);
        this.rotationGroup.add(camera);
        let cameraHelper = new THREE.CameraHelper(camera);
        this.helpers.set(name, cameraHelper);
        this.scene.add(cameraHelper);
        return this;
    }

    addCameraTranslationOnly(camera, name) {
        camera.name = name;
        this.cameras.set(name, camera);
        this.translationGroup.add(camera);
        let cameraHelper = new THREE.CameraHelper(camera);
        this.helpers.set(name, cameraHelper);
        this.scene.add(cameraHelper);
        return this;
    }

    getGroup() {
        return this.translationGroup;
    }

    getRotationGroup() {
        return this.rotationGroup;
    }

    getCamera(name) {
        return this.cameras.get(name);
    }

    getCameraHelper(name) {
        return this.helpers.get(name);
    }

    getCameras() {
        return Array.from(this.cameras.values());
    }

    getCameraHelpers() {
        return Array.from(this.helpers.values());
    }

    removeCamera(name) {
        this.cameras.delete(name);
        if (this.rotationGroup.getObjectByName(name)) {
            this.rotationGroup.remove(this.cameras.get(name));
        } else {
            this.translationGroup.remove(this.cameras.get(name));
        }
        this.helpers.delete(name);
        this.scene.remove(this.helpers.get(name));
        return this;
    }

    setActiveCamera(name) {
        this.activeCamera = this.cameras.get(name);
        this.helpers.forEach((helper, key) => {
            helper.visible = key === name;
        })
        return this;
    }

    getActiveCamera() {
        return this.activeCamera;
    }

    yaw(angle) {
        this.rotationGroup.rotateY(angle);
        return this;
    }

    pitch(angle) {
        this.rotationGroup.rotateX(angle);
        return this;
    }

    roll(angle) {
        this.rotationGroup.rotateZ(angle);
        return this;
    }

    translateOnAxis(axis, distance) {
        this.translationGroup.translateOnAxis(axis, distance);
        return this;
    }

    translateX(distance) {
        this.translationGroup.translateX(distance);
        return this;
    }

    translateY(distance) {
        this.translationGroup.translateY(distance);
        return this;
    }

    translateZ(distance) {
        this.translationGroup.translateZ(distance);
        return this;
    }

    moveForward(distance) {
        let direction;
        this.rotationGroup.getWorldDirection(direction);
        this.translationGroup.translateOnAxis(direction, distance);
        return this;
    }

    setPosition(x, y, z) {
        if (x instanceof THREE.Vector3) {
            this.translationGroup.position.copy(x);
        } else {
            this.translationGroup.position.set(x, y, z);
        }
        return this;
    }

    setDirection(x, y, z) {
        let position = new THREE.Vector3();
        this.translationGroup.getWorldPosition(position);
        if (!(x instanceof THREE.Vector3)) {
            x = new THREE.Vector3(x, y, z);
        }
        this.rotationGroup.lookAt(new THREE.Vector3().subVectors(position, x));
        return this;
    }

    setTranslationGroupRotation(x, y, z) {
        let position = new THREE.Vector3();
        this.translationGroup.getWorldPosition(position);
        if (!(x instanceof THREE.Vector3)) {
            x = new THREE.Vector3(x, y, z);
        }
        this.translationGroup.lookAt(new THREE.Vector3().subVectors(position, x));
        return this;
    }

    iterateCameras(callback) {
        this.cameras.forEach(callback);
        return this;
    }

    hideHelper() {
        this.helpers.get(this.activeCamera.name).visible = false;
        return this;
    }

    showHelper() {
        this.helpers.get(this.activeCamera.name).visible = true;
        return this;
    }

    update() {
        this.iterateCameras(camera => {
            camera.updateProjectionMatrix();
        });
        this.helpers.forEach(helper => {
            helper.update();
        });
        return this;
    }

    static findTurnDirection(lastPos, newPos) {
        let direction = new THREE.Vector3().subVectors(newPos, lastPos);
        return direction;
    }
    
}

export default Cameras;