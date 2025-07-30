const express = require('express'); //Express.js makes handling server requests, responses, and data flow within a Node.js application simpler
const sqlite3 = require('sqlite3').verbose();  //database
const bcrypt = require('bcryptjs');  // Hashes passwords for security
const cors = require('cors'); // Prevents access to daily sonification features until signed in
const jwt = require('jsonwebtoken'); // jsonwebtoken acts as a proof of authentication after the user signs in

const app = express();
const db = new sqlite3.Database('./users.db');

// JWT secret key (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Port configuration (use environment variable for production)
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

// Signup
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const hashed = bcrypt.hashSync(password, 10);
  const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");

  stmt.run(username, hashed, function (err) {
    if (err) {
      return res.status(400).json({ error: "User already exists" });
    }
    
    // Create user object without password
    const user = { id: this.lastID, username };
    
    // Generate JWT token
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      success: true, 
      user, 
      token 
    });
  });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // Create user object without password
    const userData = { id: user.id, username: user.username };
    
    // Generate JWT token
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      success: true, 
      user: userData, 
      token 
    });
  });
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// Logout route (client-side logout, server just acknowledges)
app.post('/logout', (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
