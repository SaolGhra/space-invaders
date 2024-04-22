import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


// Load spaceship texture
const loader = new GLTFLoader();
const spaceshipPath = '../models/spaceship1/';

loader.load(spaceshipPath + 'scene.gltf', (gltf) => {

  const spaceshipMesh = gltf.scene;
  spaceshipMesh.position.set(0, 0, 0);
  spaceshipMesh.scale.set(1, 1, 1);

  scene.add(spaceshipMesh);

}, undefined, (error) => {
  console.error(error);
});

// Create ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Define keyboard controls
const keyboardState = {};
document.addEventListener('keydown', (event) => {
  keyboardState[event.code] = true;
});
document.addEventListener('keyup', (event) => {
  keyboardState[event.code] = false;
});

// Define initial position for the spaceship
let spaceshipPosition = { x: 0, y: 0 };

// Function to handle player movement
function handlePlayerMovement() {
  const speed = 0.1;
  if (keyboardState['KeyW']) {
    spaceshipPosition.y += speed;
  }
  if (keyboardState['KeyS']) {
    spaceshipPosition.y -= speed;
  }
  if (keyboardState['KeyA']) {
    spaceshipPosition.x -= speed;
  }
  if (keyboardState['KeyD']) {
    spaceshipPosition.x += speed;
  }
}

// Function to create stars
function createStars() {
  const starCount = 1000; // Adjust as needed
  const starGeometry = new THREE.SphereGeometry(0.1, 32, 32);
  const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  for (let i = 0; i < starCount; i++) {
    const star = new THREE.Mesh(starGeometry, starMaterial);
    const distance = 100; // Adjust the distance from the camera
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = Math.random() * Math.PI * 2;
    const x = Math.sin(angle1) * Math.cos(angle2) * distance;
    const y = Math.sin(angle2) * distance;
    const z = Math.cos(angle1) * Math.cos(angle2) * distance;

    star.position.set(x, y, z);
    scene.add(star);
  }
}

// Call the function to create stars
createStars();

// Set up camera position
camera.position.z = 5;

// Function to handle window resizing
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

// Function to update the game state
function update() {
  handlePlayerMovement();
}

// Function to render the scene
function render() {
  renderer.render(scene, camera);
}

// Function to animate the game
function animate() {
  requestAnimationFrame(animate);
  update();
  render();
}
animate();
