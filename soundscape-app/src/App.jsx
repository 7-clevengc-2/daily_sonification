import React from "react";  //Javascript library used to build UI using components
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom'; //React pages are served from the local React app running in the browser
import Signup from './Signup.jsx';
import Login from './Login.jsx';
import SoundscapePage from './pages/SoundscapePage';
import Survey from './pages/Survey';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Main component for the app
function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <nav style={{ padding: "1rem", backgroundColor: "#f0f0f0" }}>
            <ul style={{ listStyle: "none", display: "flex", gap: "2rem", margin: 0, padding: 0 }}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/soundscape">Soundscape</Link></li>
              <li><Link to="/survey">Survey</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Signup</Link></li>
              <li><LogoutButton /></li>
            </ul>
          </nav>

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
          </Routes>
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
      style={{ 
        background: 'none', 
        border: 'none', 
        color: '#007bff', 
        cursor: 'pointer',
        textDecoration: 'underline'
      }}
    >
      Logout
    </button>
  );
}

// Home page component
function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Welcome to Daily Sonification</h1>
      <p>Create your own personalized soundscape experience.</p>
      {isAuthenticated ? (
        <Link to="/survey" style={{ 
          display: "inline-block", 
          marginTop: "1rem", 
          padding: "0.5rem 1rem", 
          backgroundColor: "#007bff", 
          color: "white", 
          textDecoration: "none", 
          borderRadius: "4px" 
        }}>
          Start Creating
        </Link>
      ) : (
        <div>
          <p>Please login to access the soundscape creator.</p>
          <Link to="/login" style={{ 
            display: "inline-block", 
            marginTop: "1rem", 
            padding: "0.5rem 1rem", 
            backgroundColor: "#007bff", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "4px",
            marginRight: "1rem"
          }}>
            Login
          </Link>
          <Link to="/signup" style={{ 
            display: "inline-block", 
            marginTop: "1rem", 
            padding: "0.5rem 1rem", 
            backgroundColor: "#28a745", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "4px" 
          }}>
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}

export default App;
