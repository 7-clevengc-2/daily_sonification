import React, { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

function UploadSound() {
  const playerRef = useRef(null);
  const [objectUrl, setObjectUrl] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0); // dB

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.stop();
          playerRef.current.dispose();
        } catch (_) {}
        playerRef.current = null;
      }
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  function resetCurrent() {
    if (playerRef.current) {
      try {
        playerRef.current.stop();
        playerRef.current.dispose();
      } catch (_) {}
      playerRef.current = null;
    }
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
    setIsLoaded(false);
    setIsPlaying(false);
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    resetCurrent();
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    await Tone.start();
    const player = new Tone.Player({
      url,
      autostart: true,
      fadeIn: 0.01,
      fadeOut: 0.01,
      onload: () => {
        setIsLoaded(true);
        setIsPlaying(true);
      },
      onerror: (err) => {
        console.error(err);
        setIsLoaded(false);
        setIsPlaying(false);
      },
    }).toDestination();
    player.volume.value = volume;
    playerRef.current = player;
  }

  function handleVolumeChange(e) {
    const val = Number(e.target.value);
    setVolume(val);
    if (playerRef.current) {
      playerRef.current.volume.value = val;
    }
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Upload and Play a Sound</h1>
      <div style={{ marginTop: "1rem" }}>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
      </div>
      <div style={{ marginTop: "1.5rem" }}>
        <label>
          Volume: {volume} dB
          <input
            type="range"
            min={-60}
            max={0}
            step={1}
            value={volume}
            onChange={handleVolumeChange}
            style={{ width: "300px", marginLeft: "1rem" }}
          />
        </label>
      </div>
      <div style={{ marginTop: "0.75rem", color: isLoaded ? "#28a745" : "#888" }}>
        {isLoaded ? (isPlaying ? "Playing." : "Loaded.") : "Select an audio file to load."}
      </div>
    </div>
  );
}

export default UploadSound;


