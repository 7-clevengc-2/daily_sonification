# Browser Cache Options for Sound Files

## Current State

Your sound files are currently served without explicit cache headers, meaning browsers use default caching behavior (which is inconsistent).

## Option 1: Set Cache-Control Headers in Express (Recommended)

Modify `soundscape-app/server.js` to add cache headers for sound files:

### Long-term caching (1 year) with cache busting via versioning:
```javascript
// Serve static files with different cache policies
app.use(express.static(distPath, {
  maxAge: '1y', // Cache for 1 year
  immutable: true // Tell browser the file won't change
}));

// OR specifically for sounds directory with aggressive caching:
app.use('/sounds', express.static(join(distPath, 'sounds'), {
  maxAge: '1y',
  immutable: true,
  etag: true, // Enable ETag for cache validation
  lastModified: true
}));
```

### Short-term caching (1 hour):
```javascript
app.use('/sounds', express.static(join(distPath, 'sounds'), {
  maxAge: '1h',
  etag: true,
  lastModified: true
}));
```

### No caching (always fetch fresh):
```javascript
app.use('/sounds', express.static(join(distPath, 'sounds'), {
  maxAge: 0,
  etag: false,
  lastModified: false,
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));
```

## Option 2: Cache Busting with Query Parameters

Modify the sound file URLs in `Survey.jsx` to include version numbers or timestamps:

```javascript
// Add version to URLs
const SOUND_VERSION = 'v1.0.0'; // Update this when sounds change

const mood_sounds = [
  { calm: `/sounds/calm_pad.wav?v=${SOUND_VERSION}` },
  { stressed: `/sounds/stress.wav?v=${SOUND_VERSION}` },
  // ... etc
];
```

Or use build-time timestamps:
```javascript
const SOUND_VERSION = import.meta.env.VITE_SOUND_VERSION || Date.now();
```

## Option 3: Vite Build Configuration

Configure Vite to handle static assets with specific cache strategies in `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Add hash to filenames for cache busting
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.wav') || 
              assetInfo.name.endsWith('.mp3') || 
              assetInfo.name.endsWith('.m4a')) {
            return 'sounds/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  // For development server
  server: {
    headers: {
      'Cache-Control': 'no-cache' // Disable caching in dev
    }
  }
})
```

## Option 4: Service Worker (Advanced)

Implement a service worker to control caching programmatically. This gives you fine-grained control but requires more setup.

## Option 5: CDN-Level Caching

If using a CDN (like Cloudflare, AWS CloudFront), configure cache rules there. This is separate from your application code.

## Recommended Approach

For your use case, I recommend **Option 1 with long-term caching** combined with **Option 2 (version-based cache busting)**:

1. Set aggressive caching (1 year) for performance
2. Use version query parameters that you update when sounds change
3. This gives you the best of both worlds: fast loading + ability to update sounds

Example implementation:
- Set `maxAge: '1y'` in Express for `/sounds` directory
- Add `?v=1.0.0` to all sound URLs
- Update the version when you change sound files

