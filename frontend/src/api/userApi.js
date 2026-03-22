import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const userApi = {
  async registerStep1(data) {
    const res = await axios.post(`${API_URL}/api/auth/register-step1`, data);
    return res.data;
  },
  async registerStep2(data, token) {
    const res = await axios.patch(`${API_URL}/api/auth/register-step2`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  async login(data) {
    const res = await axios.post(`${API_URL}/api/auth/login`, data);
    return res.data;
  },
   async getProfile(token) {
    const res = await axios.get(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  async checkStreak(token) {
    const { data } = await axios.post(
      `${API_URL}/api/users/check-streak`,
      {}, // body puste
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  },
};
