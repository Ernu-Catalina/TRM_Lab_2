import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const rotatingObjects = [];
let sunLight;

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

// Initialize AR scene
async function init() {
  const sun = createSun();
  const mars = await loadModel('/models/mars/mars.gltf', 0.35, { x: 0, y: 0, z: -2 });
  const moon = await loadModel('/models/moon/moon.gltf', 0.25, { x: 0, y: 0, z: -2 });
  const phoenix = await loadModel('/models/planet_of_phoenix/planet_of_phoenix.gltf', 0.6, { x: 0, y: 0, z: -2 });

  // Attach models to AR entities
  document.querySelector('#sun').setObject3D('mesh', sun);
  document.querySelector('#mars').setObject3D('mesh', mars);
  document.querySelector('#moon').setObject3D('mesh', moon);
  document.querySelector('#phoenix').setObject3D('mesh', phoenix);

  // Start hidden until marker is found
  ['sun','mars','moon','phoenix'].forEach(id => {
    const el = document.querySelector(`#${id}`);
    if (el) el.setAttribute('visible', false);
  });

  // Toggle visibility with marker events
  function toggleVisibility(markerUrl, id) {
    const markerEl = document.querySelector(`a-nft[url="${markerUrl}"]`);
    const objEl = document.querySelector(`#${id}`);
    if (!markerEl || !objEl) return;
    markerEl.addEventListener('markerFound', () => objEl.setAttribute('visible', true));
    markerEl.addEventListener('markerLost', () => objEl.setAttribute('visible', false));
  }
  toggleVisibility('assets/markers/1_sun', 'sun');
  toggleVisibility('assets/markers/2_star', 'mars');
  toggleVisibility('assets/markers/3_moon', 'moon');
  toggleVisibility('assets/markers/4_comet', 'phoenix');

  // Rotate planets
  rotatingObjects.push(sun, mars, moon, phoenix);

  const sceneEl = document.querySelector('a-scene');

  // Fix camera FOV and renderer after scene is loaded
  sceneEl.addEventListener('loaded', () => {
    try {
      // Camera setup
      const cam = sceneEl.camera;
      if (cam && cam.isPerspectiveCamera) {
        cam.fov = 60;           // Normal phone camera FOV
        cam.near = 0.1;
        cam.far = 1000;
        cam.updateProjectionMatrix();
      }

      // Renderer setup
      if (sceneEl.renderer) {
        sceneEl.renderer.setPixelRatio(window.devicePixelRatio || 1);
        sceneEl.renderer.setSize(window.innerWidth, window.innerHeight);
        sceneEl.renderer.outputEncoding = THREE.sRGBEncoding;
        sceneEl.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        sceneEl.renderer.toneMappingExposure = 1.0;
      }
    } catch (err) {
      console.warn('Failed to adjust renderer/camera settings:', err);
    }

    // Rotation animation
    sceneEl.renderer.setAnimationLoop(() => {
      rotatingObjects.forEach((obj, i) => {
        if (!obj) return;
        obj.rotation.y += 0.002 + i * 0.001;
        if (obj.name === 'moon') obj.rotation.y += 0.0005;
        if (obj.name === 'phoenix') obj.rotation.y += 0.003;
      });
    });
  });
}

// Initialize AR
init();
