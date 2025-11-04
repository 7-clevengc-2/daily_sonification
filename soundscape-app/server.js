import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Serve static files from the dist directory
const distPath = join(__dirname, 'dist');
app.use(express.static(distPath));

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// History API fallback: serve index.html for all routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes or file requests
  if (req.path.startsWith('/api/') || req.path.includes('.')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const indexPath = join(distPath, 'index.html');
  try {
    const indexHtml = readFileSync(indexPath, 'utf-8');
    res.send(indexHtml);
  } catch (err) {
    console.error('Error serving index.html:', err);
    res.status(500).send('Error loading application');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static files from: ${distPath}`);
});

