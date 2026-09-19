// Dynamic API & Socket Endpoint Resolver
// Automatically switches between Local Server (http://localhost:5000 via /api proxy)
// and Production Cloud Server (https://suowmrs-server.onrender.com)

const isBrowser = typeof window !== 'undefined';

export const isLocalEnvironment =
  isBrowser &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.endsWith('.local'));

// In local mode, route requests to local API ('/api' proxied to http://localhost:5000)
// In production/deployment mode, route to Render server
export const API_BASE_URL = isLocalEnvironment
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'https://suowmrs-server.onrender.com/api');

export const SOCKET_BASE_URL = isLocalEnvironment
  ? 'http://localhost:5000'
  : (import.meta.env.VITE_SOCKET_URL || 'https://suowmrs-server.onrender.com');

export default {
  API_BASE_URL,
  SOCKET_BASE_URL,
  isLocalEnvironment,
};
