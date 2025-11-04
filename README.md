# Daily Sonification Study

A React + Node.js application for conducting daily sonification studies with user authentication and data collection.

## Quick Setup

### 1. Install nvm (Node Version Manager)

**macOS/Linux:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

**Windows:**
Download and install from [nvm-windows](https://github.com/coreybutler/nvm-windows)

### 2. Install and Use Node.js

```bash
# Install Node.js version specified in .nvmrc
nvm install
nvm use

# Verify installation
node --version
npm --version
```

### 3. Install Dependencies

```bash
# Install all project dependencies
npm run install:all
```

### 4. Setup Environment Files

**Backend (soundscape-server/.env):**
```
JWT_SECRET=your-secure-jwt-secret-key-here
ADMIN_KEY=your-secure-admin-key-here
PORT=3001
```

**Frontend (soundscape-app/.env):**
```
VITE_API_URL=http://localhost:3001
```

### 5. Start the Application

```bash
# Start both servers
npm run dev
```

**Access URLs:**
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

### 6. Test the Application

1. Go to http://localhost:5173
2. Create an account (Sign Up)
3. Complete the survey
4. Check admin panel at http://localhost:5173/admin

## Troubleshooting

### Common Issues

1. **"command not found: npm"**
   - Solution: Run `nvm use` to load the correct Node.js version

2. **Port already in use**
   - Backend: Change PORT in soundscape-server/.env
   - Frontend: Vite will automatically use the next available port

3. **CORS errors**
   - Make sure backend is running on port 3001
   - Check that VITE_API_URL in frontend .env matches backend port

4. **Database errors**
   - SQLite database is created automatically
   - Check that the server has write permissions

### Useful Commands

```bash
# Check if servers are running
npm run check

# Check individual servers
npm run check:server
npm run check:app

# Install all dependencies
npm run install:all

# Use project-specific Node version
nvm use
```

## Development Tips

### 1. Shell Profile Setup
Add this to your `~/.zshrc` (or `~/.bash_profile`) to automatically load nvm:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

### 2. Quick Commands
```bash
# Use correct Node version
nvm use

# Start both servers
npm run dev

# Check server status
npm run check
```

### 3. Database Management
- Database file: `soundscape-server/users.db`
- Use SQLite browser tools to inspect data
- Admin panel exports CSV data

### 4. Testing Checklist
- [ ] Backend server starts without errors
- [ ] Frontend loads in browser
- [ ] User registration works
- [ ] Survey completion saves data
- [ ] Admin panel exports data
- [ ] No CORS errors in browser console

## Next Steps

1. **Test the complete flow** by creating an account and completing a survey
2. **Verify data saving** by checking the admin panel
3. **Test the soundscape generation** after completing the survey
4. **Prepare for deployment** by updating environment variables for production
