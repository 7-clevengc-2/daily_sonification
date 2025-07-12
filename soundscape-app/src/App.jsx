import React from "react";  //Javascript library used to build UI using components
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; //React pages are served from the local React app running in the browser
import Signup from './Signup.jsx';
import Login from './Login.jsx';
import SoundscapePage from './pages/SoundscapePage';

// Main component for the app
function App() {
  return (
    <Router>
      <div>
        <nav style={{ padding: "1rem", backgroundColor: "#f0f0f0" }}>
          <ul style={{ listStyle: "none", display: "flex", gap: "2rem", margin: 0, padding: 0 }}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/soundscape">Soundscape</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/soundscape" element={<SoundscapePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

// Home page component
function HomePage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Welcome to Daily Sonification</h1>
      <p>Create your own personalized soundscape experience.</p>
      <Link to="/soundscape" style={{ 
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
    </div>
  );
}

export default App;
