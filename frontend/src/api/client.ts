import axios from 'axios';

const client = axios.create({
  baseURL: 'http://127.0.0.1:5001',
  timeout: 5000,
});

export default client;