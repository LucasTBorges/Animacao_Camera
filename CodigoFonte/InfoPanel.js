import * as THREE 	from 'three';

class InfoPanel {
    
    constructor(camera, aplicacao){
        this.camera = camera;
        this.app = aplicacao;
        this.cameras = aplicacao.cameras;
        this.cameraPosition = new THREE.Vector3(0.0, 0.0, 0.0);
        this.cameraDirection = new THREE.Vector3(0.0, 0.0, 0.0);
        this.cameraWorldPosition = new THREE.Vector3(0.0, 0.0, 0.0);
        this.span = document.querySelector("#vetores-camera");
        if (aplicacao.path){
            this.pathLength = aplicacao.path.getLength();
        }
        this.makeSpans();
        this.onInit();
    }

    onInit() {
        this.camPositionSpan = document.querySelector("#posicao");
        this.camLookAtSpan = document.querySelector("#direcao");
        this.camPositionWorldSpan = document.querySelector("#posicao-world");
        this.transGpRot = document.querySelector("#translation-gp-rot");
        this.rotGpRot = document.querySelector("#rotation-gp-rot");
        this.posGp = document.querySelector("#posicao-gp");
        this.time = document.querySelector("#time");
        this.pathLengthSpan = document.querySelector("#path-length");
        if (this.app.initValues.Informações) {
            this.update();
        } else {
            this.hide();
        }
    }

    update() {
        this.camera.getWorldDirection(this.cameraDirection)
        this.camPositionSpan.innerHTML = `Posição no Grupo: (${this.camera.position.x.toFixed(1)}, ${this.camera.position.y.toFixed(1)}, ${this.camera.position.z.toFixed(1)})`
        this.camera.getWorldPosition(this.cameraWorldPosition)
        this.camPositionWorldSpan.innerHTML = `Posição no Mundo: (${this.cameraWorldPosition.x.toFixed(1)}, ${this.cameraWorldPosition.y.toFixed(1)}, ${this.cameraWorldPosition.z.toFixed(1)})`
        this.camLookAtSpan.innerHTML = `Direção: (${this.cameraDirection.x.toFixed(1)}, ${this.cameraDirection.y.toFixed(1)}, ${(this.cameraDirection.z).toFixed(1)})`
        const rotationGroup = this.cameras.getRotationGroup();
        const translationGroup = this.cameras.getGroup();
        this.posGp.innerHTML = `Posição no Mundo: (${translationGroup.position.x.toFixed(1)}, ${translationGroup.position.y.toFixed(1)}, ${translationGroup.position.z.toFixed(1)})`
        const translationGpRot = translationGroup.rotation;
        const rotationGpRot = rotationGroup.rotation;
        this.rotGpRot.innerHTML = `Rotação do Grupo de Rotação: (${rotationGpRot.x.toFixed(1)}, ${rotationGpRot.y.toFixed(1)}, ${rotationGpRot.z.toFixed(1)})`
        if (this.app.freeCam) {
            this.transGpRot.innerHTML = `Rotação do Grupo de Translação: (${translationGpRot.x.toFixed(1)}, ${translationGpRot.y.toFixed(1)}, ${translationGpRot.z.toFixed(1)})`

        }
        if (this.app.animacao) {
            this.time.innerHTML = `T: ${this.app.animacao.getT().toFixed(3)}`
            this.pathLengthSpan.innerHTML = `Comprimento do Circuito: ${this.pathLength.toFixed(2)}`
        }

    }

    setCamera(camera) {
        this.camera = camera;
        this.camera.getWorldDirection(this.cameraDirection)
        this.cameraPosition = this.camera.position;
        this.update();
    }

    show() {
        this.span.style.display = "block";
    }

    hide() {
        this.span.style.display = "none";
    }

    makeSpans() {
        const htmlContent = `
            <span><strong>Informações da Câmera:</strong></span><br>
            <span id="posicao"></span><br>
            <span id="posicao-world"></span><br>
            <span id="direcao"></span><br>
            <span><strong>Informações do grupo:</strong></span><br>
            <span id="rotation-gp-rot"></span><br>
            <span style="${this.app.freeCam?"":"display: None"}" id="translation-gp-rot"></span>${this.app.freeCam?"<br>":""}
            <span id="posicao-gp"></span>${this.app.path?"<br>":""}
            <span style="${this.app.path?"":"display: None"}"><strong>Informações da animação:</strong></span>${this.app.path?"<br>":""}
            <span id="time" style="${this.app.path?"":"display: None"}"></span>${this.app.path?"<br>":""}
            <span id="path-length" style="${this.app.path?"":"display: None"}"></span>
        `;
        this.span.innerHTML = htmlContent;
    }
    
}


export default InfoPanel;