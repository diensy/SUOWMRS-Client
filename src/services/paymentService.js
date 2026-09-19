import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const paymentApi = axios.create({
  baseURL: `${API_BASE_URL}/payments`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token
paymentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('suowmrs-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

paymentApi.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(new Error(err.response?.data?.error || err.message || 'Payment error'))
);

// ── Plans ──
export const fetchPlans = async () => {
  const res = await paymentApi.get('/plans');
  return res.data.plans;
};

// ── One-time Payment Intent ──
export const createPaymentIntent = async (planType, customAmount) => {
  const res = await paymentApi.post('/create-intent', { planType, customAmount });
  return res.data; // { clientSecret, paymentId, publishableKey }
};

// ── AMC Subscription ──
export const createSubscription = async (planType) => {
  const res = await paymentApi.post('/subscribe', { planType });
  return res.data; // { subscriptionId, clientSecret, status, paymentId, publishableKey }
};

// ── Cancel Subscription ──
export const cancelSubscription = async () => {
  const res = await paymentApi.post('/cancel-subscription');
  return res.data;
};

// ── Payment History ──
export const fetchPaymentHistory = async () => {
  const res = await paymentApi.get('/history');
  return res.data.payments;
};

// ── Active Subscription ──
export const fetchActiveSubscription = async () => {
  const res = await paymentApi.get('/subscription');
  return res.data.subscription;
};

// ── Invoice by ID ──
export const fetchInvoice = async (paymentId) => {
  const res = await paymentApi.get(`/invoice/${paymentId}`);
  return res.data.payment;
};

// ── Retry Failed Payment ──
export const retryPayment = async (paymentId) => {
  const res = await paymentApi.post(`/retry/${paymentId}`);
  return res.data;
};

// ── Manual Confirm (demo/test without Stripe CLI webhook) ──
export const confirmPaymentManual = async (paymentId, planType) => {
  const res = await paymentApi.post('/confirm-manual', { paymentId, planType });
  return res.data;
};

// ── Customer Summary & System DB Info (Sections 5 & 7) ──
export const fetchCustomerSummary = async () => {
  const res = await paymentApi.get('/my-summary');
  return res.data;
};

// ── Alternative Payment (UPI / UPI AutoPay / Net Banking) ──
export const processAlternativePayment = async ({ planType, paymentMethod, upiId, bankName, customAmount }) => {
  const res = await paymentApi.post('/pay-alternative', { planType, paymentMethod, upiId, bankName, customAmount });
  return res.data;
};

// ── Toggle Auto-Pay Mandate ──
export const toggleAutoPay = async () => {
  const res = await paymentApi.post('/toggle-autopay');
  return res.data;
};

