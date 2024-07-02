let music = new Audio("music.mp3"); 

let musicIcon = document.querySelector("#musicIcon");

let animationFrameRequestID;

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

function animateAbstract() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let numberOfPoints = 100;
    let step = Math.PI * 2 / numberOfPoints;

    ctx.beginPath();
    for (let i = 0; i < 2 * Math.PI; i += step) {
        let dataIndex = Math.floor((i / (2 * Math.PI)) * bufferLength);
        let frequencyValue = dataArray[dataIndex];
        let radius = (frequencyValue / 255) * (canvas.width / 4);
        let x = canvas.width / 2 + radius * Math.cos(i);
        let y = canvas.height / 2 + radius * Math.sin(i);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();

    // Colour
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0.6, "red");
    gradient.addColorStop(0.5, "green");
    gradient.addColorStop(0.4, "blue");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();

    animationFrameRequestID = requestAnimationFrame(animateAbstract); // Loop
}

// Start the animation
animateAbstract();

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
        animateAbstract(); // Restart
    }
});

function changeMusicSource() {
    document.querySelector("#musicInput").click(); // Trigger the file input
}