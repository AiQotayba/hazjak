// ------------- API MODULE (Backend Integration) -------------
// This file connects to the backend API at http://localhost:5000/api

const API_BASE_URL = 'http://localhost:5000/api';

const STORAGE_KEYS = {
  fields: 'hazjak_fields',
  bookings: 'hazjak_bookings',
  users: 'hazjak_users'
};

function getStoredItem(key, defaultValue) {
  const raw = localStorage.getItem(key);
  if (!raw) return defaultValue;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('localStorage parse error', error);
    return defaultValue;
  }
}

function setStoredItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initLocalStorageData() {
  if (!localStorage.getItem(STORAGE_KEYS.fields)) {
    setStoredItem(STORAGE_KEYS.fields, [
      { id: 1, name: 'ملعب الأولمبي الخماسي', location: 'حلب - حي الموكامبو', rating: 4.9, reviews: 124, price: 60000, image: 'https://images.unsplash.com/photo-1600066975952-912a81940822?q=80&w=2070&auto=format', available: true, statusTag: 'متاح الآن' },
      { id: 2, name: 'أكاديمية النجوم', location: 'حلب - المحافظة', rating: 4.7, reviews: 89, price: 55000, image: 'https://images.unsplash.com/photo-1547461056-317b672e08eb?q=80&w=2070&auto=format', available: false, statusTag: 'متاح لاحقا' },
      { id: 3, name: 'ملعب القمة', location: 'حلب - سيف الدولة', rating: 4.5, reviews: 210, price: 45000, image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070&auto=format', available: true, statusTag: 'متاح الآن' },
      { id: 4, name: 'استاد الباسل الرياضي', location: 'حلب - المعادي', rating: 4.8, reviews: 98, price: 70000, image: 'https://images.unsplash.com/photo-1575361204036-afd975d5ecef?q=80&w=2070&auto=format', available: true, statusTag: 'متاح الآن' },
      { id: 5, name: 'أرض الشجعان', location: 'حلب - السليمانية', rating: 4.6, reviews: 76, price: 52000, image: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?q=80&w=2070&auto=format', available: false, statusTag: 'متاح لاحقا' },
      { id: 6, name: 'ملعب السلطان', location: 'حلب - السلطان', rating: 4.4, reviews: 65, price: 48000, image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=2070&auto=format', available: true, statusTag: 'متاح الآن' },
      { id: 7, name: 'ملعب العلي', location: 'حلب - العلي', rating: 4.3, reviews: 52, price: 42000, image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2070&auto=format', available: true, statusTag: 'متاح الآن' },
      { id: 8, name: 'ملعب الريشي', location: 'حلب - الريشي', rating: 4.7, reviews: 88, price: 58000, image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2070&auto=format', available: false, statusTag: 'متاح لاحقا' }
    ]);
  }

  if (!localStorage.getItem(STORAGE_KEYS.bookings)) {
    setStoredItem(STORAGE_KEYS.bookings, {
      1: [
        { date: '2026-05-10', time: '08:00', status: 'booked' },
        { date: '2026-05-10', time: '09:30', status: 'deposit' },
        { date: '2026-05-11', time: '10:00', status: 'booked' }
      ],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: []
    });
  }

  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    setStoredItem(STORAGE_KEYS.users, []);
  }
}

const API = {
  init: async () => {
    initLocalStorageData();
  },

  getFields: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/fields`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching fields:', error);
      return { success: false, error: error.message };
    }
  },

  getBookings: async (fieldId) => {
    await API.init();
    const bookings = getStoredItem(STORAGE_KEYS.bookings, {});
    return bookings[fieldId] || [];
  },

  createBooking: async (bookingData) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('userToken');
      if (!token) {
        return { success: false, error: 'No token found. Please login first.' };
      }
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || `HTTP error! status: ${response.status}` };
      }
      return { success: true, message: data.message || 'تم حجز الملعب بنجاح!', booking: data.booking };
    } catch (error) {
      console.error('Error creating booking:', error);
      return { success: false, error: error.message };
    }
  },

  registerUser: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || `HTTP error! status: ${response.status}` };
      }
      return { success: true, message: data.message, token: data.token };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error: error.message };
    }
  },

  loginUser: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return { success: true, message: 'تم تسجيل الدخول بنجاح', token: data.token };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: error.message };
    }
  },

  sendWhatsAppConfirmation: async (bookingData) => {
    // محاكاة إرسال OTP للتجربة
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true, message: 'تم إرسال رمز التحقق عبر واتساب بنجاح', otp: '123456' }), 400);
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
} else {
  window.API = API;
}
