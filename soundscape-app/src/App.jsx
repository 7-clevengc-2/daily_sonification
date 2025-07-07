import React, { useRef } from "react";
import * as Tone from "tone";

const SOUND_URL = "/sounds/calm_pad.wav";

function App() {
  const playerRef = useRef(null);

  const playSound = async () => {
    try {
      await Tone.start();
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current.dispose();
        playerRef.current = null;
      }
      const player = new Tone.Player({
        url: SOUND_URL,
        loop: true,
        autostart: true,
        volume: 0
      }).toDestination();
      await player.load();
      playerRef.current = player;
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Daily Soundscape</h1>
      <button style={{ marginTop: "1rem" }} onClick={playSound}>
        Play Sound
      </button>
    </div>
  );
}

export default App;
