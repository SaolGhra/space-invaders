// Set up the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load spaceship texture
const loader = new THREE.GLTFLoader();
loader.load(
  'models/spaceship.glb',
  function (gltf) {
    const spaceship = gltf.scene;
    scene.add(spaceship);
  },
  undefined,
  function (error) {
    console.error('Error loading GLTF model:', error);
  }
);

// Define keyboard controls
const keyboardState = {};
document.addEventListener('keydown', (event) => {
  keyboardState[event.code] = true;
});
document.addEventListener('keyup', (event) => {
  keyboardState[event.code] = false;
});

// Function to handle player movement
function handlePlayerMovement() {
  const speed = 0.1;
  if (keyboardState['KeyW']) {
    spaceship.position.y += speed;
  }
  if (keyboardState['KeyS']) {
    spaceship.position.y -= speed;
  }
  if (keyboardState['KeyA']) {
    spaceship.position.x -= speed;
  }
  if (keyboardState['KeyD']) {
    spaceship.position.x += speed;
  }
}

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
