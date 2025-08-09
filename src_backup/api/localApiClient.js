// Local API Client for Finance Flow
// Replaces Base44 SDK with local PostgreSQL backend calls
// Backend URL from ENVIRONMENT_NOTES.md: http://localhost:3001

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API Client class
class LocalApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('auth_token');
  }

  // Generic HTTP request method
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authentication token if available
    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid response format: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  }

  // HTTP Methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.post('/api/auth/login', { email, password });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(email, password, name) {
    const response = await this.post('/api/auth/register', { email, password, name });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    try {
      await this.post('/api/auth/logout');
    } catch (error) {
      // Continue with logout even if server request fails
      console.warn('Logout request failed:', error.message);
    }
    this.setToken(null);
  }

  async getCurrentUser() {
    return this.get('/api/auth/me');
  }

  // Entity service factory
  createEntityService(entityName) {
    const basePath = `/api/${entityName.toLowerCase()}`;
    
    return {
      // List entities with optional filtering and pagination
      list: async (options = {}) => {
        const { page = 1, limit = 50, orderBy, ...filters } = options;
        const params = { page, limit, ...filters };
        
        if (orderBy) {
          params.orderBy = JSON.stringify(orderBy);
        }
        
        return this.get(basePath, params);
      },

      // Get single entity by ID
      findById: async (id) => {
        return this.get(`${basePath}/${id}`);
      },

      // Create new entity
      create: async (data) => {
        return this.post(basePath, data);
      },

      // Update entity by ID
      update: async (id, data) => {
        return this.put(`${basePath}/${id}`, data);
      },

      // Delete entity by ID
      delete: async (id) => {
        return this.delete(`${basePath}/${id}`);
      },

      // Bulk operations
      createMany: async (dataArray) => {
        return this.post(`${basePath}/bulk`, { items: dataArray });
      },

      // Custom entity-specific endpoints
      custom: async (action, data = {}, method = 'POST') => {
        const endpoint = `${basePath}/${action}`;
        switch (method.toUpperCase()) {
          case 'GET':
            return this.get(endpoint, data);
          case 'POST':
            return this.post(endpoint, data);
          case 'PUT':
            return this.put(endpoint, data);
          case 'DELETE':
            return this.delete(endpoint);
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }
      }
    };
  }
}

// Create and export the singleton API client instance
export const apiClient = new LocalApiClient();

// Export default for easy importing
export default apiClient;