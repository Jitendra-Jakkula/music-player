const playButton = document.querySelector(".play");
const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");
const songTitle = document.querySelector(".song-info h2");
const songArtist = document.querySelector(".song-info p");
const volumeRange = document.querySelector(".volume-bar");

const music = new Audio("./music/m1.mp3");


playButton.addEventListener("click",()=>{
playMusic();
});

function playMusic(){
    if(music.paused){
    music.play();
    playButton.innerHTML = `Pause`;
}else{
    music.pause();
    playButton.innerHTML = `Play`;
}
}

const songs = [
    {
        title : "song1",
        artist : "artist1",
        src : "./music/m1.mp3"
    },
    {
        title : "song2",
        artist : "artist2",
        src : "./music/m2.mp3"
    },
    {
        title : "song3",
        artist : "artist3",
        src : "./music/m3.mp3"
    }
];

let currentSongIndex = 0;


function loadSong(){
    const currSong = songs[currentSongIndex];
    songTitle.textContent = currSong.title;
    songArtist.textContent = currSong.artist;
    music.src = currSong.src;
}

loadSong();

nextButton.addEventListener("click",()=>{
    currentSongIndex = (currentSongIndex+1) % songs.length;
    console.log(currentSongIndex);
    loadSong();
    playMusic();
   
});
prevButton.addEventListener("click",()=>{
    currentSongIndex = (songs.length + currentSongIndex-1) % songs.length;
    console.log(currentSongIndex);
    loadSong();
    playMusic();
   
});


console.log(volumeRange.value);

volumeRange.addEventListener("input",(e)=>{
    let currVol = (e.target.value);
    // console.log(currVol*0.01);
    music.volume = currVol*0.01;
});
