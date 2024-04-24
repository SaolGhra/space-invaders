import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Score counter
let score = 0;

// Create a div element to display the score
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '10px';
scoreElement.style.left = '10px';
scoreElement.style.color = 'white';
scoreElement.style.fontSize = '24px';
scoreElement.innerHTML = 'Score: ' + score;
document.body.appendChild(scoreElement);

// Function to update the score when an enemy is destroyed
function updateScore() {
  score += 100;
  scoreElement.innerHTML = 'Score: ' + score;
}

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

// Section for creating the enemy spaceship
const spaceInvader = '../models/spaceship2/';
const enemyCount = 5;
const enemySpacing = 2;
const enemyGroup = new THREE.Group();
let enemyMesh;

loader.load(spaceInvader + 'scene.gltf', (gltf) => {
  enemyMesh = gltf.scene;
  enemyMesh.position.set(0, 0, 0);
  enemyMesh.scale.set(0.1, 0.1, 0.1);
  enemyMesh.rotation.x = Math.PI / 2;

  // Add hitCount property to enemyMesh
  enemyMesh.hitCount = 0;

  for (let i = 0; i < enemyCount; i++) {
    const enemy = enemyMesh.clone();
    enemy.hitCount = 0; // Add hitCount property to enemy
    enemy.position.set(i * enemySpacing - (enemyCount - 1) * enemySpacing / 2, 3, 0);
    enemyGroup.add(enemy);
  }
  
  scene.add(enemyGroup);
}, undefined, (error) => {
  console.error(error);
});

// Planet colission with enemy
let gameOver = false;
let playerHit = false;
const collisionDistance = 0.5;

function checkCollision() {
  if (!spaceshipMesh) return; // Check if spaceshipMesh is defined

  // Check for collision between player and enemies
  enemyGroup.children.forEach((enemy) => {
    if (enemy.position && spaceshipMesh.position.distanceTo(enemy.position) < collisionDistance) {
      if (!playerHit) {
        playerHit = true;
        scene.remove(spaceshipMesh); // Remove spaceshipMesh when hit
      }
    }
  });

  // Check for collision between player and enemy bullets
  enemyBulletGroup.children.forEach((bullet) => {
    if (bullet.position && spaceshipMesh.position.distanceTo(bullet.position) < collisionDistance) {
      if (!playerHit) { // Only set playerHit to true if it's not already true
        playerHit = true;
        scene.remove(spaceshipMesh); // Remove spaceshipMesh when hit
      }
    }
  });

  // Check for collision between player bullets and enemies
  bulletGroup.children.forEach((bullet) => {
    enemyGroup.children.forEach((enemy) => {
      if (bullet.position && enemy.position && bullet.position.distanceTo(enemy.position) < collisionDistance) {
        // Handle bullet-enemy collision
        scene.remove(bullet); // Remove bullet when hitting an enemy
      }
    });
  });

  // Update player lives
  if (playerHit) {
    lives--;
    updateLives();
    playerHit = false;
    if (lives <= 0) {
      gameOver = true;
    }
  }
}

// Make the enemies shoot back at you
// Create enemy bullet group
const enemyBulletGroup = new THREE.Group();
scene.add(enemyBulletGroup);

// Function to create an enemy bullet
function createEnemyBullet(enemy) {
  const geometry = new THREE.SphereGeometry(0.1, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const bullet = new THREE.Mesh(geometry, material);
  bullet.position.copy(enemy.position);
  enemyBulletGroup.add(bullet);
}

// Function to update enemy bullets
function updateEnemyBullets() {
  Array.from(enemyBulletGroup.children).forEach((bullet) => {
    // Move bullet downwards
    bullet.position.y -= 0.1;

    // Check if bullet collides with player
    if (bullet.position.distanceTo(spaceshipMesh.position) < 1) {
      gameOver = true;
      console.log("Game Over!");
    }
  });
}

// Move the enemeies side to side then down
let enemyDirection = 1;
let enemySpeed = 0.005;

function moveEnemies() {
  let shouldChangeDirection = false;
  const boundArea = 7;

  enemyGroup.children.forEach((enemy) => {
    enemy.position.x += enemyDirection * enemySpeed;

    if (enemy.position.x > boundArea || enemy.position.x < -boundArea) {
      shouldChangeDirection = true;
    }
  });

  if (shouldChangeDirection) {
    enemyDirection *= -1;
    enemyGroup.children.forEach((enemy) => {
      enemy.position.y -= 0.5;
    });
  }
}

// Define initial position for the spaceship
let spaceshipPosition = { x: 0, y: -3 };
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

  const speed = 0.01;
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
let canShoot = true;

function shootPlanet() {
  if (!canShoot) {
    return;
  }

  // Clone the planetMesh and make it visible
  let bullet = planetMesh.clone();
  bullet.visible = true;

  // Position the bullet at the spaceship's position
  bullet.position.copy(spaceshipMesh.position);

  // Set the bullet's velocity
  bullet.velocity = new THREE.Vector3(0, 0, -1); // Adjust the velocity vector as needed

  // Add the bullet to bulletGroup
  bulletGroup.add(bullet);

  // Disable shooting for 0.5 seconds
  canShoot = false;
  setTimeout(() => {
    canShoot = true;
  }, 500);
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

// Game Over screen
const gameOverScreen = document.createElement('div');
gameOverScreen.style.position = 'absolute';
gameOverScreen.style.top = '50%';
gameOverScreen.style.left = '50%';
gameOverScreen.style.transform = 'translate(-50%, -50%)';
gameOverScreen.style.fontSize = '50px';
gameOverScreen.style.color = 'white';
gameOverScreen.style.display = 'none';
gameOverScreen.textContent = 'Game Over! Press R to restart.';
document.body.appendChild(gameOverScreen);

// Function to show game over screen
function showGameOverScreen() {
  gameOverScreen.style.display = 'block';
}

// Function to hide game over screen
function hideGameOverScreen() {
  gameOverScreen.style.display = 'none';
}

// Function to restart the game
function restartGame() {
  // Reset game over status
  gameOver = false;

  // Reset player position
  spaceshipMesh.position.set(0, 0, 0);

  // Reset enemies
  Array.from(enemyGroup.children).forEach((enemy) => {
    enemyGroup.remove(enemy);
  });

  // Reset bullets
  Array.from(bulletGroup.children).forEach((bullet) => {
    bulletGroup.remove(bullet);
  });

  // Reset enemy bullets
  Array.from(enemyBulletGroup.children).forEach((bullet) => {
    enemyBulletGroup.remove(bullet);
  });

  // Reset lives
  lives = 3;
  updateLives();

  // Reset score
  score = 0;
  updateScore();

  // Hide game over screen
  gameOverScreen.style.display = 'none';
}

// Attach restartGame to the window object
window.restartGame = restartGame;

// Player Lives
// Create lives variable
let lives = 3;

// Create lives element
const livesElement = document.createElement('div');
livesElement.style.position = 'absolute';
livesElement.style.bottom = '10px';
livesElement.style.left = '10px';
livesElement.style.fontSize = '20px';
livesElement.style.color = 'white';
livesElement.textContent = 'Lives: ' + lives;
document.body.appendChild(livesElement);

// Function to update lives
function updateLives() {
  livesElement.textContent = 'Lives: ' + lives;
}

// Listen for keydown events
window.addEventListener('keydown', function(event) {
  // Check if the 'r' key was pressed
  if (event.key === 'r' || event.key === 'R') {
    // Restart the game
    window.restartGame();
  }
});

// Inside your game loop...
if (gameOver) {
  showGameOverScreen();
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
  checkCollision();
  moveEnemies();

  enemyGroup.children.forEach((enemy) => {
    // Make enemy shoot at a random interval
    if (Math.random() < 0.01) {
      createEnemyBullet(enemy);
    }
  });
  
  // Update enemy bullets
  updateEnemyBullets();

  if (gameOver) {
    showGameOverScreen();
  }

  if (playerHit) {
    lives--;
    updateLives();
    playerHit = false;
    if (lives <= 0) {
      gameOver = true;
    }
  }
}

// Function to render the scene
function render() {
  renderer.render(scene, camera);
}

// Function to animate the game
function animate() {
  if (!gameOver) {
    requestAnimationFrame(animate);
    update();
    render();
  }
}

animate();
