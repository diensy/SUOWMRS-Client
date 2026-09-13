import api from './api.js';
export const getAlerts = (page = 1, limit = 10) => api.get(`/alerts?page=${page}&limit=${limit}`).then(r => r.data);
export const getUnreadCount = () => api.get('/alerts/unread-count').then(r => r.data);
export const markAlertRead = (id) => api.patch(`/alerts/${id}/read`).then(r => r.data);
export const markAllAlertsRead = () => api.patch('/alerts/mark-all-read').then(r => r.data);
