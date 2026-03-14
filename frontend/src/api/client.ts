import axios from 'axios';

const ACCESS_TOKEN_KEY = 'cl_access';
const REFRESH_TOKEN_KEY = 'cl_refresh';

let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(fn: () => void) {
  logoutCallback = fn;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.url?.includes('token/refresh')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('auth/login') || originalRequest.url?.includes('auth/register')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(client(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      logoutCallback?.();
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/auth/token/refresh/`, {
        refresh: refreshToken,
      });
      setTokens(data.access, refreshToken);
      processQueue(null, data.access);
      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      return client(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      logoutCallback?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
