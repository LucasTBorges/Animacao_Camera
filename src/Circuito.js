import Aplicacao from "./Aplicacao.js";
import * as THREE from 'three';

let keypoints = [
    [26.0, 4.2, 49.3],
    [3.0, 2.2, 42.2],
    [-3.5, -2.0, 27.1], //Ponte
    [-5.0, -1.1, 18.9],
    [-13.1,1.8,6.7],
    [-24.7, 0.9, 14.2], //Cervos
    [-39.6, 0.2, 28.2], //Moinho
    [-59.6,4.0,19.8],
    [-50.7, 9.6, -15.0],
    [-26.9, 12.2, -16.2], //Castelo
    [-12.7, 2.0, -15.9], //Porta
    [0, 0.85, -15.6],
    [18.5,2.6,2.6]
]
keypoints = keypoints.map(p => new THREE.Vector3(p[0], p[1], p[2]))

const path = new THREE.CatmullRomCurve3(keypoints, true, "catmullrom",0.6);

const initValues = {
    Far: 85.0,
    t: 0.1
}
const app = new Aplicacao(path, keypoints, initValues);
app.main();