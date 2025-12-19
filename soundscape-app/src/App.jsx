import React, { useEffect } from "react";  //Javascript library used to build UI using components
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom'; //React pages are served from the local React app running in the browser
import Signup from './Signup.jsx';
import Login from './Login.jsx';
import SoundscapePage from './pages/SoundscapePage';
import SoundscapeHistory from './pages/SoundscapeHistory';
import Survey from './pages/Survey';
import Admin from './pages/Admin';
import StudyDayManager from './pages/StudyDayManager';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Main component for the app
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <nav className="nav">
            <div className="container">
              <ul className="nav-list">
                <li><Link to="/" className="nav-link">Home</Link></li>
                <li><Link to="/soundscapes/history" className="nav-link">History</Link></li>
                <li><Link to="/survey" className="nav-link">Survey</Link></li>
                <li><Link to="/study-day" className="nav-link">Study Day</Link></li>
                <li><Link to="/admin" className="nav-link">Admin</Link></li>
                <li style={{ marginLeft: "auto" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/signup" className="nav-link">Signup</Link>
                    <LogoutButton />
                  </div>
                </li>
              </ul>
            </div>
          </nav>

          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
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
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/study-day" element={
                <ProtectedRoute>
                  <StudyDayManager />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Logout button component
function LogoutButton() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button 
      onClick={handleLogout}
      className="btn btn-ghost btn-sm"
    >
      Logout
    </button>
  );
}


// Manually created list of all sound URLs for maximum performance
const allSoundUrls = [
  // Mood sounds
  "/sounds/calm_pad.wav",
  "/sounds/stress.wav",
  "/sounds/768286__lolamoore__happy.mp3",
  "/sounds/531853__sondredrakensson__do-robots-get-bored-2.mp3",
  "/sounds/831758__akkaittou__sadatmosphericguitarsoundtrack2.wav",
  "/sounds/579268__nomiqbomi__angry-drone-1.mp3",
  // Location sounds
  "/sounds/forest_birds.wav",
  "/sounds/traffic.wav",
  "/sounds/beach.wav",
  "/sounds/525268__thesuprememuffinpooter__dry-grass-rustle.wav",
  "/sounds/799197__newlocknew__ambhome_kitchenthe-old-apartmentwall-clockventilation-noise.wav",
  // Weather sounds
  "/sounds/thunder.wav",
  "/sounds/really_windy.wav",
  "/sounds/cicada-72075.mp3",
  "/sounds/Fog Rolling In.m4a",
  "/sounds/snow-footstep-sfx-16100.mp3",
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
    // Preload all sounds using fetch() - this works without user interaction
    // Files will be cached in the browser's HTTP cache, making them instantly available
    // when Tone.js loads them later (no AudioContext required for fetch)
    const loadPromises = allSoundUrls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        // Read the response to ensure it's fully downloaded and cached
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


// Home page component
function HomePage() {
  const { isAuthenticated } = useAuth();

  // ============================================
  // EAGER LOADING: Comment out the block below to disable eager loading
  // ============================================
  /*
  useEffect(() => {
    eagerLoadSounds();
  }, []);
  */
  // ============================================
  // End of eager loading block
  // ============================================

  return (
    <div className="container" style={{ paddingTop: "var(--spacing-2xl)", paddingBottom: "var(--spacing-2xl)" }}>
      <div className="text-center animate-fade-in">
        <h1 style={{ marginBottom: "var(--spacing-lg)" }}>Welcome to Daily Sonification</h1>
        <p style={{ fontSize: "1.125rem", marginBottom: "var(--spacing-xl)" }}>
          Create your own personalized soundscape experience based on your daily mood and environment.
        </p>
        
        {isAuthenticated ? (
          <div>
            <p className="mb-4">Ready to create your soundscape?</p>
            <Link to="/survey" className="btn btn-primary btn-lg">
              Start Creating
            </Link>
          </div>
        ) : (
          <div className="card" style={{ maxWidth: "400px", margin: "0 auto" }}>
            <div className="card-body">
              <p className="mb-4">Please login to access the soundscape creator.</p>
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
        )}
      </div>
    </div>
  );
}

export default App;
