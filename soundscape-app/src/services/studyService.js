import config from '../config.js';

class StudyService {
  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  async startStudySession(studyDay) {
    try {
      const response = await fetch(`${this.baseUrl}/api/study/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studyDay }),
      });

      if (!response.ok) {
        throw new Error('Failed to start study session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting study session:', error);
      throw error;
    }
  }

  async saveSurveyResponses(sessionId, responses) {
    try {
      const response = await fetch(`${this.baseUrl}/api/study/save-responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  async getStudyProgress(anonymousId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/study/progress/${anonymousId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch study progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching study progress:', error);
      throw error;
    }
  }

  // Store anonymous ID in localStorage for persistence across sessions
  setAnonymousId(anonymousId) {
    localStorage.setItem('study_anonymous_id', anonymousId);
  }

  getAnonymousId() {
    return localStorage.getItem('study_anonymous_id');
  }

  // Store current study day
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
