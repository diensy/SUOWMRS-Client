import api from './api.js';
export const getTreatmentCurrent = () => api.get('/treatment/current').then(r => r.data);
