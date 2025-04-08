import { getToken } from './auth';

export const createAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const apiRequest = async (url, options = {}) => {
  const headers = createAuthHeaders();
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (response.status === 403) {
    
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized access');
  }

  return response;
}; 