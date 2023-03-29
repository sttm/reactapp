import React, { useState, useEffect, useRef } from "react";
import { MediaMetadata } from 'media-metadata';
import { Router, Link } from "wouter";

import "./styles/styles.css";

import PageRouter from "./components/router.jsx";

import Seo from "./components/seo.jsx";



// Home function that is reflected across the site
export default function Home() {
  const dummyAudioElementRef = useRef(null);
 const [audioSource, setAudioSource] = useState(null);
  const [audioState, setAudioState] = useState('STOPPED');

async function loadAudio() {
    const context = new AudioContext();
    const source = context.createBufferSource();
    source.connect(context.destination);

    // Load buffer
    const request = new XMLHttpRequest();
    request.open('GET', 'https://cdn.glitch.global/2f792964-ce14-4932-9a6d-b9c37b53bd80/output.m4a?v=1679917550933', true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      context.decodeAudioData(request.response, (response) => {
        // Play the sound after the buffer has loaded
        source.buffer = response;
        source.start(0);
        source.loop = true;
      }, () => {
        console.error('The request failed.');
      });
    };
    request.send();
    // const audioCtx = new window.AudioContext();
    // const source = audioCtx.createBufferSource();
    // const arrayBuffer = await fetch(
    //   'https://cdn.glitch.global/2f792964-ce14-4932-9a6d-b9c37b53bd80/loop1.aac?v=1679915046906',
    // ).then((res) => res.arrayBuffer());
    // const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    // source.buffer = audioBuffer;
    // source.loop = true;
    // source.connect(audioCtx.destination);
    // source.start(1); // start playback immediately
    // setAudioSource(source);
}

  const play = () => {
    setAudioState('PLAYING');
  };

  const pause = () => {
    setAudioState('STOPPED');
    if (audioSource) {
      audioSource.stop();
    }
  };

  useEffect(() => {
    if (audioState === 'PLAYING') {
      loadAudio();
    } else if (audioState === 'STOPPED') {
      if (audioSource) {
        audioSource.stop();
      }
    }
  }, [audioState]);
useEffect(() => {
  if (dummyAudioElementRef.current) {
    dummyAudioElementRef.current.volume = 0;
    dummyAudioElementRef.current.loop = true;
  }
}, []);
  
  useEffect(() => {
    if ('mediaSession' in navigator && typeof MediaMetadata !== 'undefined') {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Environmental sounds',
        artist: 'Tranquil',
        album: '',
        artwork: [
          {
            src: '/images/rain.jpeg',
            sizes: '951x634', // HeightxWidth
            type: 'image/jpeg',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => play());
      navigator.mediaSession.setActionHandler('pause', () => pause());
    }
  }, [play, pause]);
  
useEffect(() => {
  if ('mediaSession' in navigator) {
    if (audioState === 'PLAYING') {
      navigator.mediaSession.playbackState = 'playing';
      dummyAudioElementRef.current?.play();
    } else {
      navigator.mediaSession.playbackState = 'paused';
      dummyAudioElementRef.current?.pause();
    }
  }
}, [audioState]);
  return (
    <Router>
      <Seo />
      <div className="links">
        <Link href="/">Home</Link>
        <span className="divider">|</span>
        <Link href="/about">About</Link>
      </div>
      <div className="audio-controls">
        <button onClick={play}>Play</button>
        <button onClick={pause}>Pause</button>
        <button onClick={() => setAudioState("LOADING")}>Load Audio</button>
      </div>
      <audio
        ref={dummyAudioElementRef}
        src="https://github.com/anars/blank-audio/blob/master/15-seconds-of-silence.mp3?raw=true"
      />
      <main role="main" className="wrapper">
        <div className="content">
          {/* Router specifies which component to insert here as the main content */}
          <PageRouter />
        </div>
      </main>
      {/* Footer links to Home and About, Link elements matched in router.jsx */}
      <footer className="footer">
        <div className="links">
          <Link href="/">Home</Link>
          <span className="divider">|</span>
          <Link href="/about">About</Link>
        </div>
      </footer>
    </Router>
  );
}
