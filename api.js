import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
});

export const fetchPublishedPage = (slug) => api.get(`/content/public/${slug}`).then((res) => res.data.data);
export const fetchPublishedPagesList = () => api.get('/content/public').then((res) => res.data.data);

export default api;
