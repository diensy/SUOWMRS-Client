import api from './api.js';
export const getStorageCurrent = () => api.get('/storage/current').then(r => r.data);
export const toggleValve = (action) => api.post('/storage/valve', { action }).then(r => r.data);
