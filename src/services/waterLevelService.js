import api from './api.js';
export const getLatestWaterLevel = () => api.get('/water-level/latest').then(r => r.data);
export const getWaterLevelHistory = (hours = 24) => api.get(`/water-level/history?hours=${hours}`).then(r => r.data);
export const getWaterLevelStats = () => api.get('/water-level/stats').then(r => r.data);
