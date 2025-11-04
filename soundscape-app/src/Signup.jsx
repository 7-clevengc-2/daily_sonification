import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import config from './config';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Trim username to ensure consistency
      const trimmedUsername = username.trim();
      const res = await axios.post(`${config.apiBaseUrl}/signup`, { 
        username: trimmedUsername, 
        password 
      });
      
      // Store authentication data
      login(res.data.user, res.data.token);
      
      // Redirect to survey page
      navigate('/survey');
    } catch (e) {
      console.error('Signup error:', e.response?.data || e.message);
      setError(e.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "var(--spacing-2xl)", paddingBottom: "var(--spacing-2xl)" }}>
      <div className="card" style={{ maxWidth: "400px", margin: "0 auto" }}>
        <div className="card-header text-center">
          <h2>Sign Up</h2>
        </div>
        <div className="card-body">
          {error && (
            <div style={{ 
              color: "var(--error-500)", 
              backgroundColor: "var(--error-50)", 
              padding: "var(--spacing-md)", 
              borderRadius: "var(--radius-md)", 
              marginBottom: "var(--spacing-lg)",
              border: "1px solid var(--error-200)"
            }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <input 
                placeholder="Username" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <input 
                placeholder="Password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}