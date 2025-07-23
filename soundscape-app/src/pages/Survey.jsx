import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    question: "Did you spend time with anyone today?  If so, pick the person you had the most significant interactions with",
    options: ["Myself", "Family", "Friends", "Pets", "Coworkers", "Strangers"],
    key: "social_people",
  },
  {
    question: "What did your social interactions sound like?",
    options: ["Hum", "Bark", "Laughter", "Serious Murmur", "Yelling", "Singing"],
    key: "social",
  },
  {
    question: "Rate how your day went on a scale of 1-5 (with 1 being the worst and 5 being the best",
    options: ["1", "2", "3", "4", "5"],
    key: "day_rating",
  },
  {
    question: "Pick a sound that best represents your mood today",
    options: ["Calm", "Stressed", "Happy"],
    key: "mood",
  },
  {
    question: "How fast did your day go by?",
    options: ["Slow", "Normal", "Fast"],
    key: "tempo",
    isTempo: true,
  },
];

function Survey() {
  const [step, setStep] = useState(0); // tracks the question the user is on starting at 0
  const [answers, setAnswers] = useState({
    weather: "",
    place: "",
    social_people : "",
    social: "",
    day_rating: "",
    mood: "",
    tempo: 120,
  }); // Stores the users answer to each question
  const navigate = useNavigate(); // used to navigate to another page once the survey is complete

  // Track if the user has interacted with the tempo slider
  const [tempoTouched, setTempoTouched] = useState(false);

  // Updates the answers state when a user selects an option
  function handleSelect(option) {
    const key = questions[step].key;
    setAnswers(prev => ({
      ...prev,
      [key]: questions[step].isTempo
        ? option === "Slow" ? 80 : option === "Normal" ? 120 : 160
        : option,
    }));
  }

  // For tempo slider
  function handleTempoChange(value) {
    setAnswers(prev => ({ ...prev, tempo: Number(value) }));
    setTempoTouched(true);
  }

  // Continue to next question or submit
  function handleContinue() {
    const key = questions[step].key;
    if (step < questions.length - 1) {
      setStep(step + 1);
      setTempoTouched(false); // reset for next time tempo appears
    } else {
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
        {/* Render slider for tempo question, buttons for others */}
        {isTempo ? (
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
          questions[step].options.map(option => (
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
          ))
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