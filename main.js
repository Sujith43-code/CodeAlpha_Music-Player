const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('playPause');
const progressContainer = document.getElementById('progressContainer');
const progress = document.getElementById('progress');
const cover = document.getElementById('cover');
const volumeSlider = document.getElementById('volume');

// Play & Pause
playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playPauseBtn.innerHTML = '&#10073;&#10073;'; // Pause symbol
        cover.style.animationPlayState = 'running';
    } else {
        audio.pause();
        playPauseBtn.innerHTML = '&#9658;'; // Play symbol
        cover.style.animationPlayState = 'paused';
    }
});

// Update progress bar
audio.addEventListener('timeupdate', () => {
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${percent}%`;
});

// Click to seek
progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    audio.currentTime = (clickX / width) * audio.duration;
});

// Volume control
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});
