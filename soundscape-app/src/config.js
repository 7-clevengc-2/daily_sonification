// Configuration for API endpoints
const config = {
  // Determine if we're in development or production
  isDevelopment: import.meta.env.DEV,
  
  // API base URL - use localhost for development, Render URL for production
  apiBaseUrl: import.meta.env.DEV 
    ? 'http://localhost:3001' 
    : import.meta.env.VITE_API_URL || 'https://your-render-app-name.onrender.com',
};

export default config; 