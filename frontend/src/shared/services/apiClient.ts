import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { AxiosHeaders } from "axios";
import { getAccessToken, refreshAccessToken, clearAuth } from "./auth";

// Create base axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Extend InternalAxiosRequestConfig to include retry flag
interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig;
}[] = [];

// Process the queue of failed requests
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      if (
        promise.config.headers &&
        typeof promise.config.headers.set === "function"
      ) {
        promise.config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        // Fallback for older Axios versions or if headers is not an object with set method
        const config = promise.config as InternalAxiosRequestConfig;
        config.headers = new AxiosHeaders({
          ...config.headers,
          Authorization: `Bearer ${token}`,
        });
      }
      promise.resolve(apiClient(promise.config));
    }
  });

  failedQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If original request doesn't exist, reject
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If error is not 401 or request has already been retried, reject
    if (
      error.response?.status !== 401 ||
      (originalRequest as RetryableAxiosRequestConfig)._retry
    ) {
      // Handle account disabled (status 403 with specific message)
      const errorData = error.response?.data as { message?: string };
      if (
        error.response?.status === 403 &&
        errorData?.message &&
        errorData.message.includes("Tài khoản của bạn đã bị vô hiệu hóa")
      ) {
        // Clear auth and redirect to admin login
        clearAuth();
        window.location.href = "/admin/login";
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // If already refreshing, add to queue
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
          config: originalRequest,
        });
      });
    }

    // Mark as refreshing and as retried
    isRefreshing = true;
    (originalRequest as RetryableAxiosRequestConfig)._retry = true;

    try {
      // Try to refresh the token
      const newToken = await refreshAccessToken();

      if (newToken) {
        // Update the authorization header
        if (originalRequest.headers) {
          originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        }

        // Process any queued requests
        processQueue(null, newToken);

        // Retry the original request
        return apiClient(originalRequest);
      } else {
        // Clear auth state and reject requests if refresh fails
        clearAuth();
        processQueue(new Error("Failed to refresh token"));

        // Redirect to admin login
        window.location.href = "/admin/login";

        return Promise.reject(error);
      }
    } catch (refreshError) {
      // Clear auth state on refresh error
      clearAuth();
      processQueue(refreshError as Error);

      // Redirect to admin login
      window.location.href = "/admin/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
