const initiateGame = require('./game.js');

// Define the start game function
function startGame() {
    // Clear the screen
    clearScreen();

    // Display the scores on the left
    displayScores();

    // Display the "Play Game" button in the middle
    displayPlayButton();

    // Display the options on the right
    displayOptions();
}

// Define the clear screen function
function clearScreen() {
    // Code to clear the screen goes here
}

// Define the function to display scores
function displayScores() {
    // Code to display scores on the left goes here
}

// Define the function to display the "Play Game" button
function displayPlayButton() {
    const playButton = document.createElement("button");
    playButton.innerText = "Play Game";
    playButton.id = "play-button";
    document.body.appendChild(playButton);
}

// Define the function to display options
function displayOptions() {
    // Code to display options on the right goes here
}

// Event listener for the "Play Game" button
document.getElementById("play-button").addEventListener("click", function() {
    initiateGame();
});

// Call the start game function to initialize the screen
startGame();