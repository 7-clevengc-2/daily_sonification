import React, { useState, useEffect, useMemo } from "react";
import {
  LEVEL_THRESHOLDS,
  MAX_LEVEL,
  getLevelForDay,
  getOverallProgress,
} from "../constants/levels.js";

const PARTICLE_COUNT = 24;

function createParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * 360 + (Math.random() * 30 - 15);
    const distance = 40 + Math.random() * 60;
    const size = 4 + Math.random() * 6;
    const duration = 0.6 + Math.random() * 0.6;
    const hue = Math.random() > 0.5 ? 45 + Math.random() * 30 : 180 + Math.random() * 40;
    return { angle, distance, size, duration, hue };
  });
}

export default function ProgressBar({ currentDay, previousDay, onAnimationComplete }) {
  const [fillPercent, setFillPercent] = useState(() =>
    previousDay != null ? getOverallProgress(previousDay) * 100 : getOverallProgress(currentDay) * 100
  );
  const [celebrating, setCelebrating] = useState(false);
  const [levelUpNumber, setLevelUpNumber] = useState(null);
  const particles = useMemo(createParticles, []);

  const currentLevel = getLevelForDay(currentDay);
  const previousLevel = previousDay != null ? getLevelForDay(previousDay) : currentLevel;
  const didLevelUp = previousDay != null && currentLevel > previousLevel;
  const targetPercent = getOverallProgress(currentDay) * 100;

  useEffect(() => {
    if (previousDay == null) return;

    const animDelay = setTimeout(() => {
      setFillPercent(targetPercent);
    }, 400);

    const celebrationDelay = didLevelUp
      ? setTimeout(() => {
          setLevelUpNumber(currentLevel);
          setCelebrating(true);
        }, 1400)
      : null;

    const cleanupDelay = didLevelUp
      ? setTimeout(() => {
          setCelebrating(false);
          setLevelUpNumber(null);
          onAnimationComplete?.();
        }, 4000)
      : setTimeout(() => {
          onAnimationComplete?.();
        }, 1400);

    return () => {
      clearTimeout(animDelay);
      if (celebrationDelay) clearTimeout(celebrationDelay);
      clearTimeout(cleanupDelay);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const maxDay = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  return (
    <div className="progress-bar-wrapper">
      <div className="progress-bar-container">
        {/* Level markers */}
        {LEVEL_THRESHOLDS.map((threshold, i) => {
          const pct = i === 0 ? 0 : ((threshold - 1) / (maxDay - 1)) * 100;
          const level = i + 1;
          const reached = currentDay >= threshold;
          return (
            <div
              key={level}
              className={`progress-level-marker ${reached ? "reached" : ""}`}
              style={{ left: `${pct}%` }}
            >
              <span className="progress-level-tick" />
              <span className="progress-level-label">{level}</span>
            </div>
          );
        })}

        {/* Track */}
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${fillPercent}%` }}
          />
        </div>

        {/* Celebration overlay */}
        {celebrating && (
          <div
            className="progress-celebration"
            style={{ left: `${fillPercent}%` }}
          >
            {particles.map((p, i) => (
              <span
                key={i}
                className="progress-particle"
                style={{
                  "--angle": `${p.angle}deg`,
                  "--distance": `${p.distance}px`,
                  "--size": `${p.size}px`,
                  "--duration": `${p.duration}s`,
                  "--hue": p.hue,
                }}
              />
            ))}
            <span className="progress-levelup-text">Level {levelUpNumber}!</span>
          </div>
        )}
      </div>

      {/* Current level label */}
      <div className="progress-current-level">
        Level {currentLevel}{currentLevel >= MAX_LEVEL ? " (Max)" : ""}
      </div>
    </div>
  );
}
