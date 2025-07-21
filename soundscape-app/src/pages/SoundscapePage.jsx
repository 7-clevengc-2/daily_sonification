import React, { useState, useEffect } from "react";
import * as Tone from "tone";
import { useLocation } from "react-router-dom";

// Stores the names and urls for the sounds (some current sounds are duplicates so I can test functionality with limited audio files)
const mood_sounds = [{calm : "/sounds/calm_pad.wav"}, {stressed : "/sounds/stress.wav"}, {happy: "/sounds/calm_pad.wav"}]; 
const location_sounds = [{forest : "/sounds/forest_birds.wav"}, {city : "/sounds/traffic.wav"}, {beach: "/sounds/forest_birds.wav"}];
const weather_sounds = [{raining : "/sounds/thunder.wav"}, {windy : "/sounds/really_windy.wav"}, {sunny: "/sounds/thunder.wav"}];

function getIndexFromAnswer(list, answer) {
  return list.findIndex(obj => Object.keys(obj)[0].toLowerCase() === answer?.toLowerCase());
}

function SoundscapePage() {
  const location = useLocation();
  const survey = location.state;

  // State for each sound selection
  const [moodIndex, setMoodIndex] = useState(0);
  const [locationIndex, setLocationIndex] = useState(0);
  const [weatherIndex, setWeatherIndex] = useState(0);

  // State for tempo (BPM)
  const ORIGINAL_BPM = 120;
  const [tempo, setTempo] = useState(ORIGINAL_BPM); // Default BPM

  // State that stores the current player objects
  const [players, setPlayers] = useState(null)

  // State for whether the sounds are playing
  const [neverPlayed, setNeverPlayed] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // On mount, if survey answers exist, set indices and tempo, and auto-play
  useEffect(() => {
    if (survey) {
      const moodIdx = getIndexFromAnswer(mood_sounds, survey.mood);
      const locIdx = getIndexFromAnswer(location_sounds, survey.place);
      const weatherIdx = getIndexFromAnswer(weather_sounds, survey.weather);
      setMoodIndex(moodIdx >= 0 ? moodIdx : 0);
      setLocationIndex(locIdx >= 0 ? locIdx : 0);
      setWeatherIndex(weatherIdx >= 0 ? weatherIdx : 0);
      setTempo(survey.tempo || ORIGINAL_BPM);
      setTimeout(() => playSound(moodIdx, locIdx, weatherIdx, survey.tempo || ORIGINAL_BPM), 500);
    }
    // eslint-disable-next-line
  }, []);

  // Ensure Tone.Transport.bpm is always in sync with tempo and update playbackRate of players
  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
    if (players) {
      const playbackRate = tempo / ORIGINAL_BPM;
      players.forEach(player => {
        player.playbackRate = playbackRate;
      });
    }
  }, [tempo]);

  // Play soundscape, optionally with provided indices/tempo
  const playSound = async (
    moodIdx = moodIndex,
    locIdx = locationIndex,
    weatherIdx = weatherIndex,
    bpm = tempo
  ) => {
    try {
      if (players != null) {
        players.forEach(player => player.stop().dispose());
      }
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      const moodSound = Object.values(mood_sounds[moodIdx])[0];
      const locationSound = Object.values(location_sounds[locIdx])[0];
      const weatherSound = Object.values(weather_sounds[weatherIdx])[0];
      const playbackRate = bpm / ORIGINAL_BPM;
      const moodPlayer = new Tone.Player({ url: moodSound, loop: true }).toDestination().sync().start(0);
      moodPlayer.playbackRate = playbackRate;
      const locationPlayer = new Tone.Player({ url: locationSound, loop: true }).toDestination().sync().start(0);
      locationPlayer.playbackRate = playbackRate;
      const weatherPlayer = new Tone.Player({ url: weatherSound, loop: true }).toDestination().sync().start(0);
      weatherPlayer.playbackRate = playbackRate;
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

  // Creates buttons that cycle through sounds in specified categories when pressed (mood, location, weather)
  function SoundButton({ sound_list, selectedIndex, setSelectedIndex }) {
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

  // Main UI for the soundscape page
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Your Daily Soundscape</h1>
      {survey ? (
        <div style={{ margin: "2rem 0" }}>
          <div><b>Weather:</b> {survey.weather}</div>
          <div><b>Place:</b> {survey.place}</div>
          <div><b>Social:</b> {survey.social}</div>
          <div><b>Mood:</b> {survey.mood}</div>
          <div><b>Tempo:</b> {survey.tempo} BPM</div>
          <div style={{ marginTop: "2rem" }}>
            <PlayButton />
          </div>
        </div>
      ) : (
        <>
          <div style={{ margin: "2rem 0" }}>
            <label htmlFor="tempo-slider">Tempo: {tempo} BPM</label>
            <input
              id="tempo-slider"
              type="range"
              min="60"
              max="200"
              value={tempo}
              onChange={e => setTempo(Number(e.target.value))}
              style={{ width: "300px", marginLeft: "1rem" }}
            />
          </div>
          <button style={{ marginTop: "1rem" }} onClick={() => playSound()}>
            Create Sound
          </button>
          <SoundButton sound_list={mood_sounds} selectedIndex={moodIndex} setSelectedIndex={setMoodIndex} />
          <SoundButton sound_list={location_sounds} selectedIndex={locationIndex} setSelectedIndex={setLocationIndex} />
          <SoundButton sound_list={weather_sounds} selectedIndex={weatherIndex} setSelectedIndex={setWeatherIndex} />
          {!(neverPlayed) && <PlayButton />}
        </>
      )}
    </div>
  );
}

export default SoundscapePage; 