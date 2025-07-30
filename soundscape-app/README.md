# Daily Sonification - Soundscape App

A React application for creating personalized soundscapes based on daily experiences.

## Development

This project uses Vite for development. To get started:

```bash
npm install
npm run dev
```

## Deployment Configuration

### Environment Variables

The app automatically switches between localhost (development) and your Render server URL (production) based on the environment.

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your Render server URL:
   ```
   VITE_API_URL=https://your-render-server-name.onrender.com
   ```

### Render Deployment

1. **Frontend (soundscape-app)**:
   - Connect your GitHub repository to Render
   - Set the build command: `npm run build`
   - Set the publish directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-render-server-name.onrender.com`

2. **Backend (soundscape-server)**:
   - Deploy the `soundscape-server` directory as a separate service
   - Set the build command: `npm install`
   - Set the start command: `node src/server.js`
   - Add environment variables as needed (JWT_SECRET, etc.)

### How It Works

The app uses a configuration system (`src/config.js`) that:
- Automatically detects if it's running in development mode
- Uses `http://localhost:3001` for development
- Uses the `VITE_API_URL` environment variable for production
- Falls back to a default Render URL if the environment variable is not set

## Technology Stack

- React 19
- Vite
- Axios for API calls
- React Router for navigation
- Tone.js for audio processing

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
