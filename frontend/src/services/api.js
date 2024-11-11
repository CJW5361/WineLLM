import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const wineApi = {
  async chat(request) {
    try {
      const response = await axios.post(`${API_URL}/chat/ask`, request);
      return response.data;
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  },
  
  async testRecommendations(preferences) {
    try {
      const response = await axios.post(`${API_URL}/recommendations/test`, preferences);
      console.log('Recommendations Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Recommendations Error:', error);
      throw error;
    }
  }
};