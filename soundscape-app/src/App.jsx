import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import Signup from './Signup.jsx';
import Login from './Login.jsx';
import SoundscapePage from './pages/SoundscapePage';
import SoundscapeHistory from './pages/SoundscapeHistory';
import Survey from './pages/Survey';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import studyService from './services/studyService';
import ProgressBar from './components/ProgressBar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <main>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/home" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              <Route path="/survey" element={
                <ProtectedRoute>
                  <Survey />
                </ProtectedRoute>
              } />
              <Route path="/soundscape" element={
                <ProtectedRoute>
                  <SoundscapePage />
                </ProtectedRoute>
              } />
              <Route path="/soundscapes/history" element={
                <ProtectedRoute>
                  <SoundscapeHistory />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

const allSoundUrls = [
  "/sounds/normalized_audio/calm_pad.wav",
  "/sounds/normalized_audio/stress.wav",
  "/sounds/normalized_audio/768286__lolamoore__happy.wav",
  "/sounds/normalized_audio/531853__sondredrakensson__do-robots-get-bored-2.wav",
  "/sounds/normalized_audio/831758__akkaittou__sadatmosphericguitarsoundtrack2.wav",
  "/sounds/normalized_audio/579268__nomiqbomi__angry-drone-1.wav",
  "/sounds/normalized_audio/forest_birds.wav",
  "/sounds/normalized_audio/traffic.wav",
  "/sounds/normalized_audio/beach.wav",
  "/sounds/normalized_audio/525268__thesuprememuffinpooter__dry-grass-rustle.wav",
  "/sounds/normalized_audio/799197__newlocknew__ambhome_kitchenthe-old-apartmentwall-clockventilation-noise.wav",
  "/sounds/normalized_audio/thunder.wav",
  "/sounds/normalized_audio/really_windy.wav",
  "/sounds/normalized_audio/cicada-72075.wav",
  "/sounds/normalized_audio/Fog Rolling In.wav",
  "/sounds/normalized_audio/snow-footstep-sfx-16100.wav",
];

/**
 * EAGER LOADING FUNCTION
 * Preloads all sound files when the home page mounts.
 * 
 * To disable eager loading and use lazy loading in Survey instead:
 * Comment out the useEffect call that invokes this function in the HomePage component.
 */
async function eagerLoadSounds() {
  const startTime = performance.now();
  try {
    const loadPromises = allSoundUrls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        await response.blob();
        console.log(`Eager loaded: ${url}`);
      } catch (error) {
        console.warn(`Failed to eager load ${url}:`, error);
      }
    });

    await Promise.all(loadPromises);
    console.log(`Eager loading complete: ${loadPromises.length} sounds preloaded`);
  } catch (error) {
    console.error("Error during eager loading:", error);
  }
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  console.log(`Sound load time for eager loading: ${totalTime}ms`);
}

// Public welcome / landing page
function WelcomePage() {
  return (
    <div className="container" style={{ paddingTop: "var(--spacing-2xl)", paddingBottom: "var(--spacing-2xl)" }}>
      <div className="text-center animate-fade-in">
        <h1 style={{ marginBottom: "var(--spacing-lg)" }}>Welcome to Daily Sonification</h1>
        <p style={{ fontSize: "1.125rem", marginBottom: "var(--spacing-xl)" }}>
          Create your own personalized soundscape experience based on your daily mood and environment.
        </p>

        <div className="card" style={{ maxWidth: "400px", margin: "0 auto" }}>
          <div className="card-body">
            <p className="mb-4">Log in or sign up to get started.</p>
            <div style={{ display: "flex", gap: "var(--spacing-md)", flexWrap: "wrap", justifyContent: "center" }}>
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/signup" className="btn btn-outline">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Authenticated home / hub page
function HomePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [surveyCompletedToday, setSurveyCompletedToday] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  const [currentDay] = useState(() => studyService.getCurrentStudyDay());
  const [previousDay] = useState(() => studyService.getPreviousStudyDay());

  useEffect(() => {
    eagerLoadSounds();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function checkStatus() {
      try {
        const { completedToday } = await studyService.getDailyStatus();
        if (!cancelled) setSurveyCompletedToday(completedToday);
      } catch (err) {
        console.error("Failed to check daily status:", err);
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    }
    checkStatus();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProgressAnimationComplete = () => {
    studyService.clearPreviousStudyDay();
  };

  return (
    <div className="container" style={{ paddingTop: "var(--spacing-xl)", paddingBottom: "var(--spacing-2xl)" }}>
      {/* Top bar: Settings + Logout */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-2xl)" }}>
        <Link to="/settings" className="btn btn-ghost" style={{ fontSize: "1rem" }}>Settings</Link>
        <button onClick={handleLogout} className="btn btn-ghost" style={{ fontSize: "1rem" }}>Logout</button>
      </div>

      <div className="text-center animate-fade-in">
        <h1 style={{ marginBottom: "var(--spacing-lg)" }}>Daily Sonification</h1>
        <p style={{ fontSize: "1.125rem", marginBottom: "var(--spacing-xl)" }}>
          What would you like to do today?
        </p>

        <ProgressBar
          currentDay={currentDay}
          previousDay={previousDay}
          onAnimationComplete={handleProgressAnimationComplete}
        />

        <div style={{
          display: "flex",
          gap: "var(--spacing-xl)",
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
          {/* Survey button */}
          <button
            className="btn btn-primary btn-lg"
            disabled={statusLoading || surveyCompletedToday}
            onClick={() => navigate('/survey')}
            style={{
              minWidth: "200px",
              minHeight: "120px",
              fontSize: "1.25rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--spacing-sm)",
              opacity: surveyCompletedToday ? 0.5 : 1,
              cursor: surveyCompletedToday ? "not-allowed" : "pointer",
            }}
          >
            <span style={{ fontSize: "2rem" }}>&#9835;</span>
            <span>Start Survey</span>
            {surveyCompletedToday && (
              <span style={{ fontSize: "0.75rem", fontWeight: "normal" }}>Completed today</span>
            )}
          </button>

          {/* History button */}
          <button
            className="btn btn-outline btn-lg"
            onClick={() => navigate('/soundscapes/history')}
            style={{
              minWidth: "200px",
              minHeight: "120px",
              fontSize: "1.25rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--spacing-sm)",
            }}
          >
            <span style={{ fontSize: "2rem" }}>&#128218;</span>
            <span>View History</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
