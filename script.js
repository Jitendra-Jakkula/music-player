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
const repeatBtn = document.querySelector(".repeat");
let isRepeat = false;
const songs = [
  {
    title: "song1",
    artist: "artist1",
    src: "./music/m1.mp3",
  },
  {
    title: "song2",
    artist: "artist2",
    src: "./music/m2.mp3",
  },
  {
    title: "song3",
    artist: "artist3",
    src: "./music/m4.mp3",
  },
];

function renderPlaylist() {
  songs.forEach((e, idx) => {
    const li = document.createElement("li");
    li.textContent = e.title;
    li.setAttribute("data-index", idx);
    li.set;
    playlistContainer.appendChild(li);
  });
}

renderPlaylist();

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
function playCurrentSong() {
  music.play();
}

music.addEventListener("play", () => {
  playButton.innerHTML = `Pause`;
});
music.addEventListener("pause", () => {
  playButton.innerHTML = `Play`;
});

let currentSongIndex = 0;

function loadSong() {
  const currSong = songs[currentSongIndex];
  songTitle.textContent = currSong.title;
  songArtist.textContent = currSong.artist;
  music.src = currSong.src;
  // Reset playback position and UI
  music.currentTime = 0;
  progress.value = 0;
  currTime.textContent = "0:00";
  playlist.forEach((e) => {
    e.classList.remove("active");
  });
  playlist[currentSongIndex].classList.add("active");
}

loadSong();

nextButton.addEventListener("click", () => {
  nextSong();
});

function nextSong() {
    
  currentSongIndex = isShuffle?shuffleSongs(): (currentSongIndex + 1) % songs.length;
  console.log("current Index", currentSongIndex);
  loadSong();

  playCurrentSong();
}
prevButton.addEventListener("click", () => {
  prevSong();
});

function prevSong() {
  currentSongIndex =  isShuffle?shuffleSongs():(songs.length + currentSongIndex - 1) % songs.length;
  console.log("current Index", currentSongIndex);
  loadSong();
  playCurrentSong();
}

volumeRange.addEventListener("input", (e) => {
  let currVol = e.target.value;
  // console.log(currVol*0.01);
  music.volume = currVol * 0.01;
});

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
});

music.addEventListener("loadedmetadata", () => {
  const seconds = Math.floor(music.duration);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  // console.log(`${minutes}:${remainingSeconds.toString().padStart(2, "0")}`);
  endTime.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
});

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

    if (index !== currentSongIndex) {
        currentSongIndex = index;

        loadSong();
        playCurrentSong();
    }
});

// console.log(playlist[0].textContent);

music.addEventListener("ended", () => {

  isRepeat?playCurrentSong():nextSong();
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
shuffleBtn.addEventListener("click",(e)=>{
    // console.log(e.target);
    isShuffle = !isShuffle;
});

repeatBtn.addEventListener("click",()=>{
    isRepeat = !isRepeat;
    console.log(isRepeat);
})



//key mapping
document.addEventListener("keydown",(e)=>{
    console.log(document.activeElement.type)
    if(document.activeElement.tagName === "INPUT" && document.activeElement.type === "range"){return;}
   if (e.key === "ArrowRight") {
        nextSong();
    }
    
    e.preventDefault();

    if (e.key === "ArrowLeft") {
        prevSong();
    }
    if(e.key === " "){
        togglePlay();
    }
});


// document.activeElement => key curretn foucns *** and e.currentTarge and data-* 
// document.activeElement.tagName
console.log(document.activeElement);