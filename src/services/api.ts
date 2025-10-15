import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with base configuration
const API: AxiosInstance = axios.create({
  baseURL: (import.meta.env as any).VITE_API_BASE_URL || 'http://127.0.0.1:8001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const url = error.config?.url;
    
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied. Insufficient permissions.');
    } else if (error.response?.status === 404) {
      // Only show toast for 404 if it's not a token verification request
      if (!url?.includes('/v1/verify-token')) {
        toast.error('Resource not found.');
      }
      // Don't show toast for verify-token 404 as it's handled gracefully in auth service
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
// Export the configured axios instance
export const apiClient = API;

// Root API endpoint - GET /
export const rootApi = {
  // Health check / Welcome message - matches GET /
  getRoot: async (): Promise<string> => {
    console.log('🏠 Fetching root API response...');
    
    try {
      const response = await API.get<string>('/');
      console.log('✅ Root API response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching root API:', error);
      
      // Return fallback message if API is not available
      if (error.code === 'ECONNREFUSED' || error.response?.status === 404) {
        console.log('ℹ️ Root API not available, returning fallback message');
        return 'AI Calling Platform API - Backend Not Connected';
      }
      
      throw error;
    }
  },

  // API health check with additional details
  healthCheck: async (): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    timestamp: string;
    version?: string;
  }> => {
    console.log('🔍 Performing API health check...');
    
    try {
      const response = await rootApi.getRoot();
      
      return {
        status: 'healthy',
        message: response,
        timestamp: new Date().toISOString(),
        version: 'v1.0.0'
      };
    } catch (error: any) {
      console.error('❌ Health check failed:', error);
      
      return {
        status: 'unhealthy',
        message: 'Backend API is not accessible',
        timestamp: new Date().toISOString()
      };
    }
  }
};export default API;
