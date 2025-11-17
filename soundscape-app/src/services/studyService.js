import config from '../config.js';

class StudyService {
  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  async startStudySession(studyDay) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await fetch(`${this.baseUrl}/api/study/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ studyDay }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403) {
          throw new Error('Authentication token expired or invalid. Please log in again.');
        }
        throw new Error(errorData.error || errorData.details || 'Failed to start study session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting study session:', error);
      throw error;
    }
  }

  async saveSurveyResponses(sessionId, responses) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/study/save-responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId, responses }),
      });

      if (!response.ok) {
        throw new Error('Failed to save survey responses');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving survey responses:', error);
      throw error;
    }
  }

  async getStudyProgress() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/api/study/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch study progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching study progress:', error);
      throw error;
    }
  }

  async getSoundscapes() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      const response = await fetch(`${this.baseUrl}/api/study/soundscapes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch soundscapes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching soundscapes:', error);
      throw error;
    }
  }

  // Store current study day in localStorage for user convenience
  setCurrentStudyDay(day) {
    localStorage.setItem('study_current_day', day.toString());
  }

  getCurrentStudyDay() {
    const day = localStorage.getItem('study_current_day');
    return day ? parseInt(day) : 1;
  }

  // Increment study day
  incrementStudyDay() {
    const currentDay = this.getCurrentStudyDay();
    const nextDay = currentDay + 1;
    this.setCurrentStudyDay(nextDay);
    return nextDay;
  }
}

export default new StudyService();
