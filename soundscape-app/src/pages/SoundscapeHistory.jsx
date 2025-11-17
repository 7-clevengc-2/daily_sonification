import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import studyService from "../services/studyService";

function formatDate(dateString) {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }
  return date.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SoundscapeHistory() {
  const navigate = useNavigate();
  const [soundscapes, setSoundscapes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const data = await studyService.getSoundscapes();
        if (!isMounted) return;
        setSoundscapes(data.soundscapes || []);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError(err.message || "Failed to load soundscape history.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const requiredKeys = ["place", "weather"];

  function hasResponseValue(entry, key) {
    const responses = entry.responses || {};
    return Boolean(responses[key]) || Boolean(responses[`${key}_custom_url`]);
  }

  function handleReplay(entry) {
    navigate("/soundscape", { 
      state: { 
        ...entry.responses,
        studyDay: entry.studyDay,
        recordedDate: entry.createdAt
      } 
    });
  }

  function canReplay(entry) {
    return requiredKeys.every((key) => hasResponseValue(entry, key));
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading your past soundscapes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "var(--error, #dc2626)" }}>{error}</p>
      </div>
    );
  }

  if (!soundscapes.length) {
    return (
      <div className="container" style={{ padding: "2rem", textAlign: "center" }}>
        <h2>No soundscapes yet</h2>
        <p>Complete the daily survey to create your first soundscape.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <div className="text-center" style={{ marginBottom: "2rem" }}>
        <h1>Your Sonification Library</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Revisit and replay soundscapes created from your past surveys.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {soundscapes.map((entry) => {
          const { responses } = entry;
          const playable = canReplay(entry);
          return (
            <div key={entry.sessionId} className="card">
              <div className="card-header">
                <div style={{ fontWeight: 600 }}>
                  {entry.studyDay ? `Study Day ${entry.studyDay}` : "Soundscape"}
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  {formatDate(entry.createdAt)}
                </div>
              </div>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {responses.social_audio_data && (
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Recorded Social Audio</div>
                    <audio
                      controls
                      src={responses.social_audio_data}
                      style={{ width: "100%" }}
                    />
                  </div>
                )}
                <button
                  className="btn btn-primary"
                  onClick={() => playable && handleReplay(entry)}
                  disabled={!playable}
                  style={{ opacity: playable ? 1 : 0.6 }}
                >
                  {playable ? "Replay" : "Missing survey data"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SoundscapeHistory;
