import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ----- Scene, Camera, Renderer -----
const scene = new THREE.Scene();

// Camera at 45° top-front
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(25, 25, 25);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.getElementById('three-canvas')
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// ----- Lights -----
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(10, 40, 10);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// ----- Sun: glowing sphere -----
const sunColor = 0x73430d; // dark orange-brown
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(3, 64, 64),
  new THREE.MeshStandardMaterial({
    color: sunColor,
    emissive: sunColor,
    emissiveIntensity: 5,
    metalness: 0,
    roughness: 0.6
  })
);
sun.position.set(0, 0, 0);
scene.add(sun);

// Sun point light for glow
const sunLight = new THREE.PointLight(sunColor, 2, 100, 2);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Glow halo
const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(4.5, 64, 64),
  new THREE.MeshBasicMaterial({
    color: sunColor,
    transparent: true,
    opacity: 0.2
  })
);
sunGlow.position.set(0, 0, 0);
scene.add(sunGlow);

// ----- Helper function to load models -----
const loader = new GLTFLoader();

function loadModel(path, scale = 1, position = { x: 0, y: 0, z: 0 }) {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(scale, scale, scale);
        model.position.set(position.x, position.y, position.z);
        scene.add(model);
        resolve(model);
      },
      undefined,
      (err) => {
        console.error('Error loading', path, err);
        reject(err);
      }
    );
  });
}

// ----- Load planets -----
const rotatingObjects = [];
const orbitObjects = [];

async function loadAllModels() {
  const mars = await loadModel('/models/mars.gltf', 0.7, { x: 15, y: 0, z: 0 });
  const moon = await loadModel('/models/moon.gltf', 0.6, { x: 8, y: 0, z: 0 });
  const phoenix = await loadModel('/models/planet_of_phoenix.gltf', 1, { x: 22, y: 0, z: 0 });

  // Add planets to rotation arrays
  rotatingObjects.push(mars, moon, phoenix);
  orbitObjects.push({ obj: mars, radius: 15, speed: 0.003 });
  orbitObjects.push({ obj: moon, radius: 8, speed: 0.001 });
  orbitObjects.push({ obj: phoenix, radius: 22, speed: 0.006 });

  rotatingObjects.push(sun); // Sun rotates slowly
}

loadAllModels();

// ----- NFT Marker Order Enforcement -----
const markerOrder = ["sun", "moon", "mars", "phoenix"];
let currentIndex = 0;

markerOrder.forEach((id, index) => {
  const marker = document.querySelector(`#${id}`).parentNode; // parent is <a-nft>
  const entity = document.querySelector(`#${id}`);
  const text = entity.nextElementSibling;

  marker.addEventListener('markerFound', () => {
    if(index === currentIndex) {
      entity.setAttribute('visible', true);
      text.setAttribute('visible', true);
      currentIndex++;
    } else {
      entity.setAttribute('visible', false);
      text.setAttribute('visible', false);
    }
  });

  marker.addEventListener('markerLost', () => {
    entity.setAttribute('visible', false);
    text.setAttribute('visible', false);
  });
});

// ----- Animation loop -----
let orbitAngles = [0, 0, 0]; // for mars, moon, phoenix

function animate() {
  requestAnimationFrame(animate);

  // Rotate planets on their own axes
  rotatingObjects.forEach(obj => {
    obj.rotation.y += 0.002;
  });

  // Orbit planets around Sun
  orbitObjects.forEach((planet, index) => {
    orbitAngles[index] += planet.speed;
    planet.obj.position.x = planet.radius * Math.cos(orbitAngles[index]);
    planet.obj.position.z = planet.radius * Math.sin(orbitAngles[index]);
  });

  // Sun pulsating glow
  const pulse = 0.15 * Math.sin(Date.now() * 0.005);
  sunGlow.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
  sunLight.intensity = 2 + pulse * 5;

  renderer.render(scene, camera);
}

animate();

// ----- Handle window resizing -----
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
