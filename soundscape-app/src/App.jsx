import React, { useRef } from "react";  //Javascript library used to build UI using components
import * as Tone from "tone"; // Javascript library used to create and play audio in web browsers


// Main component for the app
function App() {
  const playerRef = useRef(null);

  // Determines how the sounds are played
  // 3 sounds, looped, and played simultaneously
  const playSound = async () => {
    try {

      // Creates Player objects for each sound
      const calm = new Tone.Player({url: "/sounds/calm_pad.wav", loop: true}).toDestination();
      const forest = new Tone.Player({url: "/sounds/forest_birds.wav", loop: true}).toDestination();
      const thunder = new Tone.Player({url: "/sounds/thunder.wav", loop: true}).toDestination();

      // Starts the Tone.js engine and waits for it to be ready
      await Tone.start();
      await Tone.loaded();

      // Sets the current start time for the sounds (based on when the user clicks the button with an added delay)
      const startTime = Tone.now() + 0.1;

      calm.start(startTime);
      forest.start(startTime);
      thunder.start(startTime);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Main UI for the app
  // The button triggers the playSound function
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Daily Soundscape</h1>
      <button style={{ marginTop: "1rem" }} onClick={playSound}>
        Play Sound
      </button>
    </div>
  );
}

// Specify the main component in the file
// Nested components can be added here
export default App;
