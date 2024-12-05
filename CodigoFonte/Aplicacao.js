import * as THREE from 'three';
import { GUI } from 'gui';
import { GLTFLoader } from 'glTF-loaders';
import InfoPanel from './InfoPanel.js';
import Cameras from './Cameras.js';
import { FlyControls } from 'flyControls';
import Animacao from './Animacao.js';
const cinematicX = 0.0;
const cinematicY = 1.5;
const cinematicZ = -4.0;

export const cameras = {
    PrimeiraPessoa: "firstPerson",
    TerceiraPessoa: "thirdPerson",
    DroneNormal: "clearView",
    Cinematográfica: "cinematic"
}

const initValues = {
    FOV: 75.0,
    near: 0.1,
    Far: 65.0,
    posX: 9.0,
    posY: 4.2,
    posZ: -16.0,
    dirX: -1.0,
    dirY: 0.0,
    dirZ: 0.0,
    Velocidade: 1,
    ÂnguloCâmera: 1.65,
    camera: cameras.TerceiraPessoa,
    MostrarRota: true,
    MostrarKeyPoints: true,
    Informações: false,
    freeCam: null,
    t: 0.0,
    AutoPlay: true,
    Gravity: 1.0
}

class Aplicacao {
    constructor(path=null, points=[], valoresIniciais={}) {
        this.rendSize = new THREE.Vector2();
        this.clock = new THREE.Clock();
        this.cameraDirection = new THREE.Vector3();
        this.scene = null;
        this.renderer = null;
        this.cameras = null;
        this.cameraOrto = null;
        this.controls = null;
        this.infoPanel = null;
        this.gui = new GUI();
        this.initValues = initValues;
        Object.assign(this.initValues, valoresIniciais);
        this.path = path;
        this.points = points;
        //Se não foi especificado freeCam, determina automaticamente pela ausência do path
        this.freeCam = this.initValues.freeCam ?? (path? false: true);
        this.controllers = new Map();
        this.animacao = null;
        this.sceneLoaded = false;
        this.birdLoaded = false;
        this.iniciado = false;
    }

    main() {
        this.initRenderer();
        this.initScene();
        this.initCams();
        this.initGUI();
        this.path && this.makePath();
        !this.freeCam && this.initAnimation();
        this.cameras.setActiveCamera(this.initValues.camera);
        this.infoPanel = new InfoPanel(this.cameras.getActiveCamera(), this);
        this.initModels();
        this.controllers.get("ÂnguloCâmera").setValue(this.initValues.ÂnguloCâmera);
    }

    initRenderer(){
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(new THREE.Color(0.243, 0.435, 0.839));
        const multiplier = 0.93;
        this.rendSize.x = Math.min(window.innerWidth, window.innerHeight) * 2 * multiplier;
        this.rendSize.y = Math.min(window.innerWidth, window.innerHeight) * 1 * multiplier;
        this.renderer.setSize(this.rendSize.x, this.rendSize.y);
        this.renderer.autoClear = false;
        document.body.appendChild(this.renderer.domElement);
    }

    initScene() {
        this.scene = new THREE.Scene();
        const ambLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(ambLight);
    }

    initCams() {
        this.cameras = new Cameras(this.scene)
        .setPosition(this.initValues.posX, this.initValues.posY, this.initValues.posZ);
        this.scene.add(this.cameras.getGroup());

        const firstPerson = new THREE.PerspectiveCamera(this.initValues.FOV, 1.0, this.initValues.near, this.initValues.Far);
        firstPerson.position.set(0.0, -0.18, -0.795);
        firstPerson.rotateX(-0.25);
        this.cameras.addCamera(firstPerson, cameras.PrimeiraPessoa);

        const thirdPerson = new THREE.PerspectiveCamera(this.initValues.FOV, 0.8, this.initValues.near, this.initValues.Far);
        thirdPerson.position.set(0.0, 0.4, 1.7);
        this.cameras.addCamera(thirdPerson, cameras.TerceiraPessoa);

        const cinematic = new THREE.PerspectiveCamera(this.initValues.FOV, 1.0, 1.0, this.initValues.Far);
        cinematic.position.set(cinematicX, cinematicY, cinematicZ);
        cinematic.rotateX(0.4);
        cinematic.rotateY(Math.PI);
        this.cameras.addCameraTranslationOnly(cinematic, cameras.Cinematográfica);

        const clearView = new THREE.PerspectiveCamera(this.initValues.FOV, 1.0, this.initValues.near, this.initValues.Far);
        clearView.position.set(0.0, 0.0, -1.0);
        this.cameras.addCamera(clearView, cameras.DroneNormal);

        this.cameraOrto = new THREE.OrthographicCamera(-65.0, 65.0, 65.0, -65.0, -100.0, 100.0);
        this.cameraOrto.position.set(1.0, 1.0, 1.0);
        this.cameraOrto.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
        if (this.freeCam) {
            this.camControls = new FlyControls(this.cameras.getGroup(), this.renderer.domElement);
            this.camControls.movementSpeed = 10.0;
            this.camControls.rollSpeed = Math.PI / 6.0;
            this.camControls.autoForward = false;
            this.camControls.dragToLook = true;
            this.cameras.setTranslationGroupRotation(this.initValues.dirX, this.initValues.dirY, this.initValues.dirZ);
        } else{
            this.cameras.setDirection(this.initValues.dirX, this.initValues.dirY, this.initValues.dirZ);
        }


    }

    
    initGUI() {
        this.controls = {
            Câmera: this.initValues.camera,
            FOV: this.initValues.FOV,
            near: this.initValues.near,
            Far: this.initValues.Far,
            camPosX: this.initValues.posX,
            camPosY: this.initValues.posY,
            camPosZ: this.initValues.posZ,
            ÂnguloCâmera: this.initValues.ÂnguloCâmera,
            MostrarRota: this.initValues.MostrarRota,
            MostrarKeyPoints: this.initValues.MostrarKeyPoints,
            Informações: this.initValues.Informações,
            Velocidade: this.initValues.Velocidade,
            Reprodução: 0.0,
            Gravidade: this.initValues.Gravity,
            Play: () => {
                this.animacao.play();
                this.controllers.get("Play").hide();
                this.controllers.get("Pause").show();
            },
            Pause: () => {
                this.animacao.pause();
                this.controllers.get("Play").show();
                this.controllers.get("Pause").hide();
            }
        };

        const CameraFolder = this.gui.addFolder('Câmera');
        this.controllers.set("Câmera",
            CameraFolder.add(this.controls, 'Câmera', cameras).onChange(cameraName => {
                this.setActiveCamera(cameraName);
                cameraName === cameras.Cinematográfica ? this.controllers.get("ÂnguloCâmera").show() : this.controllers.get("ÂnguloCâmera").hide();
            })
        );
        this.controllers.set("ÂnguloCâmera",
            CameraFolder.add(this.controls, 'ÂnguloCâmera', -Math.PI, Math.PI, 0.01).onChange(event => {
                const cinematic = this.cameras.getCamera(cameras.Cinematográfica);
                cinematic.position.set(cinematicX, cinematicY, cinematicZ);
                let matrix = new THREE.Matrix4().makeRotationY(this.controls.ÂnguloCâmera);
                cinematic.position.applyMatrix4(matrix);
                cinematic.matrixWorldNeedsUpdate = true;
                cinematic.lookAt(this.cameras.getPosition());
            })
        );
        if(this.initValues.camera !== cameras.Cinematográfica){
            this.controllers.get("ÂnguloCâmera").hide();
        }
        this.controllers.set("FOV",
            CameraFolder.add(this.controls, 'FOV', 50.0, 80.0, 1.0).onChange(event => {
                this.cameras.iterateCameras(
                    camera => {
                        camera.fov = this.controls.FOV;
                    }
                )
            })
        );
        this.controllers.set("Far",
            CameraFolder.add(this.controls, 'Far', 45.0, 100.0, 1.0).onChange(event => {
                this.cameras.iterateCameras(
                    camera => {
                        camera.far = this.controls.Far;
                    }
                )
            })
        );
        CameraFolder.open();
        if(this.path){
            const AnimationFolder = this.gui.addFolder('Animação');
            this.controllers.set("Play",
                AnimationFolder.add(this.controls, 'Play')
            );
            this.controllers.set("Pause",
                AnimationFolder.add(this.controls, 'Pause')
            );
            if(this.initValues.AutoPlay){
                this.controllers.get("Play").hide();
            } else {
                this.controllers.get("Pause").hide();
            }
            this.controllers.set("Velocidade",
                AnimationFolder.add(this.controls, 'Velocidade', 0.25, 3.5, 0.05).onChange(event => {
                    this.animacao.setVelocidadeBase(this.controls.Velocidade);
                })
            );
            this.controllers.set("Reprodução",
                AnimationFolder.add(this.controls, 'Reprodução', 0.0, 1.0, 0.005).onChange(event => {
                    this.animacao.setT(this.controls.Reprodução);
                })
            );
            AnimationFolder.open();
            const OthersFolder = this.gui.addFolder('Outros');
            this.controllers.set("Gravidade",
                OthersFolder.add(this.controls, 'Gravidade', 0.0, 5.0, 0.1).onChange(event => {
                    this.animacao.setGravity(this.controls.Gravidade);
                })
            );
            this.controllers.set("MostrarRota",
                OthersFolder.add(this.controls, 'MostrarRota').onChange(event => {
                    this.pathLine.visible = this.controls.MostrarRota;
                })
            );
            this.controllers.set("MostrarKeyPoints",
                OthersFolder.add(this.controls, 'MostrarKeyPoints').onChange(event => {
                    this.pontosInstances.visible = this.controls.MostrarKeyPoints;
                })
            );
            this.controllers.set("Informações",
                OthersFolder.add(this.controls, 'Informações').onChange(event => {
                    this.controls.Informações ? this.infoPanel.show() : this.infoPanel.hide();
                })
            );
            OthersFolder.close();
        } else{
            this.controllers.set("Informações",
                this.gui.add(this.controls, 'Informações').onChange(event => {
                    this.controls.Informações ? this.infoPanel.show() : this.infoPanel.hide();
                })
            );
        }

    }

    makePath() {
        const spline = this.path;
        const points = spline.getPoints(70);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const material = new THREE.LineBasicMaterial({
            color: 0xff0000,
        });
        this.pathLine = new THREE.Line(geometry, material);
        this.pathLine.name = "path";
        const sphereGeometry = new THREE.SphereGeometry(1, 15, 15);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        this.pontosInstances = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, this.points.length);
        this.pontosInstances.instanceMatrix.setUsage(THREE.StaticDrawUsage);
        for (let i = 0; i < this.points.length; i++) {
            const matrix = new THREE.Matrix4();
            matrix.makeTranslation(this.points[i]);
            this.pontosInstances.setMatrixAt(i, matrix);
        }
        this.scene.add(this.pontosInstances);
        this.scene.add(this.pathLine);
    }

    initAnimation() {
        this.animacao = new Animacao(this);
    }

    initModels() {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load('../Models/book/scene.gltf', this.loadMeshToScene.bind(this));
        gltfLoader.load('../Models/bird/scene.gltf', this.loadMeshToCameras.bind(this));

    }

    iniciar() {
        document.querySelector("#carregando").style.display = "none";
        this.iniciado = true;
        this.anime();
    }

    loadMeshToScene(loadedMesh) {
        const root = loadedMesh.scene;
        root.name = "livro";
        this.scene.add(root);
        this.sceneLoaded = true;
        if (this.birdLoaded){
            this.iniciar();
        }
        setTimeout(() => {
            if(!this.iniciado){
                this.iniciar();
            }
        }, 2000);
    }

    loadMeshToCameras(loadedMesh) {
        const root = loadedMesh.scene;
        root.name = "passaro";
        const scale = 1.0;
        root.scale.set(scale, scale, -scale);
        root.position.set(0.0, -0.3, 0.0);
        this.cameras.addObject(root);
        this.birdLoaded = true;
        if (this.sceneLoaded){
            this.iniciar();
        }
        setTimeout(() => {
            if(!this.iniciado){
                this.iniciar();
            }
        }, 2000);
    }

    render(delta) {
        if (!this.freeCam) {
            this.animacao.update(delta);
            this.cameras.setPosition(this.animacao.getPosition());
            this.cameras.setDirection(this.animacao.getDirection());
        } else {
            this.camControls.update(delta);
        }
        this.renderer.clear(true, true);
        this.renderer.setViewport(0.0, 0.0, this.rendSize.x / 2.0, this.rendSize.y);
        this.cameras.update();
        this.cameras.hideHelper();
        if (this.path) {
            this.pontosInstances.visible = false;
            this.pathLine.visible = false;
        }

        this.renderer.render(this.scene, this.cameras.getActiveCamera());

        this.renderer.setViewport(this.rendSize.x / 2.0, 0.0, this.rendSize.x / 2.0, this.rendSize.y);
        this.cameraOrto.updateProjectionMatrix();
        this.cameras.showHelper();
        if (this.path) {
            this.pontosInstances.visible = this.controls.MostrarKeyPoints;
            this.pathLine.visible = this.controls.MostrarRota;
        }
        this.renderer.render(this.scene, this.cameraOrto);
        this.controls.Informações && this.infoPanel.update();
    }

    setActiveCamera(cameraName) {
        this.cameras.setActiveCamera(cameraName);
        this.infoPanel.setCamera(this.cameras.getActiveCamera());
    }

    anime() {
        const delta = this.clock.getDelta();
        this.render(delta);
        requestAnimationFrame(this.anime.bind(this));
    }
}
export default Aplicacao;
