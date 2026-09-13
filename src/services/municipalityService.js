import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || '/api') + '/municipality';

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
