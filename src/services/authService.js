import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const authApi = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to outgoing requests
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('suowmrs-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async (formData) => {
  const res = await authApi.post('/register', formData);
  // Do not auto-login on register. User will be redirected to Login page.
  return res.data;
};

export const loginUser = async (credentials) => {
  const res = await authApi.post('/login', credentials);
  if (res.data.token) {
    localStorage.setItem('suowmrs-token', res.data.token);
    localStorage.setItem('suowmrs-user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('suowmrs-user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('suowmrs-token');
  const user = localStorage.getItem('suowmrs-user');
  return Boolean(token && user);
};

export const logoutUser = () => {
  localStorage.removeItem('suowmrs-token');
  localStorage.removeItem('suowmrs-user');
};

export const getMe = async () => {
  const res = await authApi.get('/me');
  if (res.data.user) {
    localStorage.setItem('suowmrs-user', JSON.stringify(res.data.user));
  }
  return res.data.user;
};

export const updateProfile = async (profileData) => {
  const res = await authApi.patch('/profile', profileData);
  if (res.data.user) {
    localStorage.setItem('suowmrs-user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const changePassword = async (passwordData) => {
  const res = await authApi.patch('/change-password', passwordData);
  return res.data;
};

export const getUsers = async (status = '', role = '') => {
  const params = {};
  if (status && status !== 'All') params.status = status;
  if (role && role !== 'All') params.role = role;
  const res = await authApi.get('/users', { params });
  return res.data;
};

export const updateUserStatus = async (id, status) => {
  const res = await authApi.patch(`/users/${id}/status`, { status });
  return res.data;
};
