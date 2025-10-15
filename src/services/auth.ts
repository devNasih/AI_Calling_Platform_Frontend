import API from './api';
import { 
  LoginCredentials, 
  AuthResponse, 
  User, 
  Body_login_v1_login_post, 
  Token,
  HTTPValidationError 
} from '../types';

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('🔐 Login attempt...');
    
    if (!credentials.username || !credentials.password) {
      throw new Error('Username and password are required');
    }

    try {
      // Create form data as expected by the backend (application/x-www-form-urlencoded)
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', credentials.username.trim());
      formData.append('password', credentials.password.trim());
      formData.append('scope', ''); // Empty scope as shown in Swagger
      
      const response = await API.post<Token>('/v1/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      });
      
      console.log('✅ Login successful');
      console.log('✅ Response data:', response.data);
      
      // The backend returns access_token instead of token, so we need to adapt
      const authResponse: AuthResponse = {
        token: response.data.access_token,
        user: {
          id: '1', // You might need to get this from another endpoint
          email: credentials.username,
          name: 'User', // You might need to get this from another endpoint
          role: 'admin', // You might need to get this from the token or another endpoint
          createdAt: new Date().toISOString()
        }
      };
      
      // Store token and user data
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));

      return authResponse;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      // Handle HTTPValidationError from backend
      if (error.response?.data?.detail) {
        const validationError = error.response.data as HTTPValidationError;
        const errorMessage = validationError.detail
          .map(err => `${err.loc.join('.')}: ${err.msg}`)
          .join(', ');
        throw new Error(`Validation Error: ${errorMessage}`);
      }
      
      throw error;
    }
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Don't use window.location.href as it can cause issues with React Router
    // Let the AuthContext handle the navigation
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    return null;
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Check if token is expired (client-side validation)
  isTokenExpired: (token?: string): boolean => {
    try {
      const tokenToCheck = token || authService.getToken();
      if (!tokenToCheck) return true;

      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp ? payload.exp <= currentTime : false;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  },

  // Enhanced authentication check with token expiration
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    const user = authService.getCurrentUser();
    
    console.log('🔍 Checking authentication:', { hasToken: !!token, hasUser: !!user });
    
    if (!token || !user) {
      console.log('❌ Missing token or user data');
      return false;
    }
    
    // Check if token is expired
    if (authService.isTokenExpired(token)) {
      console.log('❌ Token expired, clearing auth data');
      authService.logout();
      return false;
    }
    
    console.log('✅ Authentication valid');
    return true;
  },

  // Verify token with backend (optional)
  verifyToken: async (): Promise<boolean> => {
    try {
      const response = await API.get('/v1/verify-token');
      return response.status === 200;
    } catch (error: any) {
      // If the endpoint doesn't exist (404), we can't verify but token might still be valid
      if (error.response?.status === 404) {
        console.warn('Token verification endpoint not available (404). Endpoint may not be implemented.');
        // Return true to indicate we should trust the local token for now
        return true;
      }
      // For other errors (401, 403, 500, etc.), the token is likely invalid
      console.error('Token verification failed:', error.response?.status, error.message);
      return false;
    }
  },

  // Refresh token (if implemented in backend)
  refreshToken: async (): Promise<string | null> => {
    try {
      const response = await API.post<{ token: string }>('/v1/refresh-token');
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        return response.data.token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return null;
  },
};
