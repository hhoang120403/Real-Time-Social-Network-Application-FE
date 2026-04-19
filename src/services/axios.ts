import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_BASE_ENDPOINT}/api/v1`;
const AUTH_TRANSITION_KEY = 'authTransitionInProgress';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

export const startAuthTransition = () => {
  sessionStorage.setItem(AUTH_TRANSITION_KEY, 'true');
};

export const clearAuthTransition = () => {
  sessionStorage.removeItem(AUTH_TRANSITION_KEY);
};

export const isAuthTransitionInProgress = () => {
  return sessionStorage.getItem(AUTH_TRANSITION_KEY) === 'true';
};
