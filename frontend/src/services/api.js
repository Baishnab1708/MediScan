import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header to requests if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common error scenarios
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors globally (token expired, etc.)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // You might want to redirect to login page here
    }
    return Promise.reject(error);
  }
);

// Helper function to convert object to form-urlencoded format
const toFormUrlEncoded = (obj) => {
  return Object.entries(obj)
    .map(
      ([key, val]) =>
        encodeURIComponent(key) + "=" + encodeURIComponent(val)
    )
    .join("&");
};

// Helper function to extract error message from response
const extractErrorMessage = (error, defaultMessage) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  } else if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    // Customize the network error message
    if (error.message === "Network Error") {
      return "Unable to connect to the server. Please check your internet connection or try again later.";
    }
    return error.message;
  }
  return defaultMessage;
};

// Authentication APIs
export const login = async (credentials) => {
  try {
    // Use form-urlencoded format as expected by OAuth2PasswordRequestForm
    const response = await api.post('/auth/login', 
      toFormUrlEncoded({
        username: credentials.username || credentials.email,
        password: credentials.password,
      }), 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    // Store token in localStorage
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Login failed');
    throw new Error(errorMessage);
  }
};

export const signup = async (userData) => {
  try {
    const response = await api.post('/auth/signup', {
      name: userData.username,
      username: userData.username,
      email: userData.email,
      password: userData.password,
    });
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Signup failed');
    throw new Error(errorMessage);
  }
};

// Medicine extraction API (matches your test endpoint)
export const extractMedicine = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/medicine/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Failed to extract medicine details');
    throw new Error(errorMessage);
  }
};

// Legacy alias for backwards compatibility
export const uploadPrescription = extractMedicine;

// Utility function to clear stored token
export const logout = () => {
  localStorage.removeItem('token');
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export default api;