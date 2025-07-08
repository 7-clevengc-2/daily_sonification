import React, { useState } from "react";  //Javascript library used to build UI using components
import * as Tone from "tone"; // Javascript library used to create and play audio in web browsers

// Stores the names and urls for the sounds
const mood_sounds = [{calm : "/sounds/calm_pad.wav"}, {stressed : "/sounds/stress.wav"}]
const location_sounds = [{forest : "/sounds/forest_birds.wav"}, {city : "/sounds/traffic.wav"}]
const weather_sounds = [{raining : "/sounds/thunder.wav"}, {windy : "/sounds/really_windy.wav"}]





// Main component for the app
function App() {
  // State for each sound selection
  const [moodIndex, setMoodIndex] = useState(0);
  const [locationIndex, setLocationIndex] = useState(0);
  const [weatherIndex, setWeatherIndex] = useState(0);

  // Creates buttons that cycle through sounds in specified categories when pressed (mood, location, weather)
  function SoundButton({ sound_list, selectedIndex, setSelectedIndex }) {

    // Updates state when pressed
    function soundButtonClick() {
      if (selectedIndex === sound_list.length - 1) {
        setSelectedIndex(0);
      } else {
        setSelectedIndex(selectedIndex + 1);
      }
    }

    return (
      <button style={{ marginTop: "1rem" }} onClick={soundButtonClick}>
        {Object.keys(sound_list[selectedIndex])[0]}
      </button>
    );
  }

  // Determines how the sounds are played
  // 3 sounds, looped, and played simultaneously
  const playSound = async () => {
    try {

      // Get selected sound URLs
      const moodSound = Object.values(mood_sounds[moodIndex])[0];
      const locationSound = Object.values(location_sounds[locationIndex])[0];
      const weatherSound = Object.values(weather_sounds[weatherIndex])[0];

      // Creates Player objects for each sound
      const moodPlayer = new Tone.Player({ url: moodSound, loop: true }).toDestination();
      const locationPlayer = new Tone.Player({ url: locationSound, loop: true }).toDestination();
      const weatherPlayer = new Tone.Player({ url: weatherSound, loop: true }).toDestination();

      // Starts the Tone.js engine and waits for it to be ready
      await Tone.start();
      await Tone.loaded();

      // Sets the current start time for the sounds (based on when the user clicks the "Daily Soundscape" button with an added delay)
      const startTime = Tone.now() + 0.1;

      moodPlayer.start(startTime);
      locationPlayer.start(startTime);
      weatherPlayer.start(startTime);
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
      <SoundButton sound_list={mood_sounds} selectedIndex={moodIndex} setSelectedIndex={setMoodIndex} />
      <SoundButton sound_list={location_sounds} selectedIndex={locationIndex} setSelectedIndex={setLocationIndex} />
      <SoundButton sound_list={weather_sounds} selectedIndex={weatherIndex} setSelectedIndex={setWeatherIndex} />
    </div>
  );
}

// Specify the main component in the file
// Nested components can be added here
export default App;
