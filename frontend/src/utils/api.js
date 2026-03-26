// API Configuration for MERN Stack Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise} Response data
 */
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `API Error: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

/**
 * GET request
 */
export const get = (endpoint) => {
  return apiCall(endpoint, { method: 'GET' })
}

/**
 * POST request
 */
export const post = (endpoint, data) => {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * PUT request
 */
export const put = (endpoint, data) => {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * PATCH request
 */
export const patch = (endpoint, data) => {
  return apiCall(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * DELETE request
 */
export const remove = (endpoint) => {
  return apiCall(endpoint, { method: 'DELETE' })
}

// ============ API ENDPOINTS ============

// Products
export const productsAPI = {
  getAll: () => get('/products'),
  getById: (id) => get(`/products/${id}`),
  create: (data) => post('/products', data),
  update: (id, data) => put(`/products/${id}`, data),
  delete: (id) => remove(`/products/${id}`),
  search: (query) => get(`/products?search=${query}`),
}

// Orders
export const ordersAPI = {
  getAll: () => get('/orders'),
  getById: (id) => get(`/orders/${id}`),
  create: (data) => post('/orders', data),
  update: (id, data) => put(`/orders/${id}`, data),
  delete: (id) => remove(`/orders/${id}`),
  updateStatus: (id, status) => patch(`/orders/${id}`, { status }),
}

// Feedbacks/Reviews
export const feedbacksAPI = {
  getAll: () => get('/feedbacks'),
  getById: (id) => get(`/feedbacks/${id}`),
  reply: (id, data) => post(`/feedbacks/${id}/reply`, data),
  delete: (id) => remove(`/feedbacks/${id}`),
}

// Discounts
export const discountsAPI = {
  getAll: () => get('/discounts'),
  getById: (id) => get(`/discounts/${id}`),
  create: (data) => post('/discounts', data),
  update: (id, data) => put(`/discounts/${id}`, data),
  delete: (id) => remove(`/discounts/${id}`),
  validateCode: (code) => get(`/discounts/validate/${code}`),
}

// Staff/Admin
export const staffAPI = {
  getAll: () => get('/staff'),
  getById: (id) => get(`/staff/${id}`),
  create: (data) => post('/staff', data),
  update: (id, data) => put(`/staff/${id}`, data),
  delete: (id) => remove(`/staff/${id}`),
  changeRole: (id, role) => patch(`/staff/${id}`, { role }),
}

// Auth
export const authAPI = {
  login: (credentials) => post('/auth/login', credentials),
  logout: () => post('/auth/logout', {}),
  getCurrentUser: () => get('/auth/me'),
  updateProfile: (data) => put('/auth/profile', data),
  changePassword: (data) => post('/auth/change-password', data),
}

// Dashboard
export const dashboardAPI = {
  getStats: () => get('/dashboard/stats'),
  getSalesData: () => get('/dashboard/sales'),
  getRecentOrders: () => get('/dashboard/recent-orders'),
  getFeaturedProducts: () => get('/dashboard/featured-products'),
}

export default {
  get,
  post,
  put,
  patch,
  remove,
  apiCall,
  productsAPI,
  ordersAPI,
  feedbacksAPI,
  discountsAPI,
  staffAPI,
  authAPI,
  dashboardAPI,
}
