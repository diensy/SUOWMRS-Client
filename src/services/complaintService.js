import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || '/api') + '/complaints';

export async function submitComplaint(complaintData) {
  const token = localStorage.getItem('suowmrs-token');
  const res = await axios.post(API_BASE, complaintData, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function getComplaints(status = 'All', priority = 'All', search = '') {
  const res = await axios.get(API_BASE, {
    params: { status, priority, search },
  });
  return res.data;
}

export async function updateComplaint(id, payload) {
  const token = localStorage.getItem('suowmrs-token');
  const res = await axios.patch(`${API_BASE}/${id}`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}
