import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_ORDER_UPLOAD_API,
});

export { api };
