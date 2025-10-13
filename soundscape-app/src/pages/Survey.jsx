import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as Tone from "tone";

//Objects for each survey question
// Questions is the test displayed to the user, options is an array of possible answers,
// and key sets where the answer is stored in the state dictionary
const questions = [
  {
    question: "What was the weather like?",
    options: ["Raining", "Windy", "Sunny"],
    key: "weather",
  },
  {
    question: "Where did you spend a significant portion of your day?",
    options: ["Forest", "City", "Beach"],
    key: "place",
  },
  {
    question: "Did you spend time with anyone today?  If so, pick the person you had the most significant interactions with.",
    options: ["Myself", "Family", "Friends", "Pets", "Coworkers", "Strangers"],
    key: "social_people",
  },
  {
    question: "What did your social interactions sound like? [CURRENTLY NO SOUNDS]",
    options: ["Hum", "Bark", "Laughter", "Murmur", "Yelling", "Singing"],
    key: "social",
  },
  {
    question: "Rate how your day went on a scale of 1-5 (with 1 being the worst and 5 being the best).",
    options: ["1", "2", "3", "4", "5"],
    key: "day_rating",
  },
  {
    question: "Pick a sound that best represents your mood today.",
    options: ["Calm", "Stressed", "Happy"],
    key: "mood",
  },
  {
    question: "How fast did your day go by?",
    options: ["Slow", "Normal", "Fast"],
    key: "tempo",
    isTempo: true,
  },
  {
    question: "Adjust the volume of each element based on how aware you were of each.",
    key: "volume_control",
    isVolumeControl: true,
  },
];

// Sound mappings (copied from SoundscapePage.jsx)
const mood_sounds = [
  { calm: "/sounds/calm_pad.wav" },
  { stressed: "/sounds/stress.wav" },
  { happy: "/sounds/768286__lolamoore__happy.mp3" },
];
const location_sounds = [
  { forest: "/sounds/forest_birds.wav" },
  { city: "/sounds/traffic.wav" },
  { beach: "/sounds/beach.wav" },
];
const weather_sounds = [
  { raining: "/sounds/thunder.wav" },
  { windy: "/sounds/really_windy.wav" },
  { sunny: "/sounds/sun_rays.mp3" },
];
function getIndexFromAnswer(list, answer) {
  return list.findIndex(
    (obj) => Object.keys(obj)[0].toLowerCase() === answer?.toLowerCase()
  );
}

function Survey() {
  const [step, setStep] = useState(0); // tracks the question the user is on starting at 0
  const [answers, setAnswers] = useState({
    weather: "",
    weather_volume: 0,
    weather_custom_url: "",
    place: "",
    place_volume: 0, // fixed typo here
    place_custom_url: "",
    social_people : "",
    social: "",
    day_rating: "",
    mood: "",
    mood_volume: 0,
    mood_custom_url: "",
    tempo: 120,
  }); // Stores the users answer to each question
  const navigate = useNavigate(); // used to navigate to another page once the survey is complete

  // Track if the user has interacted with the tempo slider
  const [tempoTouched, setTempoTouched] = useState(false);

  // Refs to store currently playing Tone.Player objects for each category
  const weatherPlayerRef = useRef(null);
  const placePlayerRef = useRef(null);
  const moodPlayerRef = useRef(null);
  const objectUrlsRef = useRef([]); // track created object URLs to revoke (only if discarded)

  // Helper to stop and dispose the current player
  function stopAndDisposePlayer(playerRef) {
    if (playerRef.current) {
      try {
        playerRef.current.stop();
        playerRef.current.dispose();
      } catch (e) {
        // Ignore errors
      }
      playerRef.current = null;
    }
  }

  // Note: We no longer revoke URLs on submit because SoundscapePage needs them.
  // We'll only revoke URLs if the user changes their selection within the survey.

  // Play a sample sound for a given category and option
  async function playSample(category, option) {
    // Map category/option to sound URL
    let soundUrl = null;
    if (category === "weather") {
      const idx = getIndexFromAnswer(weather_sounds, option);
      if (idx !== -1) soundUrl = Object.values(weather_sounds[idx])[0];
      stopAndDisposePlayer(weatherPlayerRef);
      const weatherPlayer = new Tone.Player({ url: soundUrl, loop: true }).toDestination();
      weatherPlayerRef.current = weatherPlayer;
      weatherPlayer.autostart = true;

    } else if (category === "place") {
      const idx = getIndexFromAnswer(location_sounds, option);
      if (idx !== -1) soundUrl = Object.values(location_sounds[idx])[0];
      stopAndDisposePlayer(placePlayerRef);
      const placePlayer = new Tone.Player({ url: soundUrl, loop: true }).toDestination();
      placePlayerRef.current = placePlayer;
      placePlayer.autostart = true;

    } else if (category === "mood") {
      const idx = getIndexFromAnswer(mood_sounds, option);
      if (idx !== -1) soundUrl = Object.values(mood_sounds[idx])[0];
      stopAndDisposePlayer(moodPlayerRef);
      const moodPlayer = new Tone.Player({ url: soundUrl, loop: true }).toDestination();
      moodPlayerRef.current = moodPlayer;
      moodPlayer.autostart = true;
    }
    if (!soundUrl) return;

    /*
    stopAndDisposePlayer();
    try {
      //await Tone.start();
      //await Tone.loaded();
      const player = new Tone.Player({ url: soundUrl, loop: true }).toDestination();
      playerRef.current = player;
      player.autostart = true;
    } catch (e) {
      console.error("Error playing sample sound:", e);
    }
      */
  }

  // Handle local file upload for a category and autoplay it
  async function handleUpload(category, file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    // Update answers to mark as answered and store custom URL
    setAnswers(prev => ({
      ...prev,
      [category]: "Uploaded",
      [`${category}_custom_url`]: url,
    }));

    // Stop existing player and create a new one that autostarts
    let playerRef = null;
    if (category === "weather") playerRef = weatherPlayerRef;
    if (category === "place") playerRef = placePlayerRef;
    if (category === "mood") playerRef = moodPlayerRef;
    if (playerRef) {
      stopAndDisposePlayer(playerRef);
      try {
        await Tone.start();
      } catch (_) {}
      const player = new Tone.Player({ url, loop: true }).toDestination();
      player.autostart = true;
      playerRef.current = player;
    }
  }

  // Updates the answers state when a user selects an option
  function handleSelect(option) {
    const key = questions[step].key;
    setAnswers(prev => ({
      ...prev,
      [key]: questions[step].isTempo
        ? option === "Slow" ? 80 : option === "Normal" ? 120 : 160
        : option,
    }));
    // Play sample sound if this is a sound-linked question
    if (["weather", "place", "mood"].includes(key)) {
      playSample(key, option);
    }
  }

  // For tempo slider
  function handleTempoChange(value) {
    setAnswers(prev => ({ ...prev, tempo: Number(value) }));
    setTempoTouched(true);
    let playbackRate = answers.tempo / 120;
    weatherPlayerRef.current.playbackRate = playbackRate;
    moodPlayerRef.current.playbackRate = playbackRate;
    placePlayerRef.current.playBackRate = playbackRate;
  }

  // Handler for volume slider changes
  function handleVolumeChange(category, value) {
    const vol = Number(value);
    setAnswers(prev => ({
      ...prev,
      [`${category}_volume`]: vol,
    }));
    // Set Tone.Player volume (in dB, range -60 to 0)
    let playerRef = null;
    if (category === "weather") playerRef = weatherPlayerRef;
    if (category === "place") playerRef = placePlayerRef;
    if (category === "mood") playerRef = moodPlayerRef;
    if (playerRef && playerRef.current) {
      playerRef.current.volume.value = vol;
    }
  }

  // Continue to next question or submit
  function handleContinue() {
    const key = questions[step].key;
    if (step < questions.length - 1) {
      setStep(step + 1);
      setTempoTouched(false); // reset for next time tempo appears
    } else {
      // Stop and dispose all players before navigating away
      stopAndDisposePlayer(weatherPlayerRef);
      stopAndDisposePlayer(placePlayerRef);
      stopAndDisposePlayer(moodPlayerRef);
      // Go to soundscape page with answers
      navigate("/soundscape", { state: { ...answers } });
    }
  }

  // Determine if Continue should be enabled
  const currentKey = questions[step].key;
  const isTempo = questions[step].isTempo;
  const isAnswered = isTempo ? tempoTouched : answers[currentKey] !== "";

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Daily Soundscape Survey</h2> 
      <div style={{ margin: "2rem 0" }}>
        <h3>{questions[step].question}</h3>
        {/* Render volume sliders for the final question */}
        {questions[step].isVolumeControl ? (
          <div>
            <div style={{ margin: "1.5rem 0" }}>
              <label>
                Weather Volume: {answers.weather_volume}
                <input
                  type="range"
                  min={-20}
                  max={20}
                  step={1}
                  value={answers.weather_volume}
                  onChange={e => handleVolumeChange("weather", e.target.value)}
                  style={{ width: "60%", marginLeft: "1rem" }}
                />
              </label>
            </div>
            <div style={{ margin: "1.5rem 0" }}>
              <label>
                Place Volume: {answers.place_volume}
                <input
                  type="range"
                  min={-20}
                  max={20}
                  step={1}
                  value={answers.place_volume}
                  onChange={e => handleVolumeChange("place", e.target.value)}
                  style={{ width: "60%", marginLeft: "1rem" }}
                />
              </label>
            </div>
            <div style={{ margin: "1.5rem 0" }}>
              <label>
                Mood Volume: {answers.mood_volume}
                <input
                  type="range"
                  min={-20}
                  max={20}
                  step={1}
                  value={answers.mood_volume}
                  onChange={e => handleVolumeChange("mood", e.target.value)}
                  style={{ width: "60%", marginLeft: "1rem" }}
                />
              </label>
            </div>
          </div>
        ) : isTempo ? (
          <div>
            <input
              type="range"
              min={80}
              max={160}
              step={1}
              value={answers.tempo}
              onChange={e => handleTempoChange(e.target.value)}
              style={{ width: "60%", margin: "2rem 0" }}
            />
            <div style={{ marginBottom: "1rem" }}>Tempo: {answers.tempo} BPM</div>
          </div>
        ) : (
          <div>
            {questions[step].options.map(option => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                style={{
                  display: "block",
                  margin: "1rem auto",
                  padding: "0.75rem 2rem",
                  fontSize: "1.1rem",
                  borderRadius: "6px",
                  border: answers[currentKey] === option ? "2px solid #007bff" : "1px solid #007bff",
                  background: answers[currentKey] === option ? "#e3f0ff" : "#f8f9fa",
                  cursor: "pointer",
                  fontWeight: answers[currentKey] === option ? "bold" : "normal"
                }}
              >
                {option}
              </button>
            ))}

            {/* Upload alternative for sound-linked questions */}
            {(["weather", "place", "mood"].includes(currentKey)) && (
              <div style={{ marginTop: "1.5rem" }}>
                <div style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>Or upload your own sound</div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={e => handleUpload(currentKey, e.target.files?.[0])}
                />
                {answers[`${currentKey}_custom_url`] && (
                  <div style={{ marginTop: "0.5rem", color: "#28a745" }}>
                    Custom sound selected.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleContinue}
          disabled={!isAnswered}
          style={{
            marginTop: "2rem",
            padding: "0.75rem 2rem",
            fontSize: "1.1rem",
            borderRadius: "6px",
            border: "1px solid #007bff",
            background: isAnswered ? "#007bff" : "#e0e0e0",
            color: isAnswered ? "#fff" : "#888",
            cursor: isAnswered ? "pointer" : "not-allowed"
          }}
        >
          {step < questions.length - 1 ? "Continue" : "Finish"}
        </button>
      </div>
      <div>Step {step + 1} of {questions.length}</div> {/* Current step out of total steps */}
    </div>
  );
}

export default Survey; 