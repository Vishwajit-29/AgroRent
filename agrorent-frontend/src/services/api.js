import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Equipment APIs
export const equipmentApi = {
  getById: (id) => api.get(`/equipment/public/${id}`),
  getByCategory: (category) => api.get(`/equipment/public/category/${category}`),
  search: (params) => api.post('/equipment/search', params),
  getNearby: (lat, lng, radius = 50) => 
    api.get(`/equipment/search/nearby?latitude=${lat}&longitude=${lng}&radiusKm=${radius}`),
  getMyEquipment: () => api.get('/equipment/my'),
  create: (data) => api.post('/equipment/my', data),
  update: (id, data) => api.put(`/equipment/my/${id}`, data),
  deleteEquipment: (id) => api.delete(`/equipment/my/${id}`),
  toggleAvailability: (id) => api.patch(`/equipment/my/${id}/toggle-availability`),
};

// Booking APIs
export const bookingApi = {
  create: (data) => api.post('/bookings/create', data),
  getMyBookings: () => api.get('/bookings/my'),
  getRenterBookings: () => api.get('/bookings/renter'),
  getPendingRequests: () => api.get('/bookings/renter/pending'),
  approve: (id) => api.patch(`/bookings/renter/${id}/approve`),
  reject: (id, reason) => api.patch(`/bookings/renter/${id}/reject?reason=${reason || ''}`),
  start: (id) => api.patch(`/bookings/renter/${id}/start`),
  complete: (id) => api.patch(`/bookings/renter/${id}/complete`),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  rateAsRentTaker: (id, data) => api.post(`/bookings/my/${id}/rate`, data),
  rateAsRenter: (id, data) => api.post(`/bookings/renter/${id}/rate`, data),
  getById: (id) => api.get(`/bookings/${id}`),
};

// Categories API
export const categoryApi = {
  getAll: () => api.get('/categories'),
};

export default api;
