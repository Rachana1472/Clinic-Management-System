import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
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

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string; userType: string }) =>
    api.post('/auth/login', data),
  
  registerUser: (data: any) =>
    api.post('/auth/register/user', data),
  
  registerTherapist: (data: any) =>
    api.post('/auth/register/therapist', data),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
};

// User API
export const userAPI = {
  getProfile: () =>
    api.get('/user/profile'),
  
  updateProfile: (data: FormData) =>
    api.put('/user/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  changePassword: (data: any) =>
    api.put('/user/change-password', data),
  
  getTherapists: (params?: any) =>
    api.get('/user/therapists', { params }),
  
  getTherapistDetails: (id: string) =>
    api.get(`/user/therapists/${id}`),
  
  getAppointments: (params?: any) =>
    api.get('/user/appointments', { params }),
  
  getAppointmentDetails: (id: string) =>
    api.get(`/user/appointments/${id}`),
  
  reviewAppointment: (id: string, data: any) =>
    api.post(`/user/appointments/${id}/review`, data),
};

// Therapist API
export const therapistAPI = {
  getProfile: () =>
    api.get('/therapist/profile'),
  
  updateProfile: (data: any) =>
    api.put('/therapist/profile', data),
  
  updateAvailability: (data: any) =>
    api.put('/therapist/availability', data),
  
  getAppointments: (params?: any) =>
    api.get('/therapist/appointments', { params }),
  
  updateAppointmentStatus: (id: string, data: any) =>
    api.put(`/therapist/appointments/${id}/status`, data),
  
  getDashboardStats: () =>
    api.get('/therapist/dashboard'),
  
  getAnalytics: (params?: any) =>
    api.get('/therapist/analytics', { params }),
  
  getReviews: () =>
    api.get('/therapist/reviews'),
};

// Admin API
export const adminAPI = {
  getUsers: (params?: any) =>
    api.get('/admin/users', { params }),
  
  getTherapists: (params?: any) =>
    api.get('/admin/therapists', { params }),
  
  verifyTherapist: (id: string) =>
    api.put(`/admin/therapists/${id}/verify`),
  
  toggleUserStatus: (id: string, userType: string) =>
    api.put(`/admin/users/${id}/toggle-status`, null, { params: { userType: userType.toLowerCase() } }),
  
  getAnalytics: (params?: any) =>
    api.get('/admin/analytics', { params }),
  
  getChatbotAnalytics: (params?: any) =>
    api.get('/admin/chatbot-analytics', { params }),
  
  changePassword: (data: any) =>
    api.put('/admin/change-password', data),
  
  updateUser: (id: string, data: any) =>
    api.put(`/admin/users/${id}`, data),
  
  updateTherapist: (id: string, data: any) =>
    api.put(`/admin/therapists/${id}`, data),
  
  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`),
  
  deleteTherapist: (id: string) =>
    api.delete(`/admin/therapists/${id}`),
};

// Appointment API
export const appointmentAPI = {
  bookAppointment: (data: any) =>
    api.post('/appointments/book', data),
  
  cancelAppointment: (id: string, data?: any) =>
    api.put(`/appointments/${id}/cancel`, data),
  
  getAvailableSlots: (therapistId: string, date: string) =>
    api.get(`/appointments/available-slots/${therapistId}`, { params: { date } }),
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (data: { message: string; sessionId?: string }) =>
    api.post('/chatbot/send', data),
  
  getHistory: (params?: any) =>
    api.get('/chatbot/history', { params }),
  
  getSessions: () =>
    api.get('/chatbot/sessions'),
};

// Notification API
export const notificationAPI = {
  getNotifications: () =>
    api.get('/notifications'),
  
  markAsRead: (id: string) =>
    api.post(`/notifications/${id}/read`),
};

export default api; 