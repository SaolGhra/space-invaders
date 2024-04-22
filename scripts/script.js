// Function to create the player
function createPlayer() {
    // Code to create the player
    const player = document.createElement('div');
    player.classList.add('player');
    // Set initial position of the player
    player.style.left = '50%';
    player.style.bottom = '10px';
    // Append the player to the game container
    const gameContainer = document.querySelector('.game-container');
    gameContainer.appendChild(player);
    // Return the created player
    return player;
}

// Function to handle collision detection
function handleCollision() {
    // Get the player element
    const player = document.querySelector('.player');
    // Get all the alien elements
    const aliens = document.querySelectorAll('.alien');

    // Check for collision between player and aliens
    aliens.forEach(alien => {
        if (isColliding(player, alien)) {
            // Handle collision logic here
            // For example, you can remove the player and the alien from the game
            player.remove();
            alien.remove();
        }
    });
}

// Function to check if two elements are colliding
function isColliding(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(
        rect1.top > rect2.bottom ||
        rect1.right < rect2.left ||
        rect1.bottom < rect2.top ||
        rect1.left > rect2.right
    );
}

// Function to create the aliens
function createAliens() {
    // Code to create the aliens
    const gameContainer = document.querySelector('.game-container');
    
    for (let i = 0; i < 10; i++) {
        const alien = document.createElement('div');
        alien.classList.add('alien');
        // Set initial position of the alien
        alien.style.left = `${i * 50}px`;
        alien.style.top = '50px';
        // Append the alien to the game container
        gameContainer.appendChild(alien);
    }
}

// Function to handle shooting
function handleShooting() {
    // Get the game container element
    const gameContainer = document.querySelector('.game-container');
    // Get the player element
    const player = document.querySelector('.player');

    // Create a bullet element
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    // Set initial position of the bullet
    bullet.style.left = player.style.left;
    bullet.style.bottom = '30px';
    // Append the bullet to the game container
    gameContainer.appendChild(bullet);

    // Move the bullet upwards
    const bulletInterval = setInterval(() => {
        const bulletBottom = parseInt(bullet.style.bottom);
        bullet.style.bottom = `${bulletBottom + 10}px`;

        // Check for collision between bullet and aliens
        const aliens = document.querySelectorAll('.alien');
        aliens.forEach(alien => {
            if (isColliding(bullet, alien)) {
                // Handle collision logic here
                // For example, you can remove the bullet and the alien from the game
                bullet.remove();
                alien.remove();
            }
        });

        // Check if the bullet is out of the game container
        if (bulletBottom > gameContainer.clientHeight) {
            // Remove the bullet from the game
            bullet.remove();
            // Stop the bullet interval
            clearInterval(bulletInterval);
        }
    }, 50);
}

// Function to handle lives
function handleLives() {
    // Get the lives container element
    const livesContainer = document.querySelector('.lives-container');
    // Set the initial number of lives
    let lives = 3;

    // Update the lives display
    function updateLivesDisplay() {
        livesContainer.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            const heart = document.createElement('i');
            heart.classList.add('fas', 'fa-heart');
            livesContainer.appendChild(heart);
        }
    }

    // Function to decrease the number of lives
    function decreaseLives() {
        lives--;
        updateLivesDisplay();
        if (lives === 0) {
            // Game over logic here
            console.log('Game over');
        }
    }

    // Initialize the lives display
    updateLivesDisplay();

    // Return the decreaseLives function
    return decreaseLives;
}

// Function to handle score
function handleScore() {
    // Get the score element
    const scoreElement = document.querySelector('.score');
    // Set the initial score
    let score = 0;

    // Function to update the score
    function updateScore() {
        scoreElement.textContent = score;
    }

    // Function to increase the score
    function increaseScore() {
        score++;
        updateScore();
    }

    // Initialize the score
    updateScore();

    // Return the increaseScore function
    return increaseScore;
}

// Function to handle movement
function handleMovement() {
    // Get the player element
    const player = document.querySelector('.player');
    // Set the initial movement state
    let isMovingLeft = false;
    let isMovingRight = false;

    // Function to handle keydown event
    function handleKeyDown(event) {
        if (event.key === 'ArrowLeft') {
            isMovingLeft = true;
        } else if (event.key === 'ArrowRight') {
            isMovingRight = true;
        }
    }

    // Function to handle keyup event
    function handleKeyUp(event) {
        if (event.key === 'ArrowLeft') {
            isMovingLeft = false;
        } else if (event.key === 'ArrowRight') {
            isMovingRight = false;
        }
    }

    // Add event listeners for keydown and keyup events
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Function to move the player
    function movePlayer() {
        const playerLeft = parseInt(player.style.left);
        const gameContainerWidth = parseInt(getComputedStyle(document.querySelector('.game-container')).width);

        if (isMovingLeft && playerLeft > 0) {
            player.style.left = `${playerLeft - 10}px`;
        } else if (isMovingRight && playerLeft < gameContainerWidth - player.offsetWidth) {
            player.style.left = `${playerLeft + 10}px`;
        }
    }

    // Start moving the player at a regular interval
    setInterval(movePlayer, 50);
}

// Function to handle auto-scaling/flexing
function handleAutoScaling() {
    // Get the game container element
    const gameContainer = document.querySelector('.game-container');
    // Get the player element
    const player = document.querySelector('.player');

    // Function to handle window resize event
    function handleWindowResize() {
        // Get the game container width
        const gameContainerWidth = parseInt(getComputedStyle(gameContainer).width);
        // Get the player left position
        const playerLeft = parseInt(player.style.left);

        // Adjust the player position if it goes beyond the game container width
        if (playerLeft > gameContainerWidth - player.offsetWidth) {
            player.style.left = `${gameContainerWidth - player.offsetWidth}px`;
        }
    }

    // Add event listener for window resize event
    window.addEventListener('resize', handleWindowResize);
}

// Wait for the DOM content to be fully loaded before executing any code
document.addEventListener('DOMContentLoaded', function() {
    // Put all your code here
    createPlayer();
    createAliens();
    handleMovement();
    handleAutoScaling();
    handleCollision();
    handleShooting();
    handleLives();
    handleScore();

    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            handleShooting();
        }
    });
});
