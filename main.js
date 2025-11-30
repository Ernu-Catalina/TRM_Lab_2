import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const rotatingObjects = [];

// Create Sun mesh
function createSun() {
    const color = 0x73430d;
    const geo = new THREE.SphereGeometry(1.5, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 4,
        metalness: 0,
        roughness: 0.6
    });
    return new THREE.Mesh(geo, mat);
}

// Load GLTF model
function loadModel(path, scale = 1) {
    return new Promise((resolve, reject) => {
        loader.load(path, (gltf) => {
            const model = gltf.scene;
            model.scale.set(scale, scale, scale);
            resolve(model);
        }, undefined, reject);
    });
}

// Initialize scene objects
async function initScene() {
    const sun = createSun();
    const mars = await loadModel('/models/mars/mars.gltf', 0.35);
    const moon = await loadModel('/models/moon/moon.gltf', 0.25);
    const phoenix = await loadModel('/models/planet_of_phoenix/planet_of_phoenix.gltf', 0.6);

    // Attach to A-Frame entities
    document.querySelector('#sun').setObject3D('mesh', sun);
    document.querySelector('#mars').setObject3D('mesh', mars);
    document.querySelector('#moon').setObject3D('mesh', moon);
    document.querySelector('#phoenix').setObject3D('mesh', phoenix);

    rotatingObjects.push(sun, mars, moon, phoenix);

    // Animate rotation
    const sceneEl = document.querySelector('a-scene');
    sceneEl.addEventListener('renderstart', () => {
        sceneEl.renderer.setAnimationLoop(() => {
            rotatingObjects.forEach(obj => {
                if (!obj) return;
                obj.rotation.y += 0.002;
            });
        });
    });
}

// Start AR: request camera access on user gesture
document.getElementById('start-btn').addEventListener('click', async () => {
    const video = document.getElementById('video');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false
        });
        video.srcObject = stream;
        await video.play();

        // Assign video as texture to plane
        const planeEl = document.querySelector('#video-bg');
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;
        planeEl.getObject3D('mesh').material.map = videoTexture;
        planeEl.getObject3D('mesh').material.needsUpdate = true;

        // Hide start button
        document.getElementById('start-btn').style.display = 'none';

        // Initialize objects after camera feed is ready
        await initScene();

    } catch(err) {
        console.warn('Camera access failed:', err);
        alert('Camera access is required for AR.');
    }
});
