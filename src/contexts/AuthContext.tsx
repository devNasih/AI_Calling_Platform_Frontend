import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '../types';
import { authService } from '../services/auth';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app start
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication...');
        const currentUser = authService.getCurrentUser();
        const isAuth = authService.isAuthenticated();
        
        console.log('👤 Current user from localStorage:', currentUser);
        console.log('🔐 Is authenticated (with token expiry check):', isAuth);
        
        if (isAuth && currentUser) {
          // Check if token exists and is not expired (basic validation)
          const token = authService.getToken();
          console.log('🎫 Token exists:', !!token);
          
          if (token) {
            try {
              // Try to decode JWT to check expiration
              const payload = JSON.parse(atob(token.split('.')[1]));
              const currentTime = Math.floor(Date.now() / 1000);
              
              console.log('⏰ Token expiry:', new Date(payload.exp * 1000));
              console.log('⏰ Current time:', new Date(currentTime * 1000));
              console.log('✅ Token valid:', payload.exp > currentTime);
              
              if (payload.exp && payload.exp > currentTime) {
                // Token is not expired, set user
                console.log('✅ Setting user - token is valid');
                setUser(currentUser);
              } else {
                // Token is expired, clear auth data
                console.log('❌ Token expired, clearing auth data');
                authService.logout();
              }
            } catch (tokenError) {
              console.warn('⚠️  Token parsing failed, trying backend verification:', tokenError);
              // If token parsing fails, try to verify with backend
              try {
                const isValidToken = await authService.verifyToken();
                if (isValidToken) {
                  console.log('✅ Backend verification successful, setting user');
                  setUser(currentUser);
                } else {
                  console.log('❌ Backend verification failed, clearing auth data');
                  authService.logout();
                }
              } catch (verifyError: any) {
                // If verify endpoint doesn't exist (404) or network error, 
                // assume token is still valid for offline mode
                if (verifyError.response?.status === 404) {
                  console.warn('⚠️  Token verification endpoint not available (404), using local auth');
                  setUser(currentUser);
                } else {
                  console.warn('⚠️  Token verification failed, assuming offline mode:', verifyError.message);
                  setUser(currentUser);
                }
              }
            }
          } else {
            console.log('❌ No token found, clearing auth');
            authService.logout();
          }
        } else {
          console.log('❌ No authentication found');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        authService.logout();
      } finally {
        console.log('🏁 Auth initialization complete');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // Empty dependency array to run only once

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      const authResponse = await authService.login(credentials);
      setUser(authResponse.user);
      toast.success('Login successful!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    authService.logout();
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
