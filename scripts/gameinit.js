import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let lives = 3;
let score = 0;
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '10px';
scoreElement.style.left = '10px';
scoreElement.style.color = 'white';
scoreElement.style.fontSize = '24px';
scoreElement.innerHTML = `Score: ${score}`;
document.body.appendChild(scoreElement);

function updateScore() {
  score += 100;
  scoreElement.innerHTML = `Score: ${score}`;
}

const loader = new GLTFLoader();

const spaceshipPath = 'https://raw.githubusercontent.com/SaolGhra/space-invaders/main/models/spaceship1/';
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

const spaceInvader = 'https://raw.githubusercontent.com/SaolGhra/space-invaders/main/models/spaceship2/';
const enemyCount = 5;
const enemySpacing = 2;
const enemyGroup = new THREE.Group();
let enemyMesh;

loader.load(spaceInvader + 'scene.gltf', (gltf) => {
  enemyMesh = gltf.scene;
  enemyMesh.position.set(0, 0, 0);
  enemyMesh.scale.set(0.1, 0.1, 0.1);
  enemyMesh.rotation.x = Math.PI / 2;

  for (let i = 0; i < enemyCount; i++) {
    const enemy = enemyMesh.clone();
    enemy.hitByPlanet = 0;
    enemy.hitCount = 0;
    enemy.position.set(i * enemySpacing - (enemyCount - 1) * enemySpacing / 2, 3, 0);
    enemyGroup.add(enemy);
}

  scene.add(enemyGroup);
}, undefined, (error) => {
  console.error(error);
});

let gameOver = false;
const collisionDistance = 0.5;
const planetBulletDamage = 1;

function checkCollision() {
    if (!spaceshipMesh) return;
  
    // Flag to track if the player is alive
    let playerAlive = true;
  
    // Number of hits the player has taken from enemy bullets
    let playerHits = 0;
  
    // Inside the checkCollision function
    enemyBulletGroup.children.forEach((bullet) => {
      if (bullet.position && spaceshipMesh.position.distanceTo(bullet.position) < collisionDistance) {
        if (playerAlive) {
          // Increment the hit count
          playerHits++;
          // Check if the player has been hit three times
          if (playerHits >= 3) {
            playerAlive = false; 
            scene.remove(spaceshipMesh);
            // Decrease player's lives count
            lives--;
            updateLives();
            if (lives <= 0) {
              gameOver = true;
            }
          }
        }
      }
    });
    
    // Reset playerHits when respawning player
    if (!playerAlive && !spaceshipMesh) {
      playerHits = 0;
    }
  
    // Iterate through bullets and enemies to check for collisions
    bulletGroup.children.forEach((bullet) => {
      if (bullet && !bullet.processed) {
          enemyGroup.children.forEach((enemy) => {
              if (enemy && !enemy.destroyed) {
                  const distance = bullet.position.distanceTo(enemy.position);
                  if (distance < collisionDistance) {
                      bullet.processed = true;
                      scene.remove(bullet);
  
                      let damage = 0;
  
                      if (bullet.isFromPlanet) {
                          damage = planetBulletDamage;
                      }
  
                      // Apply damage to the enemy
                      enemy.damage = (enemy.damage || 0) + damage;
                      console.log('Enemy damage:', enemy.damage);
  
                      // If the enemy accumulates enough damage, destroy it
                      if (enemy.damage >= 3 && !enemy.destroyed) {
                        console.log('Destroying enemy...');
                        enemy.destroyed = true;
                        enemyGroup.remove(enemy);
                        scene.remove(enemy);
                        updateScore();
                    }
                  }
              }
          });
      }
    });
  
    // Reset the processed flag for all bullets in each iteration of the game loop
    bulletGroup.children.forEach((bullet) => {
      if (bullet) {
        bullet.processed = false;
      }
    });
}

const enemyBulletGroup = new THREE.Group();
scene.add(enemyBulletGroup);

function createEnemyBullet(enemy) {
  const geometry = new THREE.SphereGeometry(0.1, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const bullet = new THREE.Mesh(geometry, material);
  bullet.position.copy(enemy.position);
  enemyBulletGroup.add(bullet);
}

let enemyFireRate = 150;
let enemyFireCounter = 0;

function updateEnemyBullets() {
  if (enemyFireCounter >= enemyFireRate) {
    enemyBulletGroup.children.forEach((bullet) => {
      bullet.position.y -= 0.4;

      // Create bounding boxes for the bullet and the spaceship
      const bulletBox = new THREE.Box3().setFromObject(bullet);
      const spaceshipBox = new THREE.Box3().setFromObject(spaceshipMesh);

      // Check for intersection between the bullet and the spaceship
      if (bulletBox.intersectsBox(spaceshipBox)) {
        lives--;
      
        // If no lives left, transition to game over
        if (lives <= 0) {
          gameOver();
        }
      }
    });

    // Reset the counter
    enemyFireCounter = 0;
  } else {
    // Increment the counter
    enemyFireCounter++;
  }
}

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

let spaceshipPosition = { x: 0, y: -3 };
let keyboardState = {};

window.addEventListener('keydown', (event) => {
  keyboardState[event.code] = true;
});

window.addEventListener('keyup', (event) => {
  keyboardState[event.code] = false;
});

function handlePlayerMovement() {
  if (!spaceshipMesh) return;

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

const planetPath = 'https://raw.githubusercontent.com/SaolGhra/space-invaders/main/models/planet/';
let planetMesh;

const bulletGroup = new THREE.Group();
scene.add(bulletGroup);

loader.load(planetPath + 'scene.gltf', (gltf) => {
  planetMesh = gltf.scene;
  planetMesh.scale.set(0.0025, 0.0025, 0.0025);
  planetMesh.visible = false;
  bulletGroup.add(planetMesh);
}, undefined, (error) => {
  console.error(error);
});

let canShoot = true;

function shootPlanet() {
  if (!canShoot) return;

  const bullet = planetMesh.clone();
  bullet.visible = true;
  bullet.isFromPlanet = true;
  bullet.position.copy(spaceshipMesh.position);
  bullet.velocity = new THREE.Vector3(0, 0, -1);
  bulletGroup.add(bullet);

  canShoot = false;
  setTimeout(() => {
    canShoot = true;
  }, 500);
}

// Add event listener for 'Space' key press
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    shootPlanet();
  }
});

function updateBullets() {
  bulletGroup.children.forEach((bullet) => {
    bullet.position.y += 0.1;

    if (bullet.position.y > 10) {
      bulletGroup.remove(bullet);
    }
  });
}

const gameOverScreen = document.createElement('div');
gameOverScreen.style.position = 'absolute';
gameOverScreen.style.left = '50%';
gameOverScreen.style.bottom = '50%';
gameOverScreen.style.transform = 'translate(-50%, -50%)';
gameOverScreen.style.fontSize = '50px';
gameOverScreen.style.color = 'white';
gameOverScreen.style.display = 'none';
gameOverScreen.textContent = 'Game Over! Press R to restart.';
document.body.appendChild(gameOverScreen);

function showGameOverScreen() {
  gameOverScreen.style.display = 'block';
}

function hideGameOverScreen() {
  gameOverScreen.style.display = 'none';
}

// Function to spawn enemies
function spawnEnemies() {
  for (let i = 0; i < enemyCount; i++) {
    const enemy = enemyMesh.clone();
    enemy.hitCount = 0;
    enemy.position.set(i * enemySpacing - (enemyCount - 1) * enemySpacing / 2, 3, 0);
    enemyGroup.add(enemy);
  }
}

// Function to respawn the player
function respawnPlayer() {
  if (!spaceshipMesh) {
    loader.load(spaceshipPath + 'scene.gltf', (gltf) => {
      spaceshipMesh = gltf.scene;
      spaceshipMesh.position.set(0, 0, 0);
      spaceshipMesh.scale.set(0.2, 0.2, 0.2);
      spaceshipMesh.rotation.x = Math.PI / 2;
      scene.add(spaceshipMesh);
    }, undefined, (error) => {
      console.error(error);
    });
  } else {
    spaceshipMesh.position.set(0, 0, 0);
    scene.add(spaceshipMesh);
  }
}

function restartGame() {
  console.log('Restarting game function called');
  gameOver = false;
  gameStarted = true;
  // Respawn the player
  respawnPlayer();

  // Clear all existing enemies
  enemyGroup.children = [];
  scene.remove(...enemyGroup.children);

  // Clear all existing bullets
  bulletGroup.children = [];
  scene.remove(...bulletGroup.children);

  // Clear all existing enemy bullets
  enemyBulletGroup.children = [];
  scene.remove(...enemyBulletGroup.children);

  // Respawn enemies
  spawnEnemies();

  // Reset enemy speed
  enemySpeed = 0.005;

  // Reset enemy fire rate
  enemyFireRate = 150;

  // Reset enemy bullet speed
  enemyBulletSpeed = 0.4;

  // Reset lives, score, and hide game over screen
  lives = 3;
  updateLives();
  score = 0;
  updateScore();


  hideGameOverScreen();
  animate();
}

window.restartGame = restartGame;

const livesElement = document.createElement('div');
livesElement.style.position = 'absolute';
livesElement.style.bottom = '10px';
livesElement.style.left = '10px';
livesElement.style.fontSize = '20px';
livesElement.style.color = 'white';
livesElement.textContent = `Lives: ${lives}`;
document.body.appendChild(livesElement);

function updateLives() {
  livesElement.textContent = `Lives: ${lives}`;
}

let gameStarted = false;

document.getElementById('play-button').addEventListener('click', function () {
  resetGameState();
  gameStarted = true;

  animate(); 
  this.style.display = 'none';
});

window.addEventListener('keydown', function (event) {
  if (event.key === 'r') {
    console.log('Restarting game...');
    restartGame();
  }
});

let playerHit = true;

function resetGameState() {
  gameOver = false;
  playerHit = false;
  lives = 3;
}

if (gameOver) {
  showGameOverScreen();
}

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

function createStars() {
  const starCount = 1000;
  const starGeometry = new THREE.SphereGeometry(0.1, 32, 32);
  const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  for (let i = 0; i < starCount; i++) {
    const star = new THREE.Mesh(starGeometry, starMaterial);
    const distance = 100;
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = Math.random() * Math.PI * 2;
    const x = Math.sin(angle1) * Math.cos(angle2) * distance;
    const y = Math.sin(angle2) * distance;
    const z = Math.cos(angle1) * Math.cos(angle2) * distance;
    star.position.set(x, y, z);
    scene.add(star);
  }
}

createStars();

camera.position.z = 5;

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

function update() {
  handlePlayerMovement();
  updateBullets();
  checkCollision();
  moveEnemies();

  enemyGroup.children.forEach((enemy) => {
    if (Math.random() < 0.01) {
      createEnemyBullet(enemy);
    }
  });

  updateEnemyBullets();

  if (gameOver) {
    showGameOverScreen();
  }
}

function render() {
  renderer.render(scene, camera);
}
  
function animate() {
  if (gameStarted) {
    requestAnimationFrame(animate);
    update();
    render();

    if (gameOver) {
      showGameOverScreen();
      gameStarted = false;
    }
  }
}

document.getElementById('play-button').style.display = 'block';
