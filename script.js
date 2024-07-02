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

function animateWaves() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.15, 'orange');
    gradient.addColorStop(0.3, 'yellow');
    gradient.addColorStop(0.45, 'green');
    gradient.addColorStop(0.6, 'blue');
    gradient.addColorStop(0.75, 'indigo');
    gradient.addColorStop(1, 'violet');

    ctx.lineWidth = 2;
    ctx.strokeStyle = gradient;

    ctx.beginPath();

    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for(let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // 128 is the middle of the 256 possible values
        const y = v * canvas.height / 2;

        if(i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    requestAnimationFrame(animateWaves);
}

// Start the animation
animateWaves();

document.querySelector("#musicInput").addEventListener("change", function() {
    let musicInput = this.files[0]; // Get the selected file
    if (musicInput) {
        let musicURL = URL.createObjectURL(musicInput); // Create a URL for the file
        music.src = musicURL; // Set the music source to new URL
        music.load(); // Reload the music

        // Only create the MediaElementSourceNode if wasn't created before
        if (!music_source) {
            music_source = music_ctx.createMediaElementSource(music);
            music_source.connect(analyser);
            analyser.connect(music_ctx.destination);
        }
        if (window.animationFrameRequestID) {
            cancelAnimationFrame(window.animationFrameRequestID); // Stop loop
        }
        animateWaves(); // Restart
    }
});

function changeMusicSource() {
    document.querySelector("#musicInput").click(); // Trigger the file input
}