//app.jsx
import React, { useState, useEffect, useRef } from "react";
import { Router, Link } from "wouter";
import "./styles/styles.css";
import "./styles/player.css";

import PageRouter from "./components/router.jsx";
import Seo from "./components/seo.jsx";
import Player from "./components/player.jsx";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const dummyAudioElementRef = useRef(null);
  const [audioState, setAudioState] = useState("STOPPED");

  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [images, setImages] = useState([]);
  const [allTracks, setAllTracks] = useState([]);
  const [images_v, setImagesV] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  // const trackHistory = [];
  const [lastImageElement, setLastImageElement] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [theme, setTheme] = useState("light");
const intervals = [1, 2, 5, 10, 15, 20, 30, "disabled"];
const [currentInterval, setCurrentInterval] = useState("disabled");

const handleButtonClick = () => {
  const currentIndex = intervals.indexOf(currentInterval);
  const nextIndex = (currentIndex + 1) % intervals.length;
  setCurrentInterval(intervals[nextIndex]);
};
  function changeTheme(newTheme) {
    setTheme(newTheme);
  }

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  function handleScroll() {
    setShowPanel(false);
    setMenuVisible(false);
  }

  // Add scroll event listener to window object
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fetch images when component mounts
  useEffect(() => {
    fetchMoreImages();
  }, []);

  async function fetchMoreImages() {
    let data;
    try {
      const response1 = await fetch("src/output.json");
      data = await response1.json();
    } catch (error) {
      console.error(error);
      try {
        const response2 = await fetch(
          "https://raw.githubusercontent.com/sttm/reactapp/glitch/src/output.json"
        );
        data = await response2.json();
      } catch (error) {
        console.error(error);
        data = null;
      }
    }
    setImages((prevImages) => [...prevImages, ...data]);
  }

  useEffect(() => {
    if (!IntersectionObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreImages();
        }
      },
      { threshold: 1 }
    );

    if (lastImageElement) {
      observer.observe(lastImageElement);
    }

    return () => {
      if (lastImageElement) {
        observer.unobserve(lastImageElement);
      }
    };
  }, [lastImageElement]);

  function togglePanel(downloadUrl, imgUrl, allTracks) {
    if (!showPanel) {
      try {
        setTracks(downloadUrl);
        setImagesV(imgUrl);
        setAllTracks(allTracks);
        setShowPanel(true);
      } catch (error) {
        console.error(error);
      }
    } else {
      if (isAudioPlaying) {
        stop();
      }
      setShowPanel(false);
    }
  }

  // Create an audio context if one doesn't already exist
  function createAudioContext() {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
  }

  function playTrack(trackIndex) {
    const track = allTracks[trackIndex];
    setAudioState("PLAYING");
    loadAudio(track.uri);
    createAudioContext();
    setCurrentTrackIndex(trackIndex);
  }

  function setCurrentTrackIndexFromPlayer(newIndex) {
    setCurrentTrackIndex(newIndex);
  }

  // Stop audio playback
  function stop() {
    setAudioState("STOPPED");
    setIsAudioPlaying(false);
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
    }
  }

  async function loadAudio(url) {
    setIsLoading(true);
    if (!audioContextRef.current) {
      return;
    }
    const context = audioContextRef.current;
    if (context.state === "suspended") {
      await context.resume();
    }

    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
    }

    const source = context.createBufferSource();
    source.connect(context.destination);
    audioSourceRef.current = source;

    // Load buffer
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);

    source.buffer = audioBuffer;
    source.start(0);
    source.loop = true;
    setIsAudioPlaying(true);
    setIsLoading(false); // Добавьте это
  }

  const play = (trackUri) => {
    setAudioState("PLAYING");

    if (isAudioPlaying) return;
    loadAudio(trackUri);
    setIsAudioPlaying(true);
  };

  useEffect(() => {
    const allTracks = [];

    images.forEach((image) => {
      allTracks.push(...image.field_mobile_looper.und);
    });

    setAllTracks(allTracks);
  }, [images]);

  // Clean up audio context when component is unmounted
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      if (audioState === "PLAYING") {
        navigator.mediaSession.playbackState = "playing";
        dummyAudioElementRef.current?.play();
      } else if (audioState === "PAUSED") {
        navigator.mediaSession.playbackState = "paused";
        dummyAudioElementRef.current?.pause();
      }

      navigator.mediaSession.setActionHandler("play", () => {
        setIsAudioPlaying(true);
        setAudioState("PLAYING");
        // audioContextRef.current?.play();
        playTrack(currentTrackIndex);
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        setIsAudioPlaying(false);
        setAudioState("PAUSED");
        stop();
      });

      navigator.mediaSession.setActionHandler(
        "previoustrack",
        playPreviousTrack
      );
      navigator.mediaSession.setActionHandler("nexttrack", playNextTrack);
    }
  }, [audioState, playPreviousTrack, playNextTrack, currentTrackIndex]);

  useEffect(() => {
    if (dummyAudioElementRef.current) {
      dummyAudioElementRef.current.volume = 0;
      dummyAudioElementRef.current.loop = true;
    }
  }, []);

  // Update media session metadata when current track index or images change
  useEffect(() => {
    if (
      "mediaSession" in navigator &&
      allTracks.length > 0 &&
      images.length > 0
    ) {
      const currentTrack = allTracks[currentTrackIndex];
      const currentImage = images.find((image) =>
        image.field_mobile_looper.und.some(
          (track) => track.uri === currentTrack.uri
        )
      );
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.title_album ?? "",
        artist: currentTrack.filename ?? "",
        artwork: [
          {
            src: currentImage.field_image_field.und[0].uri,
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
    }
  }, [currentTrackIndex, images, allTracks, images_v]);

  function playNextTrack() {
    // trackHistory.push(currentTrackIndex);
    const nextTrackIndex =
      (currentTrackIndex + 1 + Math.floor(Math.random() * allTracks.length)) %
      allTracks.length;
    playTrack(nextTrackIndex);
  }

  function playPreviousTrack() {
    const previousTrackIndex =
      (currentTrackIndex - 1 + allTracks.length) % allTracks.length;
    playTrack(previousTrackIndex);
  }

  function toggleMenu() {
    setMenuVisible((prevState) => !prevState);
  }
  function handleVolumeChange(e) {
    const newVolume = e.target.value;
    setVolume(newVolume);
  }

  function handlePlaybackRateChange(e) {
    const newPlaybackRate = e.target.value;
    setPlaybackRate(newPlaybackRate);
  }


  
useEffect(() => {
  let intervalId;

  if (allTracks.length > 0 && currentInterval !== "disabled") {
    intervalId = setInterval(playRandomTrack, currentInterval * 60 * 1000);
  }

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [allTracks, currentInterval]);
  
  
  const playRandomTrack = () => {
    if (allTracks.length > 0) {
      const randomTrackIndex = Math.floor(Math.random() * allTracks.length);
      console.log("RandomTrack");
      playTrack(randomTrackIndex);
    } else {
      console.warn("allTracks is empty or not set.");
    }
  };
  // useEffect(() => {
  //   console.log("audioState:", audioState);
  //   console.log("isAudioPlaying:", isAudioPlaying);
  // }, [audioState, isAudioPlaying]);
  return (
    <>
      <audio
        ref={dummyAudioElementRef}
        src="https://github.com/anars/blank-audio/blob/master/15-seconds-of-silence.mp3?raw=true"
      />
      <div>
        {images.length > 0 ? (
          <ul className="looper-list">
            {images.map((image, index) => (
              <li
                key={`${image.id}-${index}`} // Use a unique key by combining the image id and index
                ref={index === images.length - 1 ? setLastImageElement : null}
              >
                <h2>{image.title}</h2>
                <img
                  src={image.field_image_field.und[0].uri}
                  alt={image.title}
                />
                <button
                  className="btn--panel-toggle"
                  onClick={() =>
                    togglePanel(
                      image.field_mobile_looper.und,
                      image.field_image_field.und[0].uri,
                      allTracks
                    )
                  }
                >
                  Show tracks
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading images...</p>
        )}
      </div>
      {showPanel && (
        <div className="panel">
          {tracks.map((track, index) => (
            <div className="track" key={index}>
              <img src={images_v} alt={`Cover of ${track.title}`} />
              <h3>{track.filename}</h3>
              <div className="controls">
                <button
                  onClick={() => {
                    if (audioContextRef.current) {
                      if (audioContextRef.current.state === "suspended") {
                        audioContextRef.current.resume();
                      }
                    } else {
                      audioContextRef.current = new (window.AudioContext ||
                        window.webkitAudioContext)();
                    }

                    if (isAudioPlaying) {
                      stop();
                    } else {
                      play(track.uri);
                    }
                  }}
                >
                  {isAudioPlaying ? "Stop" : isLoading ? "Wait" : "Play"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Router>
        <PageRouter path="/pages/:pageName" />
      </Router>
      <Seo />
      {menuVisible && (
        <div className="app__menu">
          <div className="app__menu-item">
            <label htmlFor="volume">Vol </label>
            <input
              type="range"
              id="volume"
              min="0"
              max="100" // Замените значение '1' на '100'
              step="0.01"
              value={volume * 100} // Умножьте volume на 100, чтобы отобразить правильное положение ползунка
              onChange={handleVolumeChange}
            />
          </div>
          <div className="app__menu-item app__menu-item-separator">
            <label htmlFor="playbackRate">Pth </label>
            <input
              type="range"
              id="playbackRate"
              min="0.5"
              max="2"
              step="0.01"
              value={playbackRate}
              onChange={(e) => setPlaybackRate(e.target.value)}
            />
          </div>
          <div className="app__menu-item app__menu-item-separator">
            <label htmlFor="timer">Timer </label>
            <button onClick={handleButtonClick}>
    {currentInterval === "disabled" ? "Disabled" : `${currentInterval} min`}
            </button>
          </div>

          <div className="app__menu-item">
            <label htmlFor="theme">Theme  </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => changeTheme(e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      )}
      <Player
        allTracks={allTracks}
        isAudioPlaying={isAudioPlaying}
        stop={stop}
        play={play}
        playTrack={playTrack}
        currentTrackIndex={currentTrackIndex}
        setCurrentTrackIndex={setCurrentTrackIndexFromPlayer}
        currentTrack={allTracks[currentTrackIndex]}
        currentImage={images.find((image) =>
          image.field_mobile_looper.und.some(
            (track) => track.uri === allTracks[currentTrackIndex]?.uri
          )
        )}
        audioContextRef={audioContextRef}
        isLoading={isLoading}
        toggleMenu={toggleMenu}
        menuVisible={menuVisible}
        playRandomTrack={playRandomTrack}
      />
    </>
  );
}
