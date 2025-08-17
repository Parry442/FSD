import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Test Manager' | 'Tester' | 'Troubleshooter' | 'Viewer';
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token by fetching user profile
        const response = await axios.get('/api/auth/profile');
        setUser(response.data.user);
      }
    } catch (error) {
      // Token is invalid, remove it
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });

      const { token, user: userData } = response.data;

      // Store token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user
      setUser(userData);

      enqueueSnackbar('Login successful!', { variant: 'success' });
      return true;

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint
      await axios.post('/api/auth/logout');
    } catch (error) {
      // Ignore errors during logout
    } finally {
      // Clear local state
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      
      enqueueSnackbar('Logged out successfully', { variant: 'info' });
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      const response = await axios.put('/api/auth/profile', updates);
      setUser(response.data.user);
      
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
      return true;

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return false;
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });

      enqueueSnackbar('Password changed successfully!', { variant: 'success' });
      return true;

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to change password.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return false;
    }
  };

  // Context value
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export default
export default AuthContext;