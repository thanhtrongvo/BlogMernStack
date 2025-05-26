import apiClient from './apiClient';
import type { User, AuthTokens } from '../types';

// Re-export User type for convenience
export type { User } from '../types';

// Token storage keys
const ACCESS_TOKEN_KEY = 'blogAccessToken';
const REFRESH_TOKEN_KEY = 'blogRefreshToken';
const USER_KEY = 'blogUser';

interface RefreshResponse {
  accessToken: string;
}

// Store tokens and user data
export const storeAuth = (tokens: AuthTokens, user: User): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Get access token
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Get refresh token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Get user data
export const getUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

// Clear auth data (for logout)
export const clearAuth = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Update access token (after refresh)
export const updateAccessToken = (newToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// API endpoints for authentication
export const AUTH_API = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh-token',
  LOGOUT: '/api/auth/logout',
  LOGOUT_ALL: '/api/auth/logout-all',
};

// Refresh access token function
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return null;
  }
  
  try {
    const response = await apiClient.post<RefreshResponse>(AUTH_API.REFRESH, { 
      refreshToken 
    });
    
    const { accessToken } = response.data;
    updateAccessToken(accessToken);
    return accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearAuth(); // Clear auth on refresh failure
    return null;
  }
};

// Create an axios instance or fetch wrapper with token refresh capabilities
// This is where you would add interceptors to automatically refresh tokens
