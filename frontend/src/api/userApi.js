import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const userApi = {
  register: async (userData) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, userData);
    return res.data;
  },
};
