import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    question: "What's the weather like?",
    options: ["Raining", "Windy", "Sunny"],
    key: "weather",
  },
  {
    question: "Where are you?",
    options: ["Forest", "City", "Beach"],
    key: "place",
  },
  {
    question: "How social was your day?",
    options: ["Quiet", "Somewhat social", "Very social"],
    key: "social",
  },
  {
    question: "How do you feel?",
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
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    weather: "",
    place: "",
    social: "",
    mood: "",
    tempo: 120,
  });
  const navigate = useNavigate();

  function handleAnswer(option) {
    const key = questions[step].key;
    setAnswers(prev => ({
      ...prev,
      [key]: questions[step].isTempo
        ? option === "Slow" ? 80 : option === "Normal" ? 120 : 160
        : option,
    }));
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Go to soundscape page with answers
      navigate("/soundscape", { state: { ...answers, [key]: questions[step].isTempo
        ? option === "Slow" ? 80 : option === "Normal" ? 120 : 160
        : option } });
    }
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Daily Soundscape Survey</h2>
      <div style={{ margin: "2rem 0" }}>
        <h3>{questions[step].question}</h3>
        {questions[step].options.map(option => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            style={{
              display: "block",
              margin: "1rem auto",
              padding: "0.75rem 2rem",
              fontSize: "1.1rem",
              borderRadius: "6px",
              border: "1px solid #007bff",
              background: "#f8f9fa",
              cursor: "pointer"
            }}
          >
            {option}
          </button>
        ))}
      </div>
      <div>Step {step + 1} of {questions.length}</div>
    </div>
  );
}

export default Survey; 