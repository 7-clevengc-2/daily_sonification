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
// This must come AFTER static file middleware
app.use((req, res, next) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // Skip if it's a file request (has extension and isn't already handled)
  const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(req.path);
  if (hasFileExtension && !req.path.startsWith('/assets/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // Serve index.html for all other routes (client-side routing)
  const indexPath = join(distPath, 'index.html');
  try {
    const indexHtml = readFileSync(indexPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html');
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

