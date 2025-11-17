import React, { useState, useEffect } from "react";
import * as Tone from "tone";
import { useLocation } from "react-router-dom";

// Stores the names and urls for the sounds (some current sounds are duplicates so I can test functionality with limited audio files)
const mood_sounds = [
  { calm: "/sounds/calm_pad.wav" },
  { stressed: "/sounds/stress.wav" },
  { happy: "/sounds/768286__lolamoore__happy.mp3" },
  { bored: "/sounds/531853__sondredrakensson__do-robots-get-bored-2.mp3"},
  { sad: "/sounds/831758__akkaittou__sadatmosphericguitarsoundtrack2.wav"},
  { angry: "sounds/579268__nomiqbomi__angry-drone-1.mp3"}
]; 

const location_sounds = [
  { forest: "/sounds/forest_birds.wav" }, 
  { "city/suburb": "/sounds/traffic.wav" }, 
  { water: "/sounds/beach.wav" }, 
  { plains: "/sounds/525268__thesuprememuffinpooter__dry-grass-rustle.wav" },
  { home: "/sounds/799197__newlocknew__ambhome_kitchenthe-old-apartmentwall-clockventilation-noise.wav" }];

const weather_sounds = [
  { raining: "/sounds/thunder.wav" }, 
  { windy: "/sounds/really_windy.wav" }, 
  { sunny: "/sounds/cicada-72075.mp3" }, 
  { "foggy/cloudy": "/sounds/Fog Rolling In.m4a" }, 
  { "snowing/hailing": "/sounds/snow-footstep-sfx-16100.mp3" }];

function getIndexFromAnswer(list, answer) {
  return list.findIndex(obj => Object.keys(obj)[0].toLowerCase() === answer?.toLowerCase());
}

// Convert pitch value (0-100) to detune in cents (-600 to +600)
// Detune uses cents, where 100 cents = 1 semitone
function pitchToDetune(pitch) {
  // Map 0-100 to -6 to +6 semitones, then convert to cents
  // 0 (all necessary) = -6 semitones = -600 cents (lower pitch)
  // 50 (balanced) = 0 semitones = 0 cents (no change)
  // 100 (all nonessential) = +6 semitones = +600 cents (higher pitch)
  return ((pitch - 50) / 50) * 6 * 100;
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
  const [blobUrls, setBlobUrls] = useState([]);

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
      // Revoke any previous blob URLs we created
      blobUrls.forEach(url => { try { URL.revokeObjectURL(url); } catch (_) {} });
      setBlobUrls([]);
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      const safeMoodIdx = moodIdx >= 0 && moodIdx < mood_sounds.length ? moodIdx : 0;
      const safeLocIdx = locIdx >= 0 && locIdx < location_sounds.length ? locIdx : 0;
      const safeWeatherIdx = weatherIdx >= 0 && weatherIdx < weather_sounds.length ? weatherIdx : 0;

      const hasSurveyMood = Boolean(survey?.mood_custom_url || survey?.mood);
      const hasSurveyPlace = Boolean(survey?.place_custom_url || survey?.place);
      const hasSurveyWeather = Boolean(survey?.weather_custom_url || survey?.weather);

      const moodSound = survey
        ? (hasSurveyMood ? (survey.mood_custom_url || Object.values(mood_sounds[safeMoodIdx])[0]) : null)
        : Object.values(mood_sounds[safeMoodIdx])[0];
      const locationSound = survey
        ? (hasSurveyPlace ? (survey.place_custom_url || Object.values(location_sounds[safeLocIdx])[0]) : null)
        : Object.values(location_sounds[safeLocIdx])[0];
      const weatherSound = survey
        ? (hasSurveyWeather ? (survey.weather_custom_url || Object.values(weather_sounds[safeWeatherIdx])[0]) : null)
        : Object.values(weather_sounds[safeWeatherIdx])[0];

      if (!locationSound && !weatherSound && !moodSound) {
        throw new Error("No sound sources available to play.");
      }
      const playbackRate = bpm / ORIGINAL_BPM;
      // Get volume values from survey (default to 0 if not set)
      const moodVolume = survey?.mood_volume ?? 0;
      const placeVolume = survey?.place_volume ?? 0;
      const weatherVolume = survey?.weather_volume ?? 0;
      // Get pitch from survey (default to 50 for balanced)
      const pitch = survey?.pitch ?? 50;
      const detune = pitchToDetune(pitch);
      await Tone.start();
      await Tone.loaded();
      const createdPlayers = [];
      if (moodSound) {
        const moodPlayer = new Tone.GrainPlayer({ url: moodSound, loop: true, detune: detune }).toDestination();
        moodPlayer.playbackRate = playbackRate;
        moodPlayer.volume.value = moodVolume;
        moodPlayer.sync().start(0);
        createdPlayers.push(moodPlayer);
      }
      if (locationSound) {
        const locationPlayer = new Tone.GrainPlayer({ url: locationSound, loop: true, detune: detune }).toDestination();
        locationPlayer.playbackRate = playbackRate;
        locationPlayer.volume.value = placeVolume;
        locationPlayer.sync().start(0);
        createdPlayers.push(locationPlayer);
      }
      if (weatherSound) {
        const weatherPlayer = new Tone.GrainPlayer({ url: weatherSound, loop: true, detune: detune }).toDestination();
        weatherPlayer.playbackRate = playbackRate;
        weatherPlayer.volume.value = weatherVolume;
        weatherPlayer.sync().start(0);
        createdPlayers.push(weatherPlayer);
      }

      setPlayers(createdPlayers);
      setNeverPlayed(false);
      setIsPlaying(true);
      Tone.Transport.start();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // On unmount, revoke any blob URLs tracked here and dispose players
  useEffect(() => {
    return () => {
      if (players) {
        try { players.forEach(p => p.stop().dispose()); } catch (_) {}
      }
      blobUrls.forEach(url => { try { URL.revokeObjectURL(url); } catch (_) {} });
    };
  }, [players, blobUrls]);

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
      <button className="btn btn-secondary" onClick={soundButtonClick}>
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
      <button 
        className={`btn ${isPlaying ? 'btn-outline' : 'btn-primary'}`}
        onClick={playButtonClick}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    )
  }

  // Main UI for the soundscape page
  return (
    <div className="container" style={{ paddingTop: "var(--spacing-xl)", paddingBottom: "var(--spacing-xl)" }}>
      <div className="text-center animate-fade-in">
        <h1 style={{ marginBottom: "var(--spacing-xl)" }}>Your Daily Soundscape</h1>
        
        {survey ? (
          <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className="card-header">
              <h2>Survey Results</h2>
            </div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--spacing-md)", marginBottom: "var(--spacing-lg)" }}>
                <div className="form-group">
                  <div className="form-label">Weather</div>
                  <div style={{ padding: "var(--spacing-sm)", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-md)" }}>
                    {survey.weather}
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-label">Place</div>
                  <div style={{ padding: "var(--spacing-sm)", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-md)" }}>
                    {survey.place}
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-label">Social</div>
                  <div style={{ padding: "var(--spacing-sm)", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-md)" }}>
                    {survey.social}
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-label">Mood</div>
                  <div style={{ padding: "var(--spacing-sm)", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-md)" }}>
                    {survey.mood}
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-label">Tempo</div>
                  <div style={{ padding: "var(--spacing-sm)", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-md)" }}>
                    {survey.tempo} BPM
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-label">Pitch (Necessary vs Nonessential)</div>
                  <div style={{ padding: "var(--spacing-sm)", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-md)" }}>
                    Necessary: {100 - (survey.pitch ?? 50)}% | Nonessential: {survey.pitch ?? 50}%
                  </div>
                </div>
              </div>
              <PlayButton />
            </div>
          </div>
        ) : (
          <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="tempo-slider" className="form-label">Tempo: {tempo} BPM</label>
                <input
                  id="tempo-slider"
                  type="range"
                  min="60"
                  max="200"
                  value={tempo}
                  onChange={e => setTempo(Number(e.target.value))}
                  className="form-input"
                  style={{ width: "100%", maxWidth: "400px" }}
                />
              </div>
              
              <div style={{ display: "flex", gap: "var(--spacing-md)", flexWrap: "wrap", justifyContent: "center", marginBottom: "var(--spacing-lg)" }}>
                <button className="btn btn-primary" onClick={() => playSound()}>
                  Create Sound
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "var(--spacing-md)", marginBottom: "var(--spacing-lg)" }}>
                <SoundButton sound_list={mood_sounds} selectedIndex={moodIndex} setSelectedIndex={setMoodIndex} />
                <SoundButton sound_list={location_sounds} selectedIndex={locationIndex} setSelectedIndex={setLocationIndex} />
                <SoundButton sound_list={weather_sounds} selectedIndex={weatherIndex} setSelectedIndex={setWeatherIndex} />
              </div>

              {!(neverPlayed) && <PlayButton />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SoundscapePage; 