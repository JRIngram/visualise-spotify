export function playOrPausePreview(songPreviewId) {
  const song_preview = document.getElementById(songPreviewId);
  const audioElements = document.getElementsByTagName('audio');

  song_preview.volume = 0.3;
  if (song_preview.paused) {
    // Stop any other audio elements in the app from playing
    for (const audio of audioElements) {
      audio.pause();
    }
    song_preview.play();
  } else {
    song_preview.pause();
  }
}

export function autoplaySong(songPreviewId) {
  const song_preview = document.getElementById(songPreviewId);
  const audioElements = document.getElementsByTagName('audio');
  song_preview.volume = 0.3;
  for (const audio of audioElements) {
    audio.pause();
  }
  song_preview.play();
}

export function muteSong(songPreviewId) {
  const song_preview = document.getElementById(songPreviewId);
  if (song_preview.muted) {
    song_preview.muted = false;
  } else {
    song_preview.muted = true;
  }
}
