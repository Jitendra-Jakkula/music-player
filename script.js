const playButton = document.querySelector(".play");
const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");
const songTitle = document.querySelector(".song-info h2");
const songArtist = document.querySelector(".song-info p");
const volumeRange = document.querySelector(".volume-bar");
const progress = document.querySelector(".progress");
const music = new Audio("./music/m1.mp3");
const currTime = document.querySelector(".currtime");
const endTime = document.querySelector(".totaltime");
const playlistContainer = document.querySelector(".playlist ol");
const shuffleBtn = document.querySelector(".shuffle");
let isShuffle = false;
let shufflePosition = 0;
const repeatBtn = document.querySelector(".repeat");
let isRepeat = false;

const muteButton = document.querySelector(".volume-control .mute");
let isMuted = false;

const artworkImg = document.querySelector(".artwork-img");
const songStatus = document.querySelector("#status");
const speedControl = document.querySelector(".speed");
const playlistSearch = document.querySelector(".playlist-search");
const queueContainer = document.querySelector(".queue-list");


let playQueue = [];

const savedIndex = localStorage.getItem("currentSongIndex");
let currentSongIndex = savedIndex !== null ? Number(savedIndex) : 0;

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

function renderPlaylist(songsToRender) {
  playlistContainer.innerHTML = "";
  songsToRender.forEach((song) => {
    const originalIndex = songs.indexOf(song);
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = song.title;
    const smallTag = document.createElement("small");
    smallTag.textContent = song.artist;
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.classList.add("play-next");

    li.appendChild(span);
    li.appendChild(smallTag);
    li.appendChild(nextBtn);
    li.setAttribute("data-index", originalIndex);
    playlistContainer.appendChild(li);
  });
}
renderPlaylist(songs);

function renderQueue() {
  queueContainer.innerHTML = "";

  playQueue.forEach((songIndex, queuePosition) => {
    const song = songs[songIndex];

    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = `${song.title} — ${song.artist}`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.classList.add("remove-queue");

    removeBtn.dataset.position = queuePosition;

    li.appendChild(span);
    li.appendChild(removeBtn);

    queueContainer.appendChild(li);
  });
}

const playlist = playlistContainer.querySelectorAll("li");
console.log(playlist);

// play
playButton.addEventListener("click", () => {
  togglePlay();
});

function togglePlay() {
  if (music.paused) {
    music.play();
  } else {
    music.pause();
  }
}
async function playCurrentSong() {
  try {
    await music.play();
  } catch (e) {
    console.log("Playback failed:", e);
  }
}

music.addEventListener("play", () => {
  playButton.innerHTML = `Pause`;
});
music.addEventListener("pause", () => {
  playButton.innerHTML = `Play`;
  saveCurrentPosition();
});


function loadSong() {
  songStatus.textContent = "Loading...";
  const currSong = songs[currentSongIndex];
  songTitle.textContent = currSong.title;
  songArtist.textContent = currSong.artist;
  music.src = currSong.src;
  artworkImg.src = currSong.artwork;

  localStorage.setItem("currentSongIndex", currentSongIndex);
  music.currentTime = 0;
  progress.value = 0;
  currTime.textContent = "0:00";
  playlist.forEach((e) => {
    e.classList.remove("active", "next-song");
  });
  playlist[currentSongIndex].classList.add("active");
  if (!isShuffle) {
    const nextSongIndex = (currentSongIndex + 1) % songs.length;
    playlist[nextSongIndex].classList.add("next-song");
  }
}

loadSong();

nextButton.addEventListener("click", () => {
  nextSong();
});

function nextSong() {

  if (playQueue.length > 0) {

    currentSongIndex = playQueue.shift();
    renderQueue();

  } else if (isShuffle) {

    shufflePosition =
      (shufflePosition + 1) % songs.length;

    currentSongIndex =
      shuffleOrder[shufflePosition];

  } else {

    currentSongIndex =
      (currentSongIndex + 1) % songs.length;
  }

  loadSong();
  playCurrentSong();
}

prevButton.addEventListener("click", () => {
  prevSong();
});

function prevSong() {
  if (isShuffle) {
    shufflePosition = (shufflePosition - 1 + songs.length) % songs.length;

    currentSongIndex = shuffleOrder[shufflePosition];
  } else {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  }

  console.log("current Index", currentSongIndex);
  loadSong();
  playCurrentSong();
}

volumeRange.addEventListener("input", (e) => {
  let currVol = e.target.value;
  
  music.volume = currVol * 0.01;
  localStorage.setItem("volume",currVol);
  // If user changes volume, unmute
  if (music.muted) {
    music.muted = false;
    isMuted = false;
    muteButton.textContent = "Mute";
  }
});

// *****TIME UPDATE *****
let lastPositionSave = 0;
function saveCurrentPosition() {
  localStorage.setItem("currentTime", music.currentTime);
  lastPositionSave = Date.now();
}
music.addEventListener("timeupdate", () => {
  if (!Number.isFinite(music.duration) || music.duration <= 0) return;
  const duration = music.duration;
  let playingTime = (music.currentTime / duration) * 100;
  // console.log(playingTime);
  const seconds = Math.floor(music.currentTime);
  const minutes = Math.floor(seconds / 60);
  progress.value = playingTime;
  const remainingSeconds = seconds % 60;
  // console.log(`${minutes}:${remainingSeconds.toString().padStart(2, "0")}`);
  currTime.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  // Save position every 3 seconds
  if (Date.now() - lastPositionSave >= 3000) {
  saveCurrentPosition();
}
});

//  Load EndTIme using MEtaData..****
let isInitialLoad = true;
music.addEventListener("loadedmetadata", () => {
if (isInitialLoad) {
    const savedTime = localStorage.getItem("currentTime");

    if (savedTime !== null) {
      music.currentTime = Number(savedTime);
    }

    isInitialLoad = false;
  }
  const seconds = Math.floor(music.duration);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  // console.log(`${minutes}:${remainingSeconds.toString().padStart(2, "0")}`);
  endTime.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
});

// Music Progesss Bar
progress.addEventListener("input", (e) => {
  // console.log(e.target.value);
  // console.log(music.duration);
  let seekTime = (e.target.value / 100) * music.duration;

  music.currentTime = seekTime;
});

// console.log(playlist);

//event delegation
playlistContainer.addEventListener("click", (e) => {
  const li = e.target.closest("li");

  if (!li) return;

  const index = Number(li.dataset.index);

  if (e.target.closest(".play-next")) {
    playQueue.push(index);
    renderQueue();
    console.log("Queue:", playQueue);
    return;
  }

  if (index !== currentSongIndex) {
    currentSongIndex = index;

    loadSong();
    playCurrentSong();
  }
});

// console.log(playlist[0].textContent);

music.addEventListener("ended", () => {
  isRepeat ? playCurrentSong() : nextSong();
});

function shuffleSongs() {
  if (songs.length <= 1) {
    return currentSongIndex;
  }
  let randomNumber;

  do {
    randomNumber = Math.floor(Math.random() * songs.length);
  } while (randomNumber === currentSongIndex);

  return randomNumber;
}

//shufle imporvment

const shuffleOrder = Array.from({ length: songs.length }, (_, idx) => idx);

function generateShuffleOrder(arr) {
  //fisher Yates algo
  for (let i = arr.length - 1; i >= 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    //swap
    [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
  }
}

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  localStorage.setItem("shuffle", isShuffle);
  if (isShuffle) {
    shuffleBtn.textContent = "Shuffle On";
    console.log("ON");
    generateShuffleOrder(shuffleOrder);
    shufflePosition = shuffleOrder.indexOf(currentSongIndex);
    console.log("shuffleOrder", shuffleOrder);
  }else{
    shuffleBtn.textContent = "Shuffle Off";
  }
});

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  localStorage.setItem("repeat", isRepeat);
  if(isRepeat){
    repeatBtn.textContent = "Repeat On";
  }else{
    repeatBtn.textContent = "Repeat off";

  }
  console.log(isRepeat);
});

//key mapping
document.addEventListener("keydown", (e) => {
  console.log(document.activeElement.type);
  if (
    document.activeElement.tagName === "INPUT" &&
    document.activeElement.type === "range"
  ) {
    return;
  }
  if (e.key === "ArrowRight") {
    nextSong();
    e.preventDefault();
  }

  

  if (e.key === "ArrowLeft") {
    prevSong();
    e.preventDefault();
  }
  if (e.key === " ") {
    togglePlay();
    e.preventDefault();
  }
});

// document.activeElement => key curretn foucns *** and e.currentTarge and data-*
// document.activeElement.tagName
console.log(document.activeElement);

//mute and unmute

muteButton.addEventListener("click", () => {
  isMuted = !isMuted;
  music.muted = isMuted;
  isMuted
    ? (muteButton.textContent = "Unmute")
    : (muteButton.textContent = "Mute");
});

// HANDLING PLAYING NEXT SONG LOADING

music.addEventListener("canplay", () => {
  // console.log("yes");
  songStatus.textContent = "";
});


speedControl.addEventListener("change", (e) => {
    const speed = Number(e.target.value);
    music.playbackRate = speed;
    localStorage.setItem("speed", speed);
});


//LoCAL sTORAge .....

const savedVolume = localStorage.getItem("volume");
if(savedVolume !== null){
  volumeRange.value = savedVolume;
  music.volume = Number(savedVolume)*0.01;
}else{
  ///default
  volumeRange.value = 50;
  music.volume = 0.5;
}

const savedShuffle = localStorage.getItem("shuffle");

if (savedShuffle !== null) {
  isShuffle = savedShuffle === "true";
}

const savedRepeat = localStorage.getItem("repeat");

if (savedRepeat !== null) {
  isRepeat = savedRepeat === "true";
}

const savedSpeed = localStorage.getItem("speed");

if (savedSpeed !== null) {
  speedControl.value = savedSpeed;
  music.playbackRate = Number(savedSpeed);
}

//search ****
playlistSearch.addEventListener("input", (e) => {
  const searchText = e.target.value.toLowerCase();

  const filteredSongs = songs.filter((song) => {
    return (
      song.title.toLowerCase().includes(searchText) ||
      song.artist.toLowerCase().includes(searchText)
    );
  });

  renderPlaylist(filteredSongs);
});


queueContainer.addEventListener("click", (e) => {

  const removeBtn = e.target.closest(".remove-queue");

  if (!removeBtn) return;

  const position = Number(removeBtn.dataset.position);

  playQueue.splice(position, 1);

  renderQueue();
});