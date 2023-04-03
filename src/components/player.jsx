//player.jsx
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStop, faRedo, faCog } from "@fortawesome/free-solid-svg-icons";
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
  isLoading,
}) {
  const audioRef = useRef(null);
const [menuVisible, setMenuVisible] = useState(false);
const [volume, setVolume] = useState(1);
const [playbackRate, setPlaybackRate] = useState(1);
const [checkboxChecked, setCheckboxChecked] = useState(false);
  function handleVolumeChange(e) {
  const newVolume = e.target.value;
  setVolume(newVolume);
  if (audioContextRef.current) {
    audioContextRef.current.destination.gain.value = newVolume;
  }
}

function handlePlaybackRateChange(e) {
  const newPlaybackRate = e.target.value;
  setPlaybackRate(newPlaybackRate);
  if (audioContextRef.current) {
    audioContextRef.current.playbackRate.value = newPlaybackRate;
  }
}

function handleCheckboxChange(e) {
  setCheckboxChecked(e.target.checked);
}
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
        
{isLoading ? (
  <div className="loading-indicator"></div>
) : (
  <button onClick={togglePlay}>
    <FontAwesomeIcon icon={isAudioPlaying ? faStop : faPlay} />
  </button>
)}
<button onClick={() => setCurrentTrackIndex(Math.floor(Math.random() * allTracks.length))}>
  <FontAwesomeIcon icon={faRedo} />
</button>
<button onClick={() => setMenuVisible(!menuVisible)}>
  <FontAwesomeIcon icon={faCog} />
</button>
      </div>
      {menuVisible && (
  <div className="player__menu">
    <div className="player__menu-item">
      <label htmlFor="volume">Volume</label>
      <input
        type="range"
        id="volume"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
      />
    </div>
    <div className="player__menu-item">
      <label htmlFor="playbackRate">Speed</label>
      <input
        type="range"
        id="playbackRate"
        min="0.5"
        max="2"
        step="0.01"
        value={playbackRate}
        onChange={handlePlaybackRateChange}
      />
    </div>
    <div className="player__menu-item">
      <label htmlFor="checkbox">Checkbox</label>
      <input
        type="checkbox"
        id="checkbox"
        checked={checkboxChecked}
        onChange={handleCheckboxChange}
      />
    </div>
  </div>
)}
      <audio id="audio-element" ref={audioRef} />
    </div>
  );
}
