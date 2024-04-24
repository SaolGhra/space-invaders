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
let spaceshipMesh;

loader.load(spaceshipPath + 'scene.gltf', (gltf) => {
  spaceshipMesh = gltf.scene;
  spaceshipMesh.position.set(0, 0, 0);
  spaceshipMesh.scale.set(0.2, 0.2, 0.2);
  spaceshipMesh.rotation.x = Math.PI / 2; 

  scene.add(spaceshipMesh);
}, undefined, (error) => {
  console.error(error);
});

// Section for moving the spaceship

// Define initial position for the spaceship
let spaceshipPosition = { x: 0, y: -2.7 };
let keyboardState = {};

// Add event listeners for keydown and keyup events
window.addEventListener('keydown', (event) => {
  keyboardState[event.code] = true;
});

window.addEventListener('keyup', (event) => {
  keyboardState[event.code] = false;
});

// Function to handle player movement
function handlePlayerMovement() {
  // Check if spaceshipMesh is defined
  if (!spaceshipMesh) {
    return;
  }

  const speed = 0.1;
  const boundArea = 7;

  if (keyboardState['KeyA']) {
    spaceshipPosition.x -= speed;
    if (spaceshipPosition.x < -boundArea) {
      spaceshipPosition.x = -boundArea;
    }
  }
  if (keyboardState['KeyD']) {
    spaceshipPosition.x += speed;
    if (spaceshipPosition.x > boundArea) {
      spaceshipPosition.x = boundArea;
    }
  }

  spaceshipMesh.position.set(spaceshipPosition.x, spaceshipPosition.y, spaceshipPosition.z);
}

// Section for shooting bullets from the spaceship

// Add event listener for 'Space' key press
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    shootPlanet();
  }
});

// Create a bullet group
const bulletGroup = new THREE.Group();
scene.add(bulletGroup);

// Load bullet model
const planetPath = '../models/planet/';
let planetMesh;

loader.load(planetPath + 'scene.gltf', (gltf) => {
  planetMesh = gltf.scene;
  planetMesh.scale.set(0.0025, 0.0025, 0.0025);
  planetMesh.visible = false;

  bulletGroup.add(planetMesh);
}, undefined, (error) => {
  console.error(error);
});

// Function to shoot a planet
function shootPlanet() {
  // Clone the planetMesh and make it visible
  let bullet = planetMesh.clone();
  bullet.visible = true;

  // Position the bullet at the spaceship's position
  bullet.position.copy(spaceshipMesh.position);

  // Set the bullet's velocity
  bullet.velocity = new THREE.Vector3(0, 0, -1); // Adjust the velocity vector as needed

  // Add the bullet to bulletGroup
  bulletGroup.add(bullet);
}

// Function to update the bullets
function updateBullets() {
  bulletGroup.children.forEach((bullet) => {
    bullet.position.y += 0.1;

    if (bullet.position.y > 10) {
      bulletGroup.remove(bullet);
    }
  });
}


// Create ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

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
  updateBullets();
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
