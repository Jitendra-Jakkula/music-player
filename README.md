# 🎵 Music Player

A modern, minimal **web-based music player** built with vanilla HTML, CSS, and JavaScript.

The project focuses on building a real-world music player while practicing **DOM manipulation, events, state management, localStorage, playlist rendering, queue management, and audio APIs**.

## ✨ Features

* ▶️ Play / Pause music
* ⏮️ Previous song
* ⏭️ Next song
* 🎵 Dynamic playlist
* 🔍 Search songs by title or artist
* 🔀 Shuffle playback
* 🔁 Repeat current song
* 📋 Play Next queue
* ❌ Remove songs from queue
* 💾 Persistent settings using `localStorage`

  * Volume
  * Playback speed
  * Shuffle state
  * Repeat state
  * Last played song
  * Last playback position
* ⏱️ Real-time playback progress
* 🎚️ Seek through the song
* 🔊 Mute / Unmute
* ⚡ Playback speed control
* 🖼️ Dynamic album artwork
* ⌨️ Keyboard controls
* ⚠️ Basic audio and artwork error handling
* 🌌 Animated space-style background

## 🎮 Keyboard Controls

| Key     | Action        |
| ------- | ------------- |
| `Space` | Play / Pause  |
| `←`     | Previous song |
| `→`     | Next song     |

## 🔀 Playback Priority

When pressing **Next**, the player follows this order:

```text
Repeat
   ↓
Queue
   ↓
Shuffle
   ↓
Normal playback
```

Repeat takes priority when a song ends.

If Repeat is disabled, the player checks the queue before falling back to shuffle or normal playback.

## 📋 Queue System

Songs can be added to an **Up Next** queue.

For example:

```text
playQueue = [2, 0]
```

represents:

```text
Song 3
   ↓
Song 1
```

The queue uses **song indices** rather than storing complete song objects.

When the next queued song is played:

```text
playQueue.shift()
```

removes the first item.

Queue items can also be removed from any position using:

```text
playQueue.splice()
```

Duplicate songs are prevented using:

```text
playQueue.includes()
```

## 🔍 Search

The playlist can be searched by:

* Song title
* Artist name

Search is handled using the `input` event, so results update while typing.

```text
songs[]
   ↓
filter()
   ↓
renderPlaylist()
```

The original `songs[]` array remains the **source of truth**.

## 💾 Local Storage

The player remembers important user preferences and playback state.

Stored values include:

```text
volume
speed
shuffle
repeat
currentSongIndex
currentTime
```

This allows the player to restore the previous state after refreshing the page.

For example:

```text
Song 2
1:37 / 4:20
   ↓
Refresh
   ↓
Song 2
1:37 / 4:20
```

Playback does **not** automatically start after restoring the position.

## 🛠️ Technologies

* HTML5
* CSS3
* JavaScript
* HTML5 Audio API
* DOM API
* LocalStorage API
* Lucide Icons

## 📁 Project Structure

```text
music-player/
│
├── index.html
├── style.css
├── script.js
├── space-bg.js
├── ui-enhancements.js
│
├── music/
│   ├── m1.mp3
│   ├── m2.mp3
│   └── m4.mp3
│
├── images/
│   ├── img1.jpg
│   ├── img2.jpg
│   └── img3.jpg
│
└── README.md
```

## 🚀 Running the Project

Since this is a frontend project, you can run it using a local development server.

For example, with VS Code:

1. Open the project folder.
2. Install/use **Live Server**.
3. Open `index.html` with Live Server.
4. Start using the player.

Make sure the `music/` and `images/` paths match the files used in `script.js`.

## 🧠 Concepts Practiced

This project was built incrementally to practice practical JavaScript concepts:

* DOM selection
* Event listeners
* Event delegation
* Arrays and array methods
* `filter()`
* `includes()`
* `push()`
* `shift()`
* `splice()`
* State management
* Conditional logic
* HTML5 Audio API
* `currentTime`
* `duration`
* `playbackRate`
* `volume`
* `loadedmetadata`
* `timeupdate`
* `ended`
* `localStorage`
* Dynamic DOM rendering
* UI state synchronization
* Error handling

## 🎯 Future Improvements

Possible next steps:

* 🎨 Final UI/UX polish
* 📱 Better mobile responsiveness
* 🎚️ Improved custom controls
* 🖼️ Better artwork fallback
* 📋 Queue reordering
* 💿 Album/playlist support
* ❤️ Favorite songs
* 📊 Audio visualizer
* 🔊 More advanced volume controls
* 🎵 Larger music library
* 💾 Persistent queue
* 🌐 Deploy the player online

## 📌 Project Status

**Status:** Functional and actively being improved.

The project currently has the core music-player functionality implemented, with UI polish and additional improvements planned.

---

### Built with ❤️ using Vanilla JavaScript

This project is primarily a learning project focused on understanding how a real interactive web application can be built **without a framework**.
