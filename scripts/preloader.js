const preloader = document.querySelector(".preloader");

var loadingText = document.querySelector('.loading-text');
var dots = '';
var maxDots = 3; // Maximum number of dots before resetting

// Function to add dots to the loading text
function addDot() {
    dots += '.';
    if (dots.length > maxDots) {
        dots = '.';
    }
    loadingText.textContent = 'Loading' + dots;
}

var intervalId = setInterval(addDot, 500); // Interval to add dots

// Reset the loading text after 3 seconds (adjust as needed)
setTimeout(function() {
    clearInterval(intervalId);
    loadingText.textContent = 'Loading';
}, 7500);

preloader.style.transition = "opacity 500ms ease-in-out"; // Added opacity transition

// Hide the preloader after 7.5 seconds
setTimeout(() => {
    preloader.style.opacity = 0;

    setTimeout(() => {
        preloader.style.display = "none";
    }, 500);
}, 5000);

// Fixed width for the loading text to prevent movement
loadingText.style.width = loadingText.offsetWidth + 'px';