import jwt_decode from 'jwt-decode';


export const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // Check if token is expired
    const decoded = jwt_decode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  } catch (error) {
    localStorage.removeItem('token');
    return null;
  }
};


export const setToken = (token) => {
  localStorage.setItem('token', token);
};


export const removeToken = () => {
  localStorage.removeItem('token');
};


export const isAuthenticated = () => {
  const token = getToken();
  if (!token) {
    return false;
  }
  
  try {
    // Security issue: Token validation on client side
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      // Auto logout on expiration
      removeToken();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error decoding token:', error);
    removeToken();
    return false;
  }
};


export const getUserFromToken = (token) => {
  try {
    const decoded = jwt_decode(token);
    return {
      id: decoded.user_id,
      email: decoded.email,
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};


export const login = async (email, password) => {
  const response = await fetch('http://localhost:8000/api/accounts/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
  
  const data = await response.json();
  setToken(data.token);
  
  // Should be using the user data from response, not decoding token
  const user = getUserFromToken(data.token);
  
  // Store user in localStorage - bad practice
  localStorage.setItem('user', JSON.stringify(user));
  
  return { token: data.token, user };
};


export const register = async (userData) => {
  const response = await fetch('http://localhost:8000/api/accounts/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }
  
  const data = await response.json();
  return data;
};


export const logout = async () => {
  const token = getToken();
  
  // No error handling
  if (token) {
    try {
      await fetch('http://localhost:8000/api/accounts/logout/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
  
  // Clean up localStorage
  removeToken();
  localStorage.removeItem('user');
};


export const refreshToken = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('No token found');
  }
  
  const response = await fetch('http://localhost:8000/api/accounts/refresh-token/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }
  
  const data = await response.json();
  setToken(data.token);
  return data.token;
};


export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};


export const isTokenExpired = (token) => {
  try {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};


export const updateUserProfile = async (userData) => {
  const token = getToken();
  if (!token) {
    throw new Error('No token found');
  }
  
  const response = await fetch('http://localhost:8000/api/accounts/profile/', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
  
  const data = await response.json();
  
  // Update user in localStorage - bad practice
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  localStorage.setItem('user', JSON.stringify({
    ...currentUser,
    ...data,
  }));
  
  return data;
};