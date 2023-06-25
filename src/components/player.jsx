/*/components/player.jsx*/
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faBackward,
  faForward,
  faStop,
  faRedo,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
export default function Player({
  allTracks,
  isAudioPlaying,
  stop,
  playTrack,
  playNextTrack,
  playPreviousTrack,
  currentTrackIndex,
  currentTrack,
  currentImage,
  audioContextRef,
  isLoading,
  toggleMenu,
  playRandomTrack,
}) {
  const audioRef = useRef(null);
  // const [menuVisible, setMenuVisible] = useState(false);
  // const [playbackRate, setPlaybackRate] = useState(1);
  // const [checkboxChecked, setCheckboxChecked] = useState(false);
  // const [trackTimer, setTrackTimer] = useState(null);
  // const [timerDuration, setTimerDuration] = useState(0);
  const [views, setViews] = useState(0);
  const [fontSize, setFontSize] = useState("75%");

  const adjustFontSize = (text) => {
    const length = text.length;

    if (length < 10) {
      setFontSize("100%");
    } else if (length < 20) {
      setFontSize("75%");
    } else {
      setFontSize("50%");
    }
  };

  useEffect(() => {
    setViews((v) => v + 1);
  }, []);

  // function handleTimerDurationChange(e) {
  //   setTimerDuration(e.target.value);
  // }

  // function handlePlaybackRateChange(e) {
  //   const newPlaybackRate = e.target.value;
  //   setPlaybackRate(newPlaybackRate);
  //   if (audioContextRef.current) {
  //     audioContextRef.current.playbackRate.value = newPlaybackRate;
  //   }
  // }

  // function handleCheckboxChange(e) {
  //   setCheckboxChecked(e.target.checked);
  // }
  // Play next track when current one finishes
  // useEffect(() => {
  //   function handleEnded() {
  //     clearTimeout(trackTimer);
  //     if (currentTrackIndex < allTracks.length - 1) {
  //       setCurrentTrackIndex(currentTrackIndex + 1);
  //     } else {
  //       setCurrentTrackIndex(0);
  //     }
  //   }

  //   if (isAudioPlaying) {
  //     const audio = audioRef.current;
  //     audio.addEventListener("ended", handleEnded);
  //     return () => {
  //       audio.removeEventListener("ended", handleEnded);
  //     };
  //   }
  // }, [currentTrackIndex, isAudioPlaying, allTracks]);

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
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
      playTrack(currentTrackIndex);
      // play(allTracks[currentTrackIndex].uri);
    }
  }

  // function playTrack(trackIndex, timerDuration) {
  //   // ... play the track here
  //   setTrackTimer(
  //     setTimeout(() => {
  //       // Switch to the next track when the timer ends
  //       setCurrentTrackIndex(currentTrackIndex + 1);
  //     }, timerDuration * 1000)
  //   );
  // }

  return (

    <div className="player">
      <div className="viewed">
        <p>👁 {views} </p>
      </div>
      <div className="player__info">
        {currentTrack && currentImage && (
          <>
            <img
              src={currentImage.field_image_field.und[0].uri}
              alt={`Cover of ${currentTrack.title_album}`}
              className="player__album-art"
            />
            <div className="player_all_title">
              <p className="player__title" style={{ fontSize }}>
              {/* <p className="player__title"> */}
                {currentTrack.title_album}
              </p>
              <p className="player__artist" style={{ fontSize }}>
              {/* <p className="player__artist"> */}
                {currentTrack.filename}
              </p>
            </div>
          </>
        )}
      </div>
      <div className="player__controls">
        <button onClick={playPreviousTrack}>
          <FontAwesomeIcon icon={faBackward} />
        </button>
        {isLoading ? (
          <div className="loading-indicator"></div>
        ) : (
          <button onClick={togglePlay}>
            <FontAwesomeIcon icon={isAudioPlaying ? faStop : faPlay} />
          </button>
        )}
        <button onClick={playNextTrack}>
          <FontAwesomeIcon icon={faForward} />
        </button>
        <button onClick={playRandomTrack}>
          <FontAwesomeIcon icon={faRedo} />
        </button>
        <button
          onClick={() => {
            toggleMenu();
            setMenuVisible((prevState) => !prevState);
          }}
        >
          <FontAwesomeIcon icon={faCog} />
        </button>
      </div>

      <audio id="audio-element" ref={audioRef} />
    </div>
  );
}
