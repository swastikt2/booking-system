import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('tn_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('tn_refresh');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh-token`, { refreshToken });
          localStorage.setItem('tn_token', data.accessToken);
          localStorage.setItem('tn_refresh', data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api.request(error.config);
        } catch {
          localStorage.removeItem('tn_token');
          localStorage.removeItem('tn_refresh');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Search
export const searchAPI = {
  flights: (params) => api.get('/search/flights', { params }),
  hotels: (params) => api.get('/search/hotels', { params }),
  trains: (params) => api.get('/search/trains', { params }),
  buses: (params) => api.get('/search/buses', { params }),
  flightCalendar: (params) => api.get('/search/flights/calendar', { params }),
  autocomplete: (q, type = 'city') => api.get('/search/autocomplete', { params: { q, type } }),
};

// Flights
export const flightAPI = {
  get: (id) => api.get(`/flights/${id}`),
  seats: (id) => api.get(`/flights/${id}/seats`),
  priceTrend: (id) => api.get(`/flights/${id}/price-trend`),
};

// Buses
export const busAPI = {
  get: (id) => api.get(`/buses/${id}`),
  seats: (id) => api.get(`/buses/${id}/seats`),
};

// Trains
export const trainAPI = {
  get: (id) => api.get(`/trains/${id}`),
  seats: (id) => api.get(`/trains/${id}/seats`),
};

// Hotels
export const hotelAPI = {
  get: (id) => api.get(`/hotels/${id}`),
  rooms: (id) => api.get(`/hotels/${id}/rooms`),
  reviews: (id, params) => api.get(`/hotels/${id}/reviews`, { params }),
  addReview: (id, data) => api.post(`/hotels/${id}/reviews`, data),
  priceTrend: (id) => api.get(`/hotels/${id}/price-trend`),
};

// Bookings
export const bookingAPI = {
  hold: (data) => api.post('/bookings/hold', data),
  create: (data) => api.post('/bookings/create', data),
  myBookings: (params) => api.get('/bookings/my-bookings', { params }),
  get: (ref) => api.get(`/bookings/${ref}`),
  cancel: (ref) => api.put(`/bookings/${ref}/cancel`),
};

// Payments
export const paymentAPI = {
  initiate: (data) => api.post('/payments/initiate', data),
  status: (txnId) => api.get(`/payments/${txnId}/status`),
  verify: (txnId) => api.post(`/payments/${txnId}/verify`),
  refund: (bookingId) => api.post('/payments/refund', { bookingId }),
};

// Users
export const userAPI = {
  savedSearches: () => api.get('/users/saved-searches'),
  saveSearch: (data) => api.post('/users/save-search', data),
  wishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (hotelId) => api.post(`/users/wishlist/${hotelId}`),
  loyaltyPoints: () => api.get('/users/loyalty-points'),
};

// Admin
export const adminAPI = {
  stats: () => api.get('/admin/dashboard/stats'),
  bookings: (params) => api.get('/admin/bookings', { params }),
  updateBookingStatus: (id, status) => api.put(`/admin/bookings/${id}/status`, { status }),
  priceLogs: (params) => api.get('/admin/price-logs', { params }),
  seedData: () => api.post('/admin/seed-data'),
};

export default api;
