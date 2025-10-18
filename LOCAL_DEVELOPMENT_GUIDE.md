# Local Development Setup Guide

## ✅ Setup Complete!

Your local development environment is now ready! Both servers are running:

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

## Using nvm (Node Version Manager)

### Why nvm is Important
- **Version Management**: Different projects may require different Node.js versions
- **Isolation**: Each project can use its own Node.js version
- **Easy Switching**: Switch between versions with `nvm use`

### nvm Commands You'll Use

```bash
# Load nvm (add this to your shell profile)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# List installed versions
nvm list

# Use a specific version
nvm use 22.16.0

# Use the version specified in .nvmrc
nvm use

# Install a new version
nvm install 20.10.0

# Set default version
nvm alias default 22.16.0
```

### Project-Specific Node Version
Your project now has a `.nvmrc` file specifying Node.js version 22.16.0. When you navigate to the project directory, you can run:

```bash
nvm use
```

This will automatically use the correct Node.js version for this project.

## Development Workflow

### Starting the Servers

**Terminal 1 - Backend:**
```bash
cd /Users/tclevenger/Projects/daily_sonification/soundscape-server
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm start
```

**Terminal 2 - Frontend:**
```bash
cd /Users/tclevenger/Projects/daily_sonification/soundscape-app
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev
```

### Testing the Application

1. **Open your browser** and go to http://localhost:5173
2. **Create an account** by clicking "Sign Up"
3. **Test the survey** by clicking "Start Creating"
4. **Complete the survey** and verify data is saved
5. **Test admin panel** at http://localhost:5173/admin

### Environment Files

**Backend (.env):**
```
JWT_SECRET=your-secure-jwt-secret-key-here-change-this-in-production
ADMIN_KEY=your-secure-admin-key-here-change-this-in-production
PORT=3001
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001
```

## Troubleshooting

### Common Issues

1. **"command not found: npm"**
   - Solution: Load nvm first: `export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"`

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
curl http://localhost:3001/protected
curl http://localhost:5173

# Check Node.js version
node --version

# Check npm version
npm --version

# List all nvm versions
nvm list

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

### 2. Project Navigation
```bash
# Quick navigation to project
cd /Users/tclevenger/Projects/daily_sonification

# Use correct Node version
nvm use

# Start backend
cd soundscape-server && npm start

# Start frontend (in new terminal)
cd soundscape-app && npm run dev
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

Your local development environment is now fully functional with proper Node.js version management!
