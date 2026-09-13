import api from './api.js';

export const getTreatmentCurrent = () => api.get('/treatment/current').then(r => r.data);

export const toggleFiltration = (status, userRole) =>
  api.post('/treatment/filtration', { status, userRole }).then(r => r.data);

export const controlGardeningWatering = (action, volume = 200) =>
  api.post('/treatment/gardening', { action, volume }).then(r => r.data);

