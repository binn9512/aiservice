import axios from 'axios';

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001',
  timeout: 5000,
});

export default client;