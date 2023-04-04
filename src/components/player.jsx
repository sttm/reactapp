/*/components/player.jsx*/
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faStop,
  faRedo,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
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
  toggleMenu,
}) {
  const audioRef = useRef(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [trackTimer, setTrackTimer] = useState(null);
  const [timerDuration, setTimerDuration] = useState(0);
const [fontSize, setFontSize] = useState('75%');

const adjustFontSize = (text) => {
  const length = text.length;

  if (length < 10) {
    setFontSize('100%');
  } else if (length < 20) {
    setFontSize('75%');
  } else {
    setFontSize('50%');
  }
};

  function handleTimerDurationChange(e) {
    setTimerDuration(e.target.value);
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
      clearTimeout(trackTimer);
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

    if (checkboxChecked) {
      trackTimer = setTimeout(() => {
        if (currentTrackIndex < allTracks.length - 1) {
          setCurrentTrackIndex(currentTrackIndex + 1);
        } else {
          setCurrentTrackIndex(0);
        }
      }, timerDuration * 60 * 1000);
    }
  }
}

  function playTrack(trackIndex, timerDuration) {
    // ... play the track here
    setTrackTimer(
      setTimeout(() => {
        // Switch to the next track when the timer ends
        setCurrentTrackIndex(currentTrackIndex + 1);
      }, timerDuration * 1000)
    );
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
            <div className="player_all_title">
              <p className="player__title" style={{ fontSize }}>{currentTrack.title_album}</p>
              <p className="player__artist" style={{ fontSize }}>{currentTrack.filename}</p>
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
        <button
          onClick={() =>
            setCurrentTrackIndex(Math.floor(Math.random() * allTracks.length))
          }
        >
          <FontAwesomeIcon icon={faRedo} />
        </button>
<button onClick={() => {
  toggleMenu();
  setMenuVisible((prevState) => !prevState);
}}>
  <FontAwesomeIcon icon={faCog} />
</button>
      </div>
      
      <audio id="audio-element" ref={audioRef} />
    </div>
  );
}
