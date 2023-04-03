//player.jsx
import React, { useState, useEffect, useRef } from "react";

export default function Player({
  allTracks,
  isAudioPlaying,
  stop,
  play,
  currentTrackIndex,
  setCurrentTrackIndex,
  currentTrack,
  currentImage,
  audioContextRef,
}) {
  const audioRef = useRef(null);

  // Play next track when current one finishes
  useEffect(() => {
    function handleEnded() {
      if (currentTrackIndex < allTracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setCurrentTrackIndex(0);
      }
    }

    if (isAudioPlaying) {
      const audio = audioRef.current;
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [currentTrackIndex, isAudioPlaying, allTracks]);

  // Toggle play/pause when button is clicked
function togglePlay() {
  if (isAudioPlaying) {
    stop();
  } else {
    if (audioContextRef.current) {
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
    } else {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    play(allTracks[currentTrackIndex].uri);
  }
}

  return (
    <div className="player">
      <div className="player__info">
        {currentTrack && currentImage && (
          <>
            <img
              src={currentImage.field_image_field.und[0].uri}
              alt={`Cover of ${currentTrack.title_album}`}
              className="player__album-art"
            />
            <div>
            <div className="player__title">{currentTrack.title_album}</div>
            <div className="player__artist">{currentTrack.filename}</div>
            </div>
          </>
        )}
      </div>
      <div className="player__controls">
        <button onClick={togglePlay}>
          {isAudioPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() =>
            setCurrentTrackIndex(Math.floor(Math.random() * allTracks.length))
          }
        >
          Random
        </button>
      </div>
      <audio id="audio-element" ref={audioRef} />
    </div>
  );
}
