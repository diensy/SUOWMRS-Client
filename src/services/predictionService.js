import api from './api';

/**
 * Phase 7: AI Flood Prediction Service Client
 */

export async function getLivePrediction() {
  const res = await api.get('/prediction/current');
  return res.data;
}

export async function getForecastTrend() {
  const res = await api.get('/prediction/forecast-trend');
  return res.data;
}

export async function getWardRiskPredictions() {
  const res = await api.get('/prediction/wards');
  return res.data;
}

export async function getWeatherTelemetry() {
  const res = await api.get('/prediction/weather');
  return res.data;
}

export async function getHistoricalDataset(params = {}) {
  const res = await api.get('/prediction/dataset', { params });
  return res.data;
}

export async function getAccuracyMetrics() {
  const res = await api.get('/prediction/accuracy');
  return res.data;
}

export async function getPredictionHistory(params = {}) {
  const res = await api.get('/prediction/history', { params });
  return res.data;
}

export async function dispatchEarlyAction(payload) {
  const res = await api.post('/prediction/action/dispatch', payload);
  return res.data;
}
