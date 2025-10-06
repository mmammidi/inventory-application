﻿import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://inventory-management-api-r40f.onrender.com';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;
