import axios from 'axios';

const apiClient = axios.create({
    // Make sure this points to your backend server URL
    baseURL: 'http://localhost:5173', // or whatever your backend URL is
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  export default apiClient;