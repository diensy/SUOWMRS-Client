import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const API_BASE = `${API_BASE_URL}/municipality`;

export async function getMunicipalityOverview() {
  const res = await axios.get(`${API_BASE}/overview`);
  return res.data;
}

export async function getMunicipalitySystems(status = 'All', search = '', page = 1, limit = 10) {
  const res = await axios.get(`${API_BASE}/systems`, {
    params: { status, search, page, limit },
  });
  return res.data;
}

export async function getMunicipalityMapNodes() {
  const res = await axios.get(`${API_BASE}/map`);
  return res.data;
}

export async function getEmergencyData() {
  const res = await axios.get(`${API_BASE}/emergency`);
  return res.data;
}

export async function triggerFloodDiversion(systemId) {
  const res = await axios.post(`${API_BASE}/divert`, { systemId });
  return res.data;
}

