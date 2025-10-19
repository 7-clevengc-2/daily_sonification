# Daily Sonification Study Setup Guide

## Overview
This guide explains how to set up and run your daily sonification study using the updated project structure.

## Key Changes Made

### 1. Database Schema
Added two new tables to store study data:

- **`study_sessions`**: Tracks authenticated users and their daily sessions
- **`survey_responses`**: Stores individual survey responses linked to sessions

### 2. User Authentication System
- Study participants must create accounts and log in
- User accounts contain only username and password (no personal information)
- Participants can be tracked across the 9-day study period using their user ID
- Authentication ensures reliable tracking across devices and browser sessions

### 3. Backend API Endpoints
New endpoints added to the server:

- `POST /api/study/start-session` - Creates a new study session (requires authentication)
- `POST /api/study/save-responses` - Saves survey responses
- `GET /api/study/progress` - Gets study progress for authenticated user
- `GET /api/admin/export-data` - Exports all study data (admin only)

### 4. Frontend Integration
- Survey responses are now automatically saved to the database
- Study day tracking (1-9) with progress indicators
- User authentication required for study participation
- Loading states during data saving

## Study Workflow

### For Participants:
1. **Account Creation**: Create a username and password account
2. **Daily Survey**: Log in and complete survey for each of 9 days
3. **Progress Tracking**: System tracks which days are completed per user
4. **Soundscape Creation**: Survey responses create personalized soundscapes

### For Researchers:
1. **Data Collection**: All responses automatically saved to database
2. **Data Export**: Use admin panel to export CSV data
3. **Analysis**: Data includes user IDs and usernames for correlation analysis

## Deployment on Render

### Environment Variables Required:
Set these in your Render dashboard:

**Backend (.env):**
```
JWT_SECRET=your-secure-jwt-secret-key-here
ADMIN_KEY=your-secure-admin-key-here
PORT=3001
```

**Frontend (.env):**
```
VITE_API_URL=https://your-render-server-name.onrender.com
```

### Database Persistence:
- SQLite database file (`users.db`) is stored on Render's filesystem
- Data persists between deployments
- No additional database setup required

## Data Access Methods

### 1. Admin Panel (Recommended)
- Navigate to `/admin` on your deployed site
- Enter your admin key
- Download CSV file with all study data

### 2. Direct API Access
- Use the export endpoint: `GET /api/admin/export-data?adminKey=YOUR_KEY`
- Returns CSV data directly

### 3. Database File Access
- SQLite database is stored as `users.db` in your server directory
- Can be downloaded via Render's file system access (if available on your plan)

## Data Structure

### CSV Export Format:
```csv
user_id,username,study_day,session_created,session_completed,question_key,answer_value,response_created
1,participant1,1,2024-01-01 10:00:00,2024-01-01 10:05:00,weather,Sunny,2024-01-01 10:05:00
1,participant1,1,2024-01-01 10:00:00,2024-01-01 10:05:00,place,City,2024-01-01 10:05:00
```

### Data Analysis:
- **Participant Tracking**: Use `user_id` or `username` to group responses by participant
- **Day Progression**: Use `study_day` to track daily responses
- **Response Analysis**: Use `question_key` and `answer_value` for analysis
- **Completion Status**: Check `session_completed` for participation rates

## Study Management

### Starting the Study:
1. Deploy both frontend and backend to Render
2. Set environment variables
3. Share the frontend URL with participants
4. Monitor participation via admin panel

### During the Study:
- Participants log in and access the site daily for 9 days
- Each day creates a new session linked to their user account
- Survey responses are automatically saved
- Progress is tracked per user account

### After the Study:
1. Use admin panel to export all data
2. Analyze responses using the CSV data
3. Correlate responses by user ID for longitudinal analysis

## Security Considerations

### User Data:
- Only username and password are collected (no personal information)
- User accounts are required for study participation
- Data is suitable for research analysis
- Participants can be tracked reliably across sessions

### Admin Access:
- Admin key required for data export
- Keep admin key secure
- Consider IP restrictions for admin endpoints in production

## Troubleshooting

### Common Issues:
1. **Survey not saving**: Check network connection and API endpoint configuration
2. **Authentication required**: Participants must be logged in to participate
3. **Export fails**: Verify admin key and server connectivity

### Monitoring:
- Check server logs for API errors
- Monitor database size (SQLite has size limits)
- Track participation rates via admin panel

## Next Steps

1. **Deploy to Render**: Set up both frontend and backend services
2. **Configure Environment**: Set all required environment variables
3. **Test the System**: Complete a test survey to verify data saving
4. **Launch Study**: Share URL with participants
5. **Monitor Progress**: Use admin panel to track participation
6. **Export Data**: Download CSV when study is complete

## File Structure
```
soundscape-app/
├── src/
│   ├── services/studyService.js    # API service for study data
│   ├── pages/Survey.jsx           # Updated survey with data saving
│   ├── pages/Admin.jsx            # Admin panel for data export
│   └── config.js                  # API configuration

soundscape-server/
├── src/
│   └── server.js                  # Updated with study endpoints
└── users.db                       # SQLite database (created automatically)
```

This setup provides a complete solution for your daily sonification study with proper data collection, anonymous tracking, and easy data export capabilities.
