# Soundscape Server

Backend API server for the Daily Sonification soundscape application.

## Development

```bash
npm install
npm start
```

## Environment Variables

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file:
   ```
   JWT_SECRET=your-secure-jwt-secret-key-here
   PORT=3001
   ```

## Render Deployment

1. Connect your GitHub repository to Render
2. Set the build command: `npm install`
3. Set the start command: `node src/server.js`
4. Add environment variables:
   - `JWT_SECRET`: A secure random string for JWT token signing
   - `PORT`: Render will set this automatically

## API Endpoints

- `POST /signup` - User registration
- `POST /login` - User authentication
- `POST /logout` - User logout (client-side)
- `GET /protected` - Protected route example

## Security Notes

- Always use a strong JWT_SECRET in production
- The server uses SQLite for simplicity - consider PostgreSQL for production
- CORS is enabled for development - configure appropriately for production 