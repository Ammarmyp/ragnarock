/**
 * Axios Client Configuration
 * Centralized HTTP client for all API requests
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse, ApiError } from '@/types';

// Base API URL - configure via environment variable
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor
 * Adds authentication token and other headers to outgoing requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get auth token from localStorage or cookie (when auth is implemented)
    // const token = localStorage.getItem('authToken');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles successful responses and errors globally
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login (when auth is implemented)
          // localStorage.removeItem('authToken');
          // window.location.href = '/login';
          console.warn('Unauthorized access - 401');
          break;

        case 403:
          // Forbidden
          console.warn('Forbidden access - 403');
          break;

        case 404:
          // Not found
          console.warn('Resource not found - 404');
          break;

        case 422:
          // Validation error
          console.warn('Validation error - 422', error.response.data);
          break;

        case 500:
          // Server error
          console.error('Server error - 500');
          break;

        case 503:
          // Service unavailable
          console.error('Service unavailable - 503');
          break;

        default:
          console.error(`API Error - ${status}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to extract error message from API error
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Helper function to check if error is an API error
 */
export function isApiError(error: unknown): error is AxiosError<ApiError> {
  return axios.isAxiosError(error);
}

export default apiClient;
