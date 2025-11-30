import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const rotatingObjects = [];

// Create Sun as glowing mesh
function createSun() {
  const color = 0x73430d;
  const geo = new THREE.SphereGeometry(3, 64, 64);
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 4,
    metalness: 0,
    roughness: 0.6
  });
  const sun = new THREE.Mesh(geo, mat);
  sun.name = 'sun';
  return sun;
}

// Load GLTF model
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

// Toggle entity visibility when marker is detected
function toggleVisibility(markerUrl, id) {
  const marker = document.querySelector(`a-nft[url="${markerUrl}"]`);
  const obj = document.querySelector(`#${id}`);
  if (!marker || !obj) return;

  marker.addEventListener('markerFound', () => obj.setAttribute('visible', true));
  marker.addEventListener('markerLost',  () => obj.setAttribute('visible', false));
}

// Initialize scene
async function init() {
  // Load models
  const sun = createSun();
  const mars = await loadModel('/models/mars/mars.gltf', 0.35, { x:0, y:0, z:-1 });
  const moon = await loadModel('/models/moon/moon.gltf', 0.25, { x:0, y:0, z:-0.8 });
  const phoenix = await loadModel('/models/planet_of_phoenix/planet_of_phoenix.gltf', 0.6, { x:0, y:0, z:-1.2 });

  // Attach to A-Frame entities
  document.querySelector('#sun').setObject3D('mesh', sun);
  document.querySelector('#mars').setObject3D('mesh', mars);
  document.querySelector('#moon').setObject3D('mesh', moon);
  document.querySelector('#phoenix').setObject3D('mesh', phoenix);

  // Initially hidden
  ['sun','mars','moon','phoenix'].forEach(id => {
    const el = document.querySelector(`#${id}`);
    if (el) el.setAttribute('visible', false);
  });

  // Marker visibility toggles
  toggleVisibility('assets/markers/1_sun', 'sun');
  toggleVisibility('assets/markers/2_star', 'mars');
  toggleVisibility('assets/markers/3_moon', 'moon');
  toggleVisibility('assets/markers/4_comet', 'phoenix');

  // Rotate objects
  rotatingObjects.push(sun, mars, moon, phoenix);

  // Animation loop using A-Frame renderer
  const sceneEl = document.querySelector('a-scene');
  sceneEl.addEventListener('renderstart', () => {
    const renderer = sceneEl.renderer;
    const camera = sceneEl.camera;

    if (renderer && camera) {
      // Normal camera setup
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;

      camera.fov = 75; // normal FOV
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // Animate rotation
      renderer.setAnimationLoop(() => {
        rotatingObjects.forEach(obj => {
          if (!obj) return;
          obj.rotation.y += 0.002;
        });
      });
    }
  });
}

// Start
init();
