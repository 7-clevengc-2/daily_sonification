import React from "react";  //Javascript library used to build UI using components
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom'; //React pages are served from the local React app running in the browser
import Signup from './Signup.jsx';
import Login from './Login.jsx';
import SoundscapePage from './pages/SoundscapePage';
import UploadSound from './pages/UploadSound';
import Survey from './pages/Survey';
import Admin from './pages/Admin';
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
                <li><Link to="/soundscape" className="nav-link">Soundscape</Link></li>
                <li><Link to="/survey" className="nav-link">Survey</Link></li>
                <li><Link to="/upload" className="nav-link">Upload</Link></li>
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
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <UploadSound />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
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

// Home page component
function HomePage() {
  const { isAuthenticated } = useAuth();

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
