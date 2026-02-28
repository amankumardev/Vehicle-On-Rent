// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get JWT token
function getToken() {
    return localStorage.getItem('token');
}

// Helper function to set auth header
function getAuthHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

// Authenticated API fetch wrapper
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// API Methods
const API = {
    // Auth
    register: (userData) => apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),

    login: (credentials) => apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),

    getProfile: () => apiFetch('/auth/me'),

    updateProfile: (data) => apiFetch('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    // Vehicles
    getVehicles: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`/vehicles${query ? '?' + query : ''}`);
    },

    getVehicle: (id) => apiFetch(`/vehicles/${id}`),

    checkAvailability: (id, dates) => apiFetch(`/vehicles/${id}/check-availability`, {
        method: 'POST',
        body: JSON.stringify(dates)
    }),

    // Bookings
    createBooking: (bookingData) => apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
    }),

    getUserBookings: () => apiFetch('/bookings/user'),

    getBooking: (id) => apiFetch(`/bookings/${id}`),

    cancelBooking: (id) => apiFetch(`/bookings/${id}/cancel`, {
        method: 'PUT'
    }),

    // Payments
    createPaymentIntent: (bookingId) => apiFetch('/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({ bookingId })
    }),

    confirmPayment: (paymentIntentId, bookingId) => apiFetch('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({ paymentIntentId, bookingId })
    }),

    getPaymentDetails: (bookingId) => apiFetch(`/payments/${bookingId}`)
};
