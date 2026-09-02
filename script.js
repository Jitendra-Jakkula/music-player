"use strict";

/* ====================================================================
   MUSIC PLAYER
   Refactor notes: logic is unchanged from the original. What changed:
   - all mutable state lives in one `state` object instead of loose
     top-level `let`s
   - DOM lookups are validated once at startup (fails loudly & early
     instead of throwing a cryptic "cannot read property of null"
     three functions deep)
   - localStorage / audio calls are wrapped so a private-browsing tab
     or a missing file can't crash the whole player
   - init is a single `init()` call at the bottom instead of scattered
     top-level statements
   ==================================================================== */

// ==================== DOM ELEMENTS ====================

const dom = {
  playButton: document.querySelector(".play"),
  prevButton: document.querySelector(".prev"),
  nextButton: document.querySelector(".next"),
  songTitle: document.querySelector(".song-info h2"),
  songArtist: document.querySelector(".song-info p"),
  volumeRange: document.querySelector(".volume-bar"),
  progress: document.querySelector(".progress"),
  currTime: document.querySelector(".currtime"),
  endTime: document.querySelector(".totaltime"),
  playlistContainer: document.querySelector(".playlist ol"),
  shuffleBtn: document.querySelector(".shuffle"),
  repeatBtn: document.querySelector(".repeat"),
  muteButton: document.querySelector(".volume-control .mute"),
  artworkImg: document.querySelector(".artwork-img"),
  songStatus: document.querySelector("#status"),
  speedControl: document.querySelector(".speed"),
  playlistSearch: document.querySelector(".playlist-search"),
  queueContainer: document.querySelector(".queue-list"),
};

// Fail loudly (in the console) if the HTML and JS have drifted apart,
// rather than letting a null `querySelector` result blow up later on
// a click somewhere unrelated.
const missingElements = Object.entries(dom)
  .filter(([, el]) => !el)
  .map(([name]) => name);

if (missingElements.length > 0) {
  console.error(
    `Music player: missing expected element(s): ${missingElements.join(", ")}. ` +
    "Check that index.html matches script.js's selectors."
  );
}

const music = new Audio();

// ==================== SAFE STORAGE HELPERS ====================
// localStorage can throw (private browsing, storage disabled, quota),
// so every read/write goes through here instead of being called raw.

const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Storage read failed for "${key}":`, error);
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Storage write failed for "${key}":`, error);
    }
  },
};

// ==================== SONG DATA ====================

const songs = [
  {
    title: "song1",
    artist: "jitu",
    src: "./music/m1.mp3",
    artwork: "./images/img1.jpg",
  },
  {
    title: "song2",
    artist: "artist2",
    src: "./music/m2.mp3",
    artwork: "./images/img2.jpg",
  },
  {
    title: "wolves",
    artist: "artist3",
    src: "./music/m4.mp3",
    artwork: "./images/img3.jpg",
  },
];

// ==================== STATE ====================
// Everything that changes over the player's lifetime lives here,
// instead of as separate top-level `let` bindings.

function readSavedSongIndex() {
  const saved = storage.get("currentSongIndex");
  const parsed = saved !== null ? Number(saved) : 0;
  const isValid = Number.isInteger(parsed) && parsed >= 0 && parsed < songs.length;
  return isValid ? parsed : 0;
}

const state = {
  isShuffle: false,
  shufflePosition: 0,
  isRepeat: false,
  isMuted: false,
  playQueue: [],
  currentSongIndex: readSavedSongIndex(),
  lastPositionSave: 0,
  isInitialLoad: true,
  shuffleOrder: Array.from({ length: songs.length }, (_, songIndex) => songIndex),
};

// ==================== PLAYLIST ====================

function renderPlaylist(songsToRender) {
  dom.playlistContainer.innerHTML = "";

  songsToRender.forEach((song) => {
    const originalIndex = songs.indexOf(song);

    const listItem = document.createElement("li");

    const title = document.createElement("span");
    title.textContent = song.title;

    const artist = document.createElement("small");
    artist.textContent = song.artist;

    const queueButton = document.createElement("button");
    queueButton.textContent = "Next";
    queueButton.classList.add("play-next");
    queueButton.setAttribute("aria-label", `Queue ${song.title}`);
    queueButton.setAttribute("type", "button");

    listItem.appendChild(title);
    listItem.appendChild(artist);
    listItem.appendChild(queueButton);

    listItem.setAttribute("data-index", originalIndex);
    if (originalIndex === state.currentSongIndex) {
      listItem.classList.add("active");
    }

    dom.playlistContainer.appendChild(listItem);
  });
}

function getPlaylistItems() {
  return dom.playlistContainer.querySelectorAll("li");
}

// ==================== QUEUE ====================

function renderQueue() {
  dom.queueContainer.innerHTML = "";

  state.playQueue.forEach((songIndex, queuePosition) => {
    const song = songs[songIndex];
    if (!song) return;

    const listItem = document.createElement("li");

    const songInfo = document.createElement("span");
    songInfo.textContent = `${song.title} — ${song.artist}`;

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.classList.add("remove-queue");
    removeButton.setAttribute("type", "button");
    removeButton.dataset.position = queuePosition;

    listItem.appendChild(songInfo);
    listItem.appendChild(removeButton);

    dom.queueContainer.appendChild(listItem);
  });
}

// ==================== PLAYBACK ====================

function togglePlay() {
  if (music.paused) {
    playCurrentSong();
  } else {
    music.pause();
  }
}

async function playCurrentSong() {
  try {
    await music.play();
  } catch (error) {
    console.log("Playback failed:", error);
    dom.songStatus.textContent = "Couldn't play this track.";
  }
}

dom.playButton.addEventListener("click", togglePlay);

music.addEventListener("play", () => {
  dom.playButton.innerHTML = `<i data-lucide="pause"></i>`;
  dom.playButton.setAttribute("aria-label", "Pause");
  dom.playButton.setAttribute("title", "Pause");
  document.body.classList.add("is-playing"); // decorative hook for CSS only

  if (window.lucide) lucide.createIcons();
});

music.addEventListener("pause", () => {
  dom.playButton.innerHTML = `<i data-lucide="play"></i>`;
  dom.playButton.setAttribute("aria-label", "Play");
  dom.playButton.setAttribute("title", "Play");
  document.body.classList.remove("is-playing"); // decorative hook for CSS only

  if (window.lucide) lucide.createIcons();

  saveCurrentPosition();
});

// Surface real playback errors (bad/missing file, decode failure) in
// the status line instead of failing silently.
music.addEventListener("error", () => {
  dom.songStatus.textContent = "This track couldn't be loaded.";
  console.error("Audio error for", music.src, music.error);
});

// ==================== SONG LOADING ====================

function loadSong() {
  const currentSong = songs[state.currentSongIndex];

  if (!currentSong) {
    console.error(`No song at index ${state.currentSongIndex}`);
    dom.songStatus.textContent = "Track unavailable.";
    return;
  }

  dom.songStatus.textContent = "Loading...";

  dom.songTitle.textContent = currentSong.title;
  dom.songArtist.textContent = currentSong.artist;
  music.src = currentSong.src;
  dom.artworkImg.src = currentSong.artwork;
  dom.artworkImg.alt = `${currentSong.title} artwork`;

  storage.set("currentSongIndex", state.currentSongIndex);

  music.currentTime = 0;
  dom.progress.value = 0;
  dom.currTime.textContent = "0:00";

  const playlist = getPlaylistItems();

  playlist.forEach((playlistItem) => {
    playlistItem.classList.remove("active", "next-song");
  });

  if (playlist[state.currentSongIndex]) {
    playlist[state.currentSongIndex].classList.add("active");
  }

  if (!state.isShuffle) {
    const nextSongIndex = (state.currentSongIndex + 1) % songs.length;
    if (playlist[nextSongIndex]) {
      playlist[nextSongIndex].classList.add("next-song");
    }
  }
}

// ==================== NAVIGATION ====================

function nextSong() {
  if (state.playQueue.length > 0) {
    state.currentSongIndex = state.playQueue.shift();
    renderQueue();
  } else if (state.isShuffle) {
    state.shufflePosition = (state.shufflePosition + 1) % songs.length;
    state.currentSongIndex = state.shuffleOrder[state.shufflePosition];
  } else {
    state.currentSongIndex = (state.currentSongIndex + 1) % songs.length;
  }

  loadSong();
  playCurrentSong();
}

function prevSong() {
  if (state.isShuffle) {
    state.shufflePosition =
      (state.shufflePosition - 1 + songs.length) % songs.length;
    state.currentSongIndex = state.shuffleOrder[state.shufflePosition];
  } else {
    state.currentSongIndex =
      (state.currentSongIndex - 1 + songs.length) % songs.length;
  }

  loadSong();
  playCurrentSong();
}

dom.nextButton.addEventListener("click", nextSong);
dom.prevButton.addEventListener("click", prevSong);

// ==================== VOLUME ====================

dom.volumeRange.addEventListener("input", (event) => {
  const volume = event.target.value;

  music.volume = volume * 0.01;

  storage.set("volume", volume);

  if (music.muted) {
    music.muted = false;
    state.isMuted = false;
    dom.muteButton.textContent = "Mute";
  }
});

// ==================== PROGRESS ====================

function saveCurrentPosition() {
  storage.set("currentTime", music.currentTime);
  state.lastPositionSave = Date.now();
}

music.addEventListener("timeupdate", () => {
  if (!Number.isFinite(music.duration) || music.duration <= 0) {
    return;
  }

  const duration = music.duration;
  const playingTime = (music.currentTime / duration) * 100;

  const seconds = Math.floor(music.currentTime);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  dom.progress.value = playingTime;

  dom.currTime.textContent =
    `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;

  if (Date.now() - state.lastPositionSave >= 3000) {
    saveCurrentPosition();
  }
});

dom.progress.addEventListener("input", (event) => {
  if (!Number.isFinite(music.duration)) return;

  const seekTime = (event.target.value / 100) * music.duration;
  music.currentTime = seekTime;
});

// ==================== AUDIO METADATA ====================

music.addEventListener("loadedmetadata", () => {
  if (state.isInitialLoad) {
    const savedTime = storage.get("currentTime");

    if (savedTime !== null) {
      const parsedTime = Number(savedTime);
      if (Number.isFinite(parsedTime) && parsedTime < music.duration) {
        music.currentTime = parsedTime;
      }
    }

    state.isInitialLoad = false;
  }

  const seconds = Math.floor(music.duration);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  dom.endTime.textContent =
    `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
});

// ==================== PLAYLIST EVENTS ====================

dom.playlistContainer.addEventListener("click", (event) => {
  const listItem = event.target.closest("li");

  if (!listItem) return;

  const songIndex = Number(listItem.dataset.index);

  if (event.target.closest(".play-next")) {
    if (!state.playQueue.includes(songIndex)) {
      state.playQueue.push(songIndex);
      renderQueue();
    }
    return;
  }

  if (songIndex !== state.currentSongIndex) {
    state.currentSongIndex = songIndex;

    loadSong();
    playCurrentSong();
  }
});

// ==================== ENDED ====================

music.addEventListener("ended", () => {
  state.isRepeat ? playCurrentSong() : nextSong();
});

// ==================== SHUFFLE ====================

function generateShuffleOrder(order) {
  for (let index = order.length - 1; index >= 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
  }
}

dom.shuffleBtn.addEventListener("click", () => {
  state.isShuffle = !state.isShuffle;

  storage.set("shuffle", state.isShuffle);

  if (state.isShuffle) {
    dom.shuffleBtn.classList.add("is-active");
    dom.shuffleBtn.querySelector("span").textContent = "Shuffle On";

    generateShuffleOrder(state.shuffleOrder);
    state.shufflePosition = state.shuffleOrder.indexOf(state.currentSongIndex);
  } else {
    dom.shuffleBtn.classList.remove("is-active");
    dom.shuffleBtn.querySelector("span").textContent = "Shuffle Off";
  }
});

// ==================== REPEAT ====================

dom.repeatBtn.addEventListener("click", () => {
  state.isRepeat = !state.isRepeat;

  storage.set("repeat", state.isRepeat);

  dom.repeatBtn.classList.toggle("is-active", state.isRepeat);
  dom.repeatBtn.querySelector("span").textContent = state.isRepeat
    ? "Repeat On"
    : "Repeat off";
});

// ==================== KEYBOARD ====================

document.addEventListener("keydown", (event) => {
  const active = document.activeElement;
  if (active && active.tagName === "INPUT" && active.type === "range") {
    return;
  }

  if (event.key === "ArrowRight") {
    nextSong();
    event.preventDefault();
  }

  if (event.key === "ArrowLeft") {
    prevSong();
    event.preventDefault();
  }

  if (event.key === " ") {
    togglePlay();
    event.preventDefault();
  }
});

// ==================== MUTE ====================

dom.muteButton.addEventListener("click", () => {
  state.isMuted = !state.isMuted;
  music.muted = state.isMuted;

  dom.muteButton.classList.toggle("is-active", state.isMuted);
});

// ==================== LOADING ====================

music.addEventListener("canplay", () => {
  dom.songStatus.textContent = "";
});

// ==================== PLAYBACK SPEED ====================

dom.speedControl.addEventListener("change", (event) => {
  const speed = Number(event.target.value);
  if (!Number.isFinite(speed) || speed <= 0) return;

  music.playbackRate = speed;
  storage.set("speed", speed);
});

// ==================== SEARCH ====================

dom.playlistSearch.addEventListener("input", (event) => {
  const searchText = event.target.value.toLowerCase();

  const filteredSongs = songs.filter((song) => {
    return (
      song.title.toLowerCase().includes(searchText) ||
      song.artist.toLowerCase().includes(searchText)
    );
  });

  renderPlaylist(filteredSongs);
});

// ==================== QUEUE EVENTS ====================

dom.queueContainer.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".remove-queue");
  if (!removeButton) return;

  const queuePosition = Number(removeButton.dataset.position);
  state.playQueue.splice(queuePosition, 1);

  renderQueue();
});

// ==================== INIT ====================
// Every piece of startup work (restoring saved volume/shuffle/repeat/
// speed, first render, first load) happens here in one place, in a
// clear order, instead of as scattered top-level statements.

function restoreSavedVolume() {
  const savedVolume = storage.get("volume");

  if (savedVolume !== null && Number.isFinite(Number(savedVolume))) {
    dom.volumeRange.value = savedVolume;
    music.volume = Number(savedVolume) * 0.01;
  } else {
    dom.volumeRange.value = 50;
    music.volume = 0.5;
  }
}

function restoreSavedShuffle() {
  const savedShuffle = storage.get("shuffle");
  state.isShuffle = savedShuffle === "true";

  dom.shuffleBtn.classList.toggle("is-active", state.isShuffle);
  const label = dom.shuffleBtn.querySelector("span");
  if (label) label.textContent = state.isShuffle ? "Shuffle On" : "Shuffle Off";

  if (state.isShuffle) {
    generateShuffleOrder(state.shuffleOrder);
    state.shufflePosition = state.shuffleOrder.indexOf(state.currentSongIndex);
  }
}

function restoreSavedRepeat() {
  const savedRepeat = storage.get("repeat");
  state.isRepeat = savedRepeat === "true";

  dom.repeatBtn.classList.toggle("is-active", state.isRepeat);
  const label = dom.repeatBtn.querySelector("span");
  if (label) label.textContent = state.isRepeat ? "Repeat On" : "Repeat off";
}

function restoreSavedSpeed() {
  const savedSpeed = storage.get("speed");

  if (savedSpeed !== null && Number.isFinite(Number(savedSpeed))) {
    dom.speedControl.value = savedSpeed;
    music.playbackRate = Number(savedSpeed);
  }
}

function init() {
  if (missingElements.length > 0) {
    // Core wiring is broken; don't compound the error by running the
    // rest of init against null elements.
    return;
  }

  restoreSavedVolume();
  restoreSavedShuffle();
  restoreSavedRepeat();
  restoreSavedSpeed();

  renderPlaylist(songs);
  renderQueue();
  loadSong();
}

init();

