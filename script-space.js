let music = new Audio("music.mp3"); // CHANGE THIS TO THE PATH TO YOUR MUSIC FILE

let musicIcon = document.querySelector("#musicIcon");

let animationFrameRequestID; // Global variable to keep track of the animation frame request ID

let music_source = null;


function musicStateChange() {
    // Autoplay bug fix
    if (music_ctx.state === "suspended") {
        music_ctx.resume().then(() => {
            console.log("AudioContext resumed!");
        });
    }

    if (music.paused) {
        music.play();
        musicIcon.classList.remove("fa-play");
        musicIcon.classList.add("fa-pause");
    } else {
        music.pause();
        musicIcon.classList.remove("fa-pause");
        musicIcon.classList.add("fa-play");
    }
}

// Set up canvas
const container = document.querySelector("#container");
const canvas = document.querySelector("#canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

// Set up audio
const music_ctx = new (window.AudioContext || window.webkitAudioContext)();
music_source = music_ctx.createMediaElementSource(music);
let analyser = music_ctx.createAnalyser();
music_source.connect(analyser);
analyser.connect(music_ctx.destination);

class Star {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
    }
    update() {
        this.x -= this.speed; // Move star slightly to the left
        // If the star goes off screen, reset its position to the right
        if (this.x < 0) {
            this.x = canvas.width;
            this.y = Math.random() * canvas.height;
        }
    }
    draw(ctx) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.random()*1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

let stars = [];
const numStars = 100; // Number of stars
for (let i = 0; i < numStars; i++) {
    stars.push(new Star(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 0.5 + 0.1));
}

function animateSpace() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Update and draw stars
    stars.forEach(star => {
        star.update();
        star.draw(ctx);
    });

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const segments = 3;
    const segmentLength = Math.floor(bufferLength / segments);

    for (let s = 0; s < segments; s++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height); 

        for (let i = 0; i < canvas.width; i++) {
            const index = Math.floor((i / canvas.width) * segmentLength) + (s * segmentLength);
            const value = dataArray[index];
            const heightAdjustmentFactor = s == 0 ? 0.8 : 1;
            const height = ((value / 128.0) * (canvas.height / (s + 1))) * heightAdjustmentFactor; 

            const x = i;
            const y = canvas.height - height;

            ctx.lineTo(x, y); 
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        // Colour
        const lightness = 15+(s * 30);
        ctx.fillStyle = `hsla(0, 0%, ${lightness}%, 50%)`; 
        ctx.fill();
    }

    animationFrameRequestID = requestAnimationFrame(animateSpace); // Loop the animation
}

// Start the animation
animateSpace();

document.querySelector("#musicInput").addEventListener("change", function() {
    let musicInput = this.files[0]; // Get the selected file
    if (musicInput) {
        let musicURL = URL.createObjectURL(musicInput); // Create a URL for the file
        music.src = musicURL; // Set the music source to the new URL
        music.load(); // Reload the music to apply the new source

        // Only create the MediaElementSourceNode if wasn't created before
        if (!music_source) {
            music_source = music_ctx.createMediaElementSource(music);
            music_source.connect(analyser);
            analyser.connect(music_ctx.destination);
        }

        // Optionally, restart the animation
        if (window.animationFrameRequestID) {
            cancelAnimationFrame(window.animationFrameRequestID); // Stop loop
        }
        animateSpace(); // Restart
    }
});

function changeMusicSource() {
    document.querySelector("#musicInput").click(); // Trigger the file input
}