require('dotenv').config(); // Load environment variables from .env file
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

// CORS configuration to support both localhost and deployed application
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', // Current Vite port
    'http://localhost:5174', // Vite default port
    'https://daily-sonification.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`, (err) => {
  if (err) {
    console.error('Error creating users table:', err.message);
  }
});

// Create study sessions table for user tracking
db.run(`CREATE TABLE IF NOT EXISTS study_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  study_day INTEGER,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users (id)
)`, (err) => {
  if (err) {
    console.error('Error creating study_sessions table:', err.message);
  } else {
    // Migrate existing table: add user_id column if it doesn't exist
    // Only run migration after table is confirmed to exist
    db.run(`ALTER TABLE study_sessions ADD COLUMN user_id INTEGER`, (alterErr) => {
      // Ignore error if column already exists or table doesn't exist yet
      if (alterErr) {
        const errorMsg = alterErr.message.toLowerCase();
        // Only log if it's not a duplicate column error or table doesn't exist
        if (!errorMsg.includes('duplicate') && !errorMsg.includes('already exists') && !errorMsg.includes('no such column') && !errorMsg.includes('no such table')) {
          console.error('Error adding user_id column:', alterErr.message);
        }
      }
    });
  }
});

// Create survey responses table
db.run(`CREATE TABLE IF NOT EXISTS survey_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER,
  username TEXT,
  question_key TEXT,
  answer_value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES study_sessions (id)
)`, (err) => {
  if (err) {
    console.error('Error creating survey_responses table:', err.message);
  } else {
    // Add username column if it doesn't exist (for existing databases)
    // Only run migration after table is confirmed to exist
    db.run(`ALTER TABLE survey_responses ADD COLUMN username TEXT`, (alterErr) => {
      // Ignore error if column already exists or table doesn't exist yet
      if (alterErr) {
        const errorMsg = alterErr.message.toLowerCase();
        // Only log if it's not a duplicate column error or table doesn't exist
        if (!errorMsg.includes('duplicate') && !errorMsg.includes('already exists') && !errorMsg.includes('no such column') && !errorMsg.includes('no such table')) {
          console.error('Error adding username column:', alterErr.message);
        }
      }
    });
  }
});

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
    console.error('No token provided in Authorization header');
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      console.error('Token received:', token.substring(0, 20) + '...');
      return res.status(403).json({ error: "Invalid token", details: err.message });
    }
    console.log('Token verified for user:', user.username, '(ID:', user.id + ')');
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

// Study API endpoints

// Start a new study session
app.post('/api/study/start-session', authenticateToken, (req, res) => {
  const { studyDay } = req.body;
  const userId = req.user.id;
  const username = req.user.username;
  
  if (!userId) {
    return res.status(400).json({ error: "User ID not found in token" });
  }
  
  const stmt = db.prepare("INSERT INTO study_sessions (user_id, study_day) VALUES (?, ?)");
  
  stmt.run(userId, studyDay, function(err) {
    if (err) {
      console.error('Error creating study session:', err);
      return res.status(500).json({ error: "Failed to create study session", details: err.message });
    }
    
    console.log(`Created session ${this.lastID} for user ${username} (ID: ${userId}), study day ${studyDay}`);
    
    res.json({ 
      success: true, 
      userId,
      sessionId: this.lastID,
      studyDay 
    });
    
    stmt.finalize();
  });
});

// Save survey responses
app.post('/api/study/save-responses', authenticateToken, (req, res) => {
  const { sessionId, responses } = req.body;
  const username = req.user.username;
  const userId = req.user.id;
  
  if (!sessionId || !responses) {
    return res.status(400).json({ error: "Session ID and responses required" });
  }
  
  if (!username) {
    console.error('Username not found in token for user:', userId);
    return res.status(400).json({ error: "Username not found in authentication token" });
  }
  
  console.log(`Saving responses for session ${sessionId}, user: ${username} (ID: ${userId}), ${Object.keys(responses).length} responses`);
  
  try {
    // Start a transaction and serialize operations
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      
      // Prepare statement inside serialize block
      const stmt = db.prepare("INSERT INTO survey_responses (session_id, username, question_key, answer_value) VALUES (?, ?, ?, ?)");
      
      // Insert each response
      let insertedCount = 0;
      Object.entries(responses).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          stmt.run(sessionId, username, key, String(value));
          insertedCount++;
        }
      });
      
      // Finalize the statement to ensure all inserts complete
      stmt.finalize((err) => {
        if (err) {
          console.error('Error finalizing statement:', err);
          db.run("ROLLBACK");
          return res.status(500).json({ error: "Failed to save responses", details: err.message });
        }
        
        console.log(`Inserted ${insertedCount} responses for session ${sessionId}`);
        
        // Update session as completed
        db.run("UPDATE study_sessions SET completed_at = CURRENT_TIMESTAMP WHERE id = ?", [sessionId], (err) => {
          if (err) {
            console.error('Error updating session:', err);
            db.run("ROLLBACK");
            return res.status(500).json({ error: "Failed to update session", details: err.message });
          }
          
          // Commit transaction
          db.run("COMMIT", (err) => {
            if (err) {
              console.error('Error committing transaction:', err);
              db.run("ROLLBACK");
              return res.status(500).json({ error: "Failed to save responses", details: err.message });
            }
            
            console.log(`Successfully saved responses for session ${sessionId}`);
            res.json({ success: true, message: "Responses saved successfully" });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error saving responses:', error);
    res.status(500).json({ error: "Failed to save responses", details: error.message });
  }
});

// Get study progress for authenticated user
app.get('/api/study/progress', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const query = `
    SELECT s.study_day, s.completed_at, COUNT(sr.id) as response_count
    FROM study_sessions s
    LEFT JOIN survey_responses sr ON s.id = sr.session_id
    WHERE s.user_id = ?
    GROUP BY s.id, s.study_day, s.completed_at
    ORDER BY s.study_day
  `;
  
  db.all(query, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch progress" });
    }
    
    res.json({ 
      success: true, 
      progress: rows,
      totalDays: rows.length,
      completedDays: rows.filter(row => row.completed_at).length
    });
  });
});

// Admin endpoint to export all study data
app.get('/api/admin/export-data', (req, res) => {
  // Simple authentication check (you should implement proper admin auth)
  const { adminKey } = req.query;
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const query = `
    SELECT 
      s.user_id,
      COALESCE(sr.username, u.username, '') as username,
      s.study_day,
      s.created_at as session_created,
      s.completed_at as session_completed,
      sr.question_key,
      sr.answer_value,
      sr.created_at as response_created
    FROM study_sessions s
    LEFT JOIN survey_responses sr ON s.id = sr.session_id
    LEFT JOIN users u ON s.user_id = u.id
    ORDER BY COALESCE(sr.username, u.username, ''), s.study_day, COALESCE(sr.question_key, '')
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Export query error:', err);
      console.error('SQL Query:', query);
      return res.status(500).json({ error: "Failed to export data", details: err.message });
    }
    
    // Convert to CSV format
    const csvHeader = "user_id,username,study_day,session_created,session_completed,question_key,answer_value,response_created\n";
    const csvData = rows.map(row => 
      `"${row.user_id || ''}","${row.username || ''}","${row.study_day || ''}","${row.session_created || ''}","${row.session_completed || ''}","${row.question_key || ''}","${row.answer_value || ''}","${row.response_created || ''}"`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="study_data.csv"');
    res.send(csvHeader + csvData);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
