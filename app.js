// ====== Configure your offline tracks here ======
const tracks = [
  {
    title: "Another Love",
    artist: "Tom Odell",
    src: "assets/audio/Another Love Slowed(PagalWorld).mp3",
    cover: "assets/covers/Screenshot_20250813_110703.jpg",
  },
  {
    title: "Dandelions",
    artist: "Ruth.B",
    src: "assets/audio/Dandelions(PagalWorld).mp3",
    cover: "assets/covers/Screenshot_20250813_110741.jpg",
  },
  {
    title: "Somewhere Only We Know",
    artist: "Keane",
    src: "assets/audio/Somewhere Only We Know-(PagalWorld).mp3",
    cover: "assets/covers/Screenshot_20250813_110910.jpg",
  },
];

// ============ Helpers ============
const $ = sel => document.querySelector(sel);
const fmt = (t) => {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2,"0")}`;
};

// ============ Elements ============
const audio = $("#audio");
const cover = $("#cover");
const title = $("#title");
const artist = $("#artist");
const seek = $("#seek");
const volume = $("#volume");
const currentTimeEl = $("#currentTime");
const totalTimeEl = $("#totalTime");
const btnPlay = $("#btnPlay");
const btnPrev = $("#btnPrev");
const btnNext = $("#btnNext");
const btnRepeat = $("#btnRepeat");
const btnShuffle = $("#btnShuffle");
const btnMute = $("#btnMute");
const autoplayToggle = $("#autoplay");
const playlistEl = $("#playlist");
const filterInput = $("#filter");
const app = document.body;

// ============ State ============
let index = 0;
let isPlaying = false;
let isRepeat = false;
let isShuffle = false;
let userSeeking = false;

// Load persisted preferences
const savedVol = localStorage.getItem("vol");
if (savedVol !== null) {
  audio.volume = Number(savedVol);
  volume.value = savedVol;
} else {
  audio.volume = 0.9;
  volume.value = 0.9;
}
const savedAutoplay = localStorage.getItem("autoplay") === "true";
autoplayToggle.checked = savedAutoplay;

// ============ Playlist UI ============
function renderPlaylist(list = tracks) {
  playlistEl.innerHTML = "";
  list.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = "track";
    li.dataset.index = i;

    li.innerHTML = `
      <img class="cover" src="${t.cover}" alt="${t.title}">
      <div class="txt">
        <div class="t-title">${t.title}</div>
        <div class="t-artist">${t.artist}</div>
      </div>
      <div class="t-duration" id="d-${i}">--:--</div>
    `;

    li.addEventListener("click", () => {
      index = i;
      load(index);
      play();
      highlightActive();
    });

    playlistEl.appendChild(li);
  });
  highlightActive();
}
function highlightActive() {
  [...document.querySelectorAll(".track")].forEach((el, i) => {
    el.classList.toggle("active", i === index);
  });
}

// ============ Load / Play ============
function load(i) {
  const t = tracks[i];
  if (!t) return;
  audio.src = t.src;
  cover.src = t.cover;
  title.textContent = t.title;
  artist.textContent = t.artist;
  app.classList.remove("playing");
}
function play() {
  audio.play().then(() => {
    isPlaying = true;
    btnPlay.textContent = "⏸️";
    app.classList.add("playing");
  }).catch(console.error);
}
function pause() {
  audio.pause();
  isPlaying = false;
  btnPlay.textContent = "▶️";
  app.classList.remove("playing");
}
function next() {
  index = isShuffle ? Math.floor(Math.random() * tracks.length) : (index + 1) % tracks.length;
  load(index);
  play();
  highlightActive();
}
function prev() {
  index = (index - 1 + tracks.length) % tracks.length;
  load(index);
  play();
  highlightActive();
}

// ============ Events ============
btnPlay.addEventListener("click", () => (isPlaying ? pause() : play()));
btnNext.addEventListener("click", next);
btnPrev.addEventListener("click", prev);

btnRepeat.addEventListener("click", () => {
  isRepeat = !isRepeat;
  audio.loop = isRepeat;
  btnRepeat.style.outline = isRepeat ? "2px solid var(--ring)" : "none";
});
btnShuffle.addEventListener("click", () => {
  isShuffle = !isShuffle;
  btnShuffle.style.outline = isShuffle ? "2px solid var(--ring)" : "none";
});

btnMute.addEventListener("click", () => {
  audio.muted = !audio.muted;
  btnMute.textContent = audio.muted ? "🔇" : "🔈";
});
volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
  localStorage.setItem("vol", audio.volume);
});

seek.addEventListener("input", () => {
  userSeeking = true;
});
seek.addEventListener("change", () => {
  const to = Number(seek.value);
  audio.currentTime = to;
  userSeeking = false;
});

audio.addEventListener("loadedmetadata", () => {
  totalTimeEl.textContent = fmt(audio.duration);
  seek.max = audio.duration || 0;
});
audio.addEventListener("timeupdate", () => {
  currentTimeEl.textContent = fmt(audio.currentTime);
  if (!userSeeking) {
    seek.value = audio.currentTime || 0;
  }
});

audio.addEventListener("ended", () => {
  if (audio.loop) return; // repeat mode handles itself
  if (autoplayToggle.checked) next();
  else pause();
});

autoplayToggle.addEventListener("change", () => {
  localStorage.setItem("autoplay", autoplayToggle.checked);
});

// Pre-calc durations for playlist items
function probeDurations() {
  tracks.forEach((t, i) => {
    const a = new Audio();
    a.src = t.src;
    a.addEventListener("loadedmetadata", () => {
      const el = document.getElementById(`d-${i}`);
      if (el) el.textContent = fmt(a.duration);
    });
  });
}

// Filter playlist
filterInput.addEventListener("input", () => {
  const q = filterInput.value.toLowerCase();
  const filtered = tracks
    .map((t, i) => ({...t, __i: i}))
    .filter(t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
  // re-render filtered view but keep original indices for click
  playlistEl.innerHTML = "";
  filtered.forEach(({title, artist, cover, __i}) => {
    const li = document.createElement("li");
    li.className = "track";
    li.dataset.index = __i;
    li.innerHTML = `
      <img class="cover" src="${cover}" alt="${title}">
      <div class="txt">
        <div class="t-title">${title}</div>
        <div class="t-artist">${artist}</div>
      </div>
      <div class="t-duration" id="d-${__i}">--:--</div>
    `;
    li.addEventListener("click", () => {
      index = __i;
      load(index);
      play();
      highlightActive();
    });
    playlistEl.appendChild(li);
  });
  highlightActive();
  probeDurations();
});

// Keyboard shortcuts
window.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea")) return;

  switch(e.key.toLowerCase()){
    case " ":
      e.preventDefault();
      isPlaying ? pause() : play();
      break;
    case "arrowright":
      audio.currentTime = Math.min((audio.currentTime || 0) + 5, audio.duration || 0);
      break;
    case "arrowleft":
      audio.currentTime = Math.max((audio.currentTime || 0) - 5, 0);
      break;
    case "arrowup":
      audio.volume = Math.min(audio.volume + 0.05, 1);
      volume.value = audio.volume;
      localStorage.setItem("vol", audio.volume);
      break;
    case "arrowdown":
      audio.volume = Math.max(audio.volume - 0.05, 0);
      volume.value = audio.volume;
      localStorage.setItem("vol", audio.volume);
      break;
    case "n": next(); break;
    case "p": prev(); break;
  }
});

// ============ Init ============
renderPlaylist();
load(index);
probeDurations();
