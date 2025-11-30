import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const rotatingObjects = [];

// Create a glowing Sun
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
  const sun = new THREE.Mesh(geo, mat);
  return sun;
}

// Load a GLTF model
function loadModel(path, scale = 1) {
  return new Promise((resolve, reject) => {
    loader.load(path, (gltf) => {
      const model = gltf.scene;
      model.scale.set(scale, scale, scale);
      resolve(model);
    }, undefined, (err) => reject(err));
  });
}

// Initialize scene
async function init() {
  // Load objects
  const sun = createSun();
  const mars = await loadModel('/models/mars/mars.gltf', 0.35);
  const moon = await loadModel('/models/moon/moon.gltf', 0.25);
  const phoenix = await loadModel('/models/planet_of_phoenix/planet_of_phoenix.gltf', 0.6);

  // Attach to A-Frame entities
  document.querySelector('#sun').setObject3D('mesh', sun);
  document.querySelector('#mars').setObject3D('mesh', mars);
  document.querySelector('#moon').setObject3D('mesh', moon);
  document.querySelector('#phoenix').setObject3D('mesh', phoenix);

  // Push to rotating array
  rotatingObjects.push(sun, mars, moon, phoenix);

  // Setup lights
  const sceneEl = document.querySelector('a-scene');
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  const directional = new THREE.DirectionalLight(0xffffff, 0.6);
  directional.position.set(0, 1, 1);
  sceneEl.object3D.add(ambient);
  sceneEl.object3D.add(directional);

  // Animate rotation
  sceneEl.addEventListener('renderstart', () => {
    const renderer = sceneEl.renderer;
    const camera = sceneEl.camera;

    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;

    camera.fov = 75;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setAnimationLoop(() => {
      rotatingObjects.forEach(obj => {
        if (!obj) return;
        obj.rotation.y += 0.002;
      });
    });
  });
}

init();
