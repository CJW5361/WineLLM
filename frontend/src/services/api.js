import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const wineApi = {
  async chatWithBot(message) {
    try {
      const response = await axios.post(`${API_URL}/chat/ask`, { message });
      console.log('API Response:', response.data); // 디버깅용
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};