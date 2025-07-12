import React, { useState } from "react";
import * as Tone from "tone"; // Javascript library used to create and play audio in web browsers

// Stores the names and urls for the sounds
const mood_sounds = [{calm : "/sounds/calm_pad.wav"}, {stressed : "/sounds/stress.wav"}]
const location_sounds = [{forest : "/sounds/forest_birds.wav"}, {city : "/sounds/traffic.wav"}]
const weather_sounds = [{raining : "/sounds/thunder.wav"}, {windy : "/sounds/really_windy.wav"}]

// Main component for the soundscape page
function SoundscapePage() {
  // State for each sound selection
  const [moodIndex, setMoodIndex] = useState(0);
  const [locationIndex, setLocationIndex] = useState(0);
  const [weatherIndex, setWeatherIndex] = useState(0);

  // State that stores the current player objects
  const [players, setPlayers] = useState(null)

  // State for whether the sounds are playing
  const [neverPlayed, setNeverPlayed] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Creates a button that pauses or plays the created soundscapes once clicked.
  // Only works if SoundButton has been pressed once
  function PlayButton() {
    function playButtonClick() {
      if (isPlaying) {
        Tone.Transport.pause();
        setIsPlaying(false);

      } else {
        Tone.Transport.start();
        setIsPlaying(true);
      }
    }

    return (
    <button style={{ marginTop: "1rem" }} onClick={playButtonClick}>
      {isPlaying ? "Pause" : "Play"}
    </button>
    )
  }

  // Determines how the sounds are played
  // 3 sounds, looped, and played simultaneously
  const playSound = async () => {
    try {
      // Start Tone.js context first!

      
      // Resets any Tone.Player objects
      if (players != null) {
        players.forEach(player => player.stop().dispose());
      }

      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      

      // Get selected sound URLs
      const moodSound = Object.values(mood_sounds[moodIndex])[0];
      const locationSound = Object.values(location_sounds[locationIndex])[0];
      const weatherSound = Object.values(weather_sounds[weatherIndex])[0];

      // Creates Player objects for each sound
      const moodPlayer = new Tone.Player({ url: moodSound, loop: true }).toDestination().sync().start(0);
      const locationPlayer = new Tone.Player({ url: locationSound, loop: true }).toDestination().sync().start(0);
      const weatherPlayer = new Tone.Player({ url: weatherSound, loop: true }).toDestination().sync().start(0);

      // Sets the current start time for the sounds (based on when the user clicks the "Daily Soundscape" button with an added delay)
      setPlayers([moodPlayer, locationPlayer, weatherPlayer]);
      setNeverPlayed(false);
      setIsPlaying(true);


      await Tone.start();
      await Tone.loaded();

      Tone.Transport.start();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Main UI for the soundscape page
  // The button triggers the playSound function
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Create Daily Soundscape</h1>
      <button style={{ marginTop: "1rem" }} onClick={playSound}>
        Create Sound
      </button>
      <SoundButton sound_list={mood_sounds} selectedIndex={moodIndex} setSelectedIndex={setMoodIndex} />
      <SoundButton sound_list={location_sounds} selectedIndex={locationIndex} setSelectedIndex={setLocationIndex} />
      <SoundButton sound_list={weather_sounds} selectedIndex={weatherIndex} setSelectedIndex={setWeatherIndex} />
      {!(neverPlayed) && <PlayButton />}
    </div>
  );
}

export default SoundscapePage; 