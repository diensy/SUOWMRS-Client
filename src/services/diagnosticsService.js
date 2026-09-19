import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('suowmrs-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Diagnostics APIs ──
export const getDiagnosticsOverview = async () => {
  const res = await api.get('/diagnostics/overview');
  return res.data;
};

export const getEsp32Diagnostics = async () => {
  const res = await api.get('/diagnostics/esp32');
  return res.data;
};

export const rebootEsp32 = async () => {
  const res = await api.post('/diagnostics/reboot');
  return res.data;
};

export const pingEsp32 = async () => {
  const res = await api.post('/diagnostics/ping');
  return res.data;
};

export const getSensorsDiagnostics = async () => {
  const res = await api.get('/diagnostics/sensors');
  return res.data;
};

export const getComponentsDiagnostics = async () => {
  const res = await api.get('/diagnostics/components');
  return res.data;
};

export const calibrateSensor = async (id) => {
  const res = await api.post(`/diagnostics/calibrate/${id}`);
  return res.data;
};

// ── Work Order APIs ──
export const getWorkOrders = async (status = '', priority = '') => {
  const params = {};
  if (status && status !== 'All') params.status = status;
  if (priority && priority !== 'All') params.priority = priority;
  const res = await api.get('/work-orders', { params });
  return res.data;
};

export const createWorkOrder = async (orderData) => {
  const res = await api.post('/work-orders', orderData);
  return res.data;
};

export const updateWorkOrder = async (id, updateData) => {
  const res = await api.patch(`/work-orders/${id}`, updateData);
  return res.data;
};
