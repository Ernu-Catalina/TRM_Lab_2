import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const rotatingObjects = [];
let sunLight;

if (sceneEl.camera) {
  // Set a wider Field Of View (increase value to reduce zoom)
  sceneEl.camera.fov = 250; // try values 60-90; larger = wider view (less zoom)
  sceneEl.camera.updateProjectionMatrix();
}

// Function to create glowing sun sphere
function createSun() {
  const sunColor = 0x73430d;
  const sunGeo = new THREE.SphereGeometry(3, 64, 64);
  const sunMat = new THREE.MeshStandardMaterial({
    color: sunColor,
    emissive: sunColor,
    emissiveIntensity: 4,
    metalness: 0,
    roughness: 0.6
  });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  sun.name = 'sun';

  // Halo using PointLight
  sunLight = new THREE.PointLight(sunColor, 2.5, 50, 2);
  sun.add(sunLight);

  return sun;
}

// Load GLTF models
function loadModel(path, scale = 1, position = { x:0, y:0, z:0 }) {
  return new Promise((resolve, reject) => {
    loader.load(path, (gltf) => {
      const model = gltf.scene;
      model.scale.set(scale, scale, scale);
      model.position.set(position.x, position.y, position.z);
      resolve(model);
    }, undefined, (err) => reject(err));
  });
}

// Initialize each NFT entity with 3D object
async function init() {
  const sun = createSun();
  const mars = await loadModel('/models/mars/mars.gltf', 0.7, { x:8, y:0, z:0 });
  const moon = await loadModel('/models/moon/moon.gltf', 0.5, { x:5, y:0, z:0 });
  const phoenix = await loadModel('/models/planet_of_phoenix/planet_of_phoenix.gltf', 1, { x:12, y:0, z:0 });

  // Attach models to AR entities
  document.querySelector('#sun').setObject3D('mesh', sun);
  document.querySelector('#mars').setObject3D('mesh', mars);
  document.querySelector('#moon').setObject3D('mesh', moon);
  document.querySelector('#phoenix').setObject3D('mesh', phoenix);

  // Rotate planets
  rotatingObjects.push(sun, mars, moon, phoenix);

  // Animate rotation
  const sceneEl = document.querySelector('a-scene');
  sceneEl.addEventListener('renderstart', () => {
    // Improve renderer quality by using device pixel ratio and explicit renderer sizing.
    // This reduces the blocky/low-quality camera feed on high-DPI screens.
    try {
      if (sceneEl.renderer) {
        sceneEl.renderer.setPixelRatio(window.devicePixelRatio || 1);
        sceneEl.renderer.setSize(window.innerWidth, window.innerHeight);
        // Improve color encoding / tonemapping for nicer visuals
        sceneEl.renderer.outputEncoding = THREE.sRGBEncoding;
        sceneEl.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        sceneEl.renderer.toneMappingExposure = 1.0;
      }

      // Set a slightly wider camera FOV to prevent the camera view from feeling "zoomed in".
      if (sceneEl.camera) {
        // Use a comfortable FOV; feel free to tweak between 50-75 depending on device.
        sceneEl.camera.fov = 60;
        sceneEl.camera.updateProjectionMatrix();
      }
    } catch (err) {
      // Defensive: some A-Frame internal states may not be fully available on some devices.
      console.warn('Failed to adjust renderer/camera settings:', err);
    }
    sceneEl.renderer.setAnimationLoop(() => {
      rotatingObjects.forEach((obj, i) => {
        if (!obj) return;
        obj.rotation.y += 0.002 + i * 0.001; // different speeds
        if (obj.name === 'moon') obj.rotation.y += 0.0005;
        if (obj.name === 'phoenix') obj.rotation.y += 0.003;
      });
    });
  });
}

// Initialize AR
init();
