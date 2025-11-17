import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as Tone from "tone";
import studyService from "../services/studyService";
import { useAuth } from "../AuthContext";

//Objects for each survey question
// Questions is the test displayed to the user, options is an array of possible answers,
// and key sets where the answer is stored in the state dictionary
const QUESTION_AVAILABILITY = {
  weather: 1,
  place: 1,
  day_rating: 2,
  mood: 2,
  tempo: 3,
  pitch: 4,
  volume_control: 5,
  social_people: 6,
  social: 6,
};

const ALL_QUESTIONS = [
  {
    question: "What was the weather like?",
    options: ["Sunny", "Foggy/Cloudy", "Windy", "Raining", "Snowing/Hailing"],
    key: "weather",
  },
  {
    question: "Where did you spend a significant portion of your day?",
    options: ["Water", "Forest", "Plains", "City/Suburb", "Home"],
    key: "place",
  },
  {
    question: "Did you spend time with anyone today?  If so, pick the person you had the most significant interactions with.",
    options: ["Myself", "Family", "Friends", "Pets", "Coworkers", "Strangers"],
    key: "social_people",
  },
  {
    question: "Capture the sound of your social interactions.",
    key: "social",
    isSocialAudio: true,
  },
  {
    question: "Rate how your day went on a scale of 1-5 (with 1 being the worst and 5 being the best).",
    options: ["1", "2", "3", "4", "5"],
    key: "day_rating",
  },
  {
    question: "Pick a sound that best represents your mood today.",
    options: ["Happy", "Calm", "Bored", "Sad", "Stressed", "Angry"],
    key: "mood",
  },
  {
    question: "How fast did your day go by?",
    key: "tempo",
    isTempo: true,
  },
  {
    question: "How much of your day was spent on necessary tasks and how much of your day was spent on nonessential activities?",
    key: "pitch",
    isPitch: true,
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
  { bored: "/sounds/531853__sondredrakensson__do-robots-get-bored-2.mp3"},
  { sad: "/sounds/831758__akkaittou__sadatmosphericguitarsoundtrack2.wav"},
  { angry: "sounds/579268__nomiqbomi__angry-drone-1.mp3"}
];
const location_sounds = [
  { forest: "/sounds/forest_birds.wav" },
  { "city/suburb": "/sounds/traffic.wav" },
  { water: "/sounds/beach.wav" },
  { plains: "/sounds/525268__thesuprememuffinpooter__dry-grass-rustle.wav" },
  { home: "/sounds/799197__newlocknew__ambhome_kitchenthe-old-apartmentwall-clockventilation-noise.wav"}
];
const weather_sounds = [
  { raining: "/sounds/thunder.wav" },
  { windy: "/sounds/really_windy.wav" },
  { sunny: "/sounds/cicada-72075.mp3" },
  { "foggy/cloudy": "/sounds/Fog Rolling In.m4a" },
  { "snowing/hailing": "/sounds/snow-footstep-sfx-16100.mp3" },
];

function getIndexFromAnswer(list, answer) {
  return list.findIndex(
    (obj) => Object.keys(obj)[0].toLowerCase() === answer?.toLowerCase()
  );
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function Survey() {
  const { isAuthenticated, user } = useAuth();
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
    social_audio_data: "",
    social_audio_filename: "",
    social_audio_source: "",
    day_rating: "",
    mood: "",
    mood_volume: 0,
    mood_custom_url: "",
    tempo: 120,
    pitch: 50, // 0-100, where 0 = all nonessential, 100 = all necessary
  }); // Stores the users answer to each question
  const navigate = useNavigate(); // used to navigate to another page once the survey is complete
  
  // Study session state
  const [sessionId, setSessionId] = useState(null);
  const [studyDay, setStudyDay] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Track if the user has interacted with the tempo slider
  const [tempoTouched, setTempoTouched] = useState(false);
  // Track if the user has interacted with the pitch slider
  const [pitchTouched, setPitchTouched] = useState(false);

  // Refs to store currently playing Tone.GrainPlayer objects for each category
  const weatherPlayerRef = useRef(null);
  const placePlayerRef = useRef(null);
  const moodPlayerRef = useRef(null);
  const objectUrlsRef = useRef([]); // track created object URLs to revoke (only if discarded)
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState("");
  const [socialPreviewUrl, setSocialPreviewUrl] = useState("");

  // Initialize study session on component mount
  useEffect(() => {
    const initializeStudySession = async () => {
      // Check if user is authenticated
      if (!isAuthenticated) {
        console.error('User must be logged in to participate in the study');
        navigate('/login');
        return;
      }

      try {
        const currentStudyDay = studyService.getCurrentStudyDay();
        
        // Start a new session for the current day
        const sessionData = await studyService.startStudySession(currentStudyDay);
        setSessionId(sessionData.sessionId);
        setStudyDay(currentStudyDay);
      } catch (error) {
        console.error('Failed to initialize study session:', error);
        // If authentication error, redirect to login
        if (error.message && (error.message.includes('expired') || error.message.includes('invalid') || error.message.includes('token'))) {
          alert('Your session has expired. Please log in again.');
          navigate('/login');
          return;
        }
        // Continue with survey even if session creation fails (user can still complete survey)
      }
    };

    initializeStudySession();
  }, [isAuthenticated, navigate]);

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

  // Convert pitch value (0-100) to detune in cents (-600 to +600)
  // Detune uses cents, where 100 cents = 1 semitone
  function pitchToDetune(pitch) {
    // Map 0-100 to -6 to +6 semitones, then convert to cents
    // 0 (all necessary) = -6 semitones = -600 cents (lower pitch)
    // 50 (balanced) = 0 semitones = 0 cents (no change)
    // 100 (all nonessential) = +6 semitones = +600 cents (higher pitch)
    return ((pitch - 50) / 50) * 6 * 100;
  }

  // Play a sample sound for a given category and option
  async function playSample(category, option) {
    // Map category/option to sound URL
    let soundUrl = null;
    const detune = pitchToDetune(answers.pitch);
    const playbackRate = answers.tempo / 120;
    
    // Start Tone.js AudioContext after user interaction
    try {
      await Tone.start();
    } catch (error) {
      console.log("AudioContext already started or user interaction required");
    }
    
    // Wait for any existing buffers to load first
    await Tone.loaded();
    
    if (category === "weather") {
      const idx = getIndexFromAnswer(weather_sounds, option);
      if (idx !== -1) soundUrl = Object.values(weather_sounds[idx])[0];
      if (!soundUrl) return;
      stopAndDisposePlayer(weatherPlayerRef);
      const weatherPlayer = new Tone.GrainPlayer({ url: soundUrl, loop: true, detune: detune }).toDestination();
      weatherPlayer.playbackRate = playbackRate;
      weatherPlayerRef.current = weatherPlayer;
      Tone.Transport.start();
      weatherPlayer.sync().start(0);

    } else if (category === "place") {
      const idx = getIndexFromAnswer(location_sounds, option);
      if (idx !== -1) soundUrl = Object.values(location_sounds[idx])[0];
      if (!soundUrl) return;
      stopAndDisposePlayer(placePlayerRef);
      const placePlayer = new Tone.GrainPlayer({ url: soundUrl, loop: true, detune: detune }).toDestination();
      placePlayer.playbackRate = playbackRate;
      placePlayerRef.current = placePlayer;
      Tone.Transport.start();
      placePlayer.sync().start(0);

    } else if (category === "mood") {
      const idx = getIndexFromAnswer(mood_sounds, option);
      if (idx !== -1) soundUrl = Object.values(mood_sounds[idx])[0];
      if (!soundUrl) return;
      stopAndDisposePlayer(moodPlayerRef);
      const moodPlayer = new Tone.GrainPlayer({ url: soundUrl, loop: true, detune: detune }).toDestination();
      moodPlayer.playbackRate = playbackRate;
      moodPlayerRef.current = moodPlayer;
      Tone.Transport.start();
      moodPlayer.sync().start(0);
    }
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
      } catch (error) {
        console.log("AudioContext already started or user interaction required");
      }
      const detune = pitchToDetune(answers.pitch);
      const playbackRate = answers.tempo / 120;
      await Tone.loaded();
      const player = new Tone.GrainPlayer({ url, loop: true, detune: detune }).toDestination();
      player.playbackRate = playbackRate;
      playerRef.current = player;
      Tone.Transport.start();
      player.sync().start(0);
    }
  }

  // Updates the answers state when a user selects an option
  function handleSelect(option, currentQuestion) {
    if (!currentQuestion) return;
    const key = currentQuestion.key;
    setAnswers(prev => ({
      ...prev,
      [key]: option,
    }));
    // Play sample sound if this is a sound-linked question
    if (["weather", "place", "mood"].includes(key)) {
      playSample(key, option);
    }
  }

  // For tempo slider
  function handleTempoChange(value) {
    const newTempo = Number(value);
    setAnswers(prev => ({ ...prev, tempo: newTempo }));
    setTempoTouched(true);
    // Update playback rate for all players
    const playbackRate = newTempo / 120;
    if (weatherPlayerRef.current) weatherPlayerRef.current.playbackRate = playbackRate;
    if (moodPlayerRef.current) moodPlayerRef.current.playbackRate = playbackRate;
    if (placePlayerRef.current) placePlayerRef.current.playbackRate = playbackRate;
  }

  // For pitch slider
  function handlePitchChange(value) {
    const newPitch = Number(value);
    setAnswers(prev => ({ ...prev, pitch: newPitch }));
    setPitchTouched(true);
    // Update detune for all players
    const detune = pitchToDetune(newPitch);
    if (weatherPlayerRef.current) {
      weatherPlayerRef.current.detune.value = detune;
    }
    if (moodPlayerRef.current) {
      moodPlayerRef.current.detune.value = detune;
    }
    if (placePlayerRef.current) {
      placePlayerRef.current.detune.value = detune;
    }
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

  function updateSocialPreviewUrl(newUrl) {
    setSocialPreviewUrl(prev => {
      if (prev) {
        try {
          URL.revokeObjectURL(prev);
        } catch (e) {
          // ignore
        }
      }
      return newUrl;
    });
  }

  async function handleSocialBlob(blob, source, filename = "") {
    if (!blob) return;
    const previewUrl = URL.createObjectURL(blob);
    updateSocialPreviewUrl(previewUrl);
    try {
      const dataUrl = await blobToDataUrl(blob);
      setAnswers(prev => ({
        ...prev,
        social: source === "recorded" ? "Recorded Sound" : filename ? `Uploaded: ${filename}` : "Uploaded Sound",
        social_audio_data: dataUrl,
        social_audio_filename: filename,
        social_audio_source: source,
      }));
      setRecordingError("");
    } catch (err) {
      console.error("Failed to process audio blob:", err);
      setRecordingError("Failed to process audio. Please try again.");
      updateSocialPreviewUrl("");
    }
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordingError("Recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        recordedChunksRef.current = [];
        await handleSocialBlob(blob, "recorded", `social-recording-${Date.now()}.webm`);
      };
      mediaRecorder.start();
      mediaRecorderRef.current = { recorder: mediaRecorder, stream };
      setIsRecording(true);
      setRecordingError("");
    } catch (error) {
      console.error("Failed to start recording:", error);
      setRecordingError("Unable to access microphone. Please check permissions.");
    }
  }

  function stopRecording() {
    const current = mediaRecorderRef.current;
    if (!current) return;
    try {
      if (current.recorder.state !== "inactive") {
        current.recorder.stop();
      }
      current.stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error("Error stopping recorder:", error);
    } finally {
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }

  async function handleSocialUpload(file) {
    if (!file) return;
    try {
      await handleSocialBlob(file, "uploaded", file.name);
    } catch (error) {
      console.error("Failed to handle upload:", error);
      setRecordingError("Failed to load the selected file.");
    }
  }

  function resetSocialAudio() {
    if (isRecording) {
      stopRecording();
    }
    updateSocialPreviewUrl("");
    setAnswers(prev => ({
      ...prev,
      social: "",
      social_audio_data: "",
      social_audio_filename: "",
      social_audio_source: "",
    }));
  }

  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
      updateSocialPreviewUrl("");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Continue to next question or submit
  async function handleContinue(currentQuestion, totalSteps) {
    if (!currentQuestion) return;
    if (step < totalSteps - 1) {
      setStep(step + 1);
      setTempoTouched(false); // reset for next time tempo appears
      setPitchTouched(false); // reset for next time pitch appears
    } else {
      // Final step - save responses and navigate
      setIsSaving(true);
      
      try {
        // Stop and dispose all players before navigating away
        stopAndDisposePlayer(weatherPlayerRef);
        stopAndDisposePlayer(placePlayerRef);
        stopAndDisposePlayer(moodPlayerRef);
        // Stop Transport
        Tone.Transport.stop();
        
        // Save responses to backend if we have a session
        if (sessionId) {
          await studyService.saveSurveyResponses(sessionId, answers);
          console.log('Survey responses saved successfully');
        }
        
        // Increment study day for next time
        const nextDay = studyService.incrementStudyDay();
        console.log(`Study day incremented to: ${nextDay}`);
        
        // Go to soundscape page with answers
        navigate("/soundscape", { state: { ...answers } });
      } catch (error) {
        console.error('Failed to save survey responses:', error);
        // Still navigate to soundscape page even if save fails
        navigate("/soundscape", { state: { ...answers } });
      } finally {
        setIsSaving(false);
      }
    }
  }

  // Determine if Continue should be enabled
  const availableQuestions = useMemo(
    () =>
      ALL_QUESTIONS.filter(
        (question) => (QUESTION_AVAILABILITY[question.key] ?? 1) <= studyDay
      ),
    [studyDay]
  );
  const totalSteps = availableQuestions.length;
  const currentQuestion = availableQuestions[step] || availableQuestions[availableQuestions.length - 1];
  if (!currentQuestion) {
    return null;
  }

  const currentKey = currentQuestion.key;
  const isTempo = currentQuestion.isTempo;
  const isPitch = currentQuestion.isPitch;
  const isSocialAudio = currentQuestion.isSocialAudio;
  const isAnswered = isTempo
    ? tempoTouched
    : isPitch
      ? pitchTouched
      : isSocialAudio
        ? Boolean(answers.social_audio_data)
        : answers[currentKey] !== "";

  useEffect(() => {
    if (step > totalSteps - 1) {
      setStep(totalSteps > 0 ? totalSteps - 1 : 0);
    }
  }, [step, totalSteps]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Daily Soundscape Survey</h2>
      {user && (
        <div style={{ 
          marginBottom: "1rem", 
          padding: "0.5rem 1rem", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "4px",
          fontSize: "0.9rem",
          color: "#666"
        }}>
          Study Day {studyDay} of 9 - User: {user.username}
        </div>
      )}
      <div style={{ margin: "2rem 0" }}>
        <h3>{currentQuestion.question}</h3>
        {/* Render volume sliders for the final question */}
        {currentQuestion.isVolumeControl ? (
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
        ) : isPitch ? (
          <div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={answers.pitch}
              onChange={e => handlePitchChange(e.target.value)}
              style={{ width: "60%", margin: "2rem 0" }}
            />
            <div style={{ marginBottom: "1rem" }}>
              Necessary tasks: {100 - answers.pitch}% | Nonessential activities: {answers.pitch}%
            </div>
          </div>
        ) : isSocialAudio ? (
          <div>
            <div style={{ marginBottom: "1rem" }}>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                style={{
                  padding: "0.75rem 2rem",
                  fontSize: "1rem",
                  borderRadius: "6px",
                  border: "1px solid #007bff",
                  background: isRecording ? "#dc3545" : "#007bff",
                  color: "#fff",
                  cursor: "pointer",
                  width: "100%",
                  maxWidth: "320px"
                }}
              >
                {isRecording ? "Stop Recording" : "Record Sound"}
              </button>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>Or upload an audio file</div>
              <input
                type="file"
                accept="audio/*"
                onChange={e => handleSocialUpload(e.target.files?.[0])}
              />
            </div>
            {recordingError && (
              <div style={{ color: "#dc3545", marginBottom: "1rem" }}>{recordingError}</div>
            )}
            {socialPreviewUrl && (
              <div style={{ marginTop: "1rem" }}>
                <audio controls src={socialPreviewUrl} style={{ width: "100%", maxWidth: "400px" }} />
                <div style={{ marginTop: "0.5rem" }}>
                  <button
                    onClick={resetSocialAudio}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      border: "1px solid #6c757d",
                      background: "#f8f9fa",
                      cursor: "pointer"
                    }}
                  >
                    Remove Sound
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {currentQuestion.options.map(option => (
              <button
                key={option}
                onClick={() => handleSelect(option, currentQuestion)}
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
          onClick={() => handleContinue(currentQuestion, totalSteps)}
          disabled={!isAnswered || isSaving}
          style={{
            marginTop: "2rem",
            padding: "0.75rem 2rem",
            fontSize: "1.1rem",
            borderRadius: "6px",
            border: "1px solid #007bff",
            background: (isAnswered && !isSaving) ? "#007bff" : "#e0e0e0",
            color: (isAnswered && !isSaving) ? "#fff" : "#888",
            cursor: (isAnswered && !isSaving) ? "pointer" : "not-allowed"
          }}
        >
          {isSaving ? "Saving..." : (step < totalSteps - 1 ? "Continue" : "Finish")}
        </button>
      </div>
      <div>Step {Math.min(step + 1, totalSteps)} of {totalSteps}</div> {/* Current step out of total steps */}
    </div>
  );
}

export default Survey; 