import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 AuthContext: Initializing auth...');
      const token = localStorage.getItem('token');
      console.log('🔍 AuthContext: Token found in localStorage:', token ? 'Yes' : 'No');

      if (token) {
        try {
          console.log('🔄 AuthContext: Fetching user profile...');
          const userData = await authService.getProfile();
          console.log('✅ AuthContext: Profile data received', userData);

          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: userData, token },
          });
          console.log('✅ AuthContext: Auth initialized successfully');
        } catch (error) {
          console.error('❌ AuthContext: Profile fetch failed', error);
          localStorage.removeItem('token');
          dispatch({ type: 'LOGIN_FAILURE' });
        }
      } else {
        console.log('ℹ️ AuthContext: No token found, setting loading to false');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔄 AuthContext: Starting login for', email);
      dispatch({ type: 'LOGIN_START' });

      const data = await authService.login(email, password);
      console.log('✅ AuthContext: Login response received', data);

      localStorage.setItem('token', data.token);

      // Create user object from response data
      const user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role
      };

      console.log('👤 AuthContext: User object created', user);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: data.token },
      });

      console.log('✅ AuthContext: Login success dispatched');
      return { success: true, user };
    } catch (error) {
      console.error('❌ AuthContext: Login failed', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const data = await authService.register(userData);

      localStorage.setItem('token', data.token);

      // Create user object from response data
      const user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role
      };

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: data.token },
      });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    loading: state.isLoading, // Alias for compatibility
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
