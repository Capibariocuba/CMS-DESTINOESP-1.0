/**
 * Destino España Admin - API Client
 * Intermediario HTTP hacia Cloudflare Worker / R2
 */

window.API = {
  getBaseUrl() {
    // Si se especifica una URL personalizada del worker en localStorage
    const customWorkerUrl = localStorage.getItem('destino_worker_url');
    if (customWorkerUrl) return customWorkerUrl.replace(/\/$/, '');

    // Si estamos en Cloudflare Pages / mismo origen
    if (window.location.hostname.includes('workers.dev') || window.location.hostname.includes('pages.dev')) {
      return '';
    }

    return '';
  },

  async request(endpoint, options = {}) {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    const token = window.Auth?.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Para enviar cookies HttpOnly
      });

      if (response.status === 401) {
        window.Auth?.clearSession();
        window.location.href = 'login.html?error=' + encodeURIComponent('Sesión expirada. Por favor inicie sesión.');
        throw new Error('Sesión no autorizada');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || `Error HTTP ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
};
