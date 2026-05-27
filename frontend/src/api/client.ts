import axios from 'axios';

const client = axios.create({
  baseURL: 'http://10.50.103.253:5001',
  timeout: 5000,
});

export default client;