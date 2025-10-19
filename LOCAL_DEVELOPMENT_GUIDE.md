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

### Project-Specific Node Version
Your project has a `.nvmrc` file specifying Node.js version 22.16.0. Run:

```bash
nvm use
```

This will automatically use the correct Node.js version for this project.

## Development Workflow

### Quick Start (Recommended)

**Start both servers simultaneously:**
```bash
npm run dev
```

**Or start servers individually:**

**Terminal 1 - Backend:**
```bash
npm run start:server
```

**Terminal 2 - Frontend:**
```bash
npm run start:app
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

Your local development environment is now fully functional with proper Node.js version management!
