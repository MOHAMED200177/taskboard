import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const client = axios.create({
  baseURL,
  withCredentials: true, // send the httpOnly refresh_token cookie
});

let accessToken = null;
let onUnauthorized = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function setOnUnauthorized(fn) {
  onUnauthorized = fn;
}

client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = client.post('/auth/refresh').finally(() => {
            refreshPromise = null;
          });
        }
        const { data } = await refreshPromise;
        setAccessToken(data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return client(original);
      } catch (refreshError) {
        setAccessToken(null);
        if (onUnauthorized) onUnauthorized();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export function extractErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (Array.isArray(data.message)) return data.message.join(', ');
  if (typeof data.message === 'string') return data.message;
  return fallback;
}
