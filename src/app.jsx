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
    const [page, setPage] = useState(1);
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
    const [theme, setTheme] = useState("dark");
    const intervals = [1, 2, 5, 10, 15, 20, 30, "off"];
    const [currentInterval, setCurrentInterval] = useState("off");
    const [currentIndex, setCurrentIndex] = useState(0);

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

    const handleButtonClick = () => {
      const currentIndex = intervals.indexOf(currentInterval);
      const nextIndex = (currentIndex + 1) % intervals.length;
      setCurrentInterval(intervals[nextIndex]);
    };
    function changeTheme(newTheme) {
      setTheme(newTheme);
    }
    useEffect(() => {
      fetchMoreImages(page);
    }, [page]);
    
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

    const itemsPerPage = 20;
    async function fetchMoreImages(page = 1) {
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
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageItems = data.slice(start, end);
      setImages((prevImages) => [...prevImages, ...pageItems]);
    }
    
    useEffect(() => {
      if (!IntersectionObserver) return;
    
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            console.log('Lazy loading triggered for:', lastImageElement);
            setPage(prevPage => prevPage + 1); // This is where you increment the page number
          }
        },
        { threshold: 0.5 }
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
        // if (isAudioPlaying) {
        //   // stop();
        // }
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
      setPlaybackRate(1);
    }

    function setCurrentTrackIndexFromPlayer(newIndex) {
      setCurrentTrackIndex(newIndex);
    }

    // Stop audio playback
    function stop() {
      setAudioState("STOPPED");
      setIsAudioPlaying(false);
      setPlaybackRate(1);
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
      if (audioSourceRef.current) {
        audioSourceRef.current.playbackRate.value = newPlaybackRate;
      }
    }
    let intervalId; // Move this outside of useEffect

    useEffect(() => {
      if (allTracks.length > 0 && currentInterval !== "off" && isAudioPlaying) {
        intervalId = setInterval(playRandomTrack, currentInterval * 60 * 1000);
      }

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }, [allTracks, currentInterval, isAudioPlaying]);

    useEffect(() => {
      if (!isAudioPlaying && intervalId) {
        clearInterval(intervalId);
      }
    }, [isAudioPlaying]);


    const playRandomTrack = () => {
      
      if (allTracks.length > 0) {
        const randomTrackIndex = Math.floor(Math.random() * allTracks.length);
        
        playTrack(randomTrackIndex);
      } else {
        console.warn("allTracks is empty or not set.");
      }
    };
    
    // useEffect(() => {
    //   console.log("audioState:", audioState);
    //   // console.log("isAudioPlaying:", isAudioPlaying);
    // }, [audioState, isAudioPlaying]);
    return (
      <>
        <audio 
          ref={dummyAudioElementRef}
          src="https://github.com/anars/blank-audio/blob/master/15-seconds-of-silence.mp3?raw=true"
        />
        <div>
          {images.length > 0 ? (
            <ul className="looper-list lazy">
      {images.map((image, index) => (
        <li 
          key={`${image.id}-${index}`}
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
            {/* <div className="app__menu-item">
              <label htmlFor="volume">Vol </label>
              <input
                type="range"
                id="volume"
                min="-60"
                max="0" // Замените значение '1' на '100'
                step="1"
                value={volume} 
                onChange={handleVolumeChange}
              />
            </div> */}
            <div className="app__menu-item app__menu-item-separator">
              <label htmlFor="playbackRate">Pth </label>
              <input
                type="range"
                id="playbackRate"
                min="0.2"
                max="1.8"
                step="0.01"
                value={playbackRate}
                onChange={handlePlaybackRateChange}
              />
            </div>
            <div className="app__menu-item app__menu-item-separator">
              <label htmlFor="timer">Timer </label>
              <button onClick={handleButtonClick}>
                {currentInterval === "off" ? "off" : `${currentInterval} min`}
              </button>
            </div>

            <div className="app__menu-item">
              <label htmlFor="theme">Theme </label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => changeTheme(e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
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

