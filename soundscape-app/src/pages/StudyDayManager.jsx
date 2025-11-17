import React, { useEffect, useState } from "react";
import studyService from "../services/studyService";

const MIN_DAY = 1;
const MAX_DAY = 9;

function clampDay(value) {
  if (Number.isNaN(value)) return MIN_DAY;
  return Math.min(Math.max(value, MIN_DAY), MAX_DAY);
}

function StudyDayManager() {
  const [currentDay, setCurrentDay] = useState(studyService.getCurrentStudyDay());
  const [inputDay, setInputDay] = useState(currentDay);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const storedDay = studyService.getCurrentStudyDay();
    setCurrentDay(storedDay);
    setInputDay(storedDay);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const numericDay = clampDay(Number(inputDay));
    studyService.setCurrentStudyDay(numericDay);
    setCurrentDay(numericDay);
    setInputDay(numericDay);
    setStatus({ type: "success", message: `Study day set to ${numericDay}.` });
  };

  const handleIncrement = () => {
    const nextDay = clampDay(currentDay + 1);
    studyService.setCurrentStudyDay(nextDay);
    setCurrentDay(nextDay);
    setInputDay(nextDay);
    setStatus({ type: "success", message: `Study day advanced to ${nextDay}.` });
  };

  const handleReset = () => {
    studyService.setCurrentStudyDay(MIN_DAY);
    setCurrentDay(MIN_DAY);
    setInputDay(MIN_DAY);
    setStatus({ type: "info", message: "Study day reset to Day 1." });
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <div className="card" style={{ maxWidth: "480px", margin: "0 auto" }}>
        <div className="card-body">
          <h2 className="card-title" style={{ marginBottom: "1rem" }}>
            Study Day Manager
          </h2>
          <p style={{ marginBottom: "1rem", color: "#666" }}>
            This page updates the locally stored study day used by the survey flow. It does not modify any server-side
            data or study session records.
          </p>

          <div style={{ marginBottom: "1.5rem" }}>
            <strong>Current Day:</strong> Day {currentDay} of {MAX_DAY}
          </div>

          <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Set study day (1-{MAX_DAY})
            </label>
            <input
              type="number"
              min={MIN_DAY}
              max={MAX_DAY}
              value={inputDay}
              onChange={(e) => setInputDay(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
            />
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              Save Day
            </button>
          </form>

          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
            <button type="button" className="btn btn-outline" onClick={handleIncrement} style={{ flex: 1 }}>
              Next Day
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleReset} style={{ flex: 1 }}>
              Reset to Day 1
            </button>
          </div>

          {status && (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "4px",
                backgroundColor: status.type === "success" ? "#e8f5e9" : "#e3f2fd",
                color: status.type === "success" ? "#1b5e20" : "#0d47a1",
                fontSize: "0.95rem",
              }}
            >
              {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudyDayManager;

