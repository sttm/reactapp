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
  function handleScroll() {
    setShowPanel(false);
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
    async function fetchImages() {
      const response = await fetch("src/output.json");
      const data = await response.json();
      setImages(data);
    }
    fetchImages();
  }, []);

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
    const nextTrackIndex =
      (currentTrackIndex + 1 + Math.floor(Math.random() * allTracks.length)) %
      allTracks.length;
    playTrack(nextTrackIndex);
  }

  function playPreviousTrack() {
    const previousTrackIndex =
      (currentTrackIndex -
        1 -
        Math.floor(Math.random() * allTracks.length) +
        allTracks.length) %
      allTracks.length;
    playTrack(previousTrackIndex);
  }
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
          <ul>
            {images.map((image) => (
              <li key={image.id}>
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
  {isAudioPlaying ? "Stop" : (isLoading ? "Загрузка..." : "Play")}
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
      />
    </>
  );
}
