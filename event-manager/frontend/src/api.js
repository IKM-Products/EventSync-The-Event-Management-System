const BASE_URL = 'http://127.0.0.1:5000/api';

const request = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.msg || 'Something went wrong');
  }
  return response.json();
};

export const api = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getEvents: (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return request(`/events?${query}`);
  },
  getStats: () => request('/events/stats'),
  createEvent: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),
};
