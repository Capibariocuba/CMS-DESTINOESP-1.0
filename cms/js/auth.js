/**
 * Destino España Admin - Autenticación Frontend
 * Manejo de JWT en LocalStorage y redirecciones
 */

const ALLOWED_EMAIL = 'eblito.lopez@gmail.com';
const TOKEN_KEY = 'destino_espana_jwt';
const USER_KEY = 'destino_espana_user';

window.Auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    // Verificar si el token JWT no ha expirado
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        this.clearSession();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  checkAuthOrRedirect() {
    // Verificar si viene un token en el hash de la URL post-OAuth
    const hash = window.location.hash;
    if (hash.includes('auth_token=')) {
      const match = hash.match(/auth_token=([^&]+)/);
      if (match) {
        const token = match[1];
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.setSession(token, {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
          });
          // Limpiar hash de la URL
          history.replaceState(null, document.title, window.location.pathname);
        } catch (e) {
          console.error('Error procesando token:', e);
        }
      }
    }

    if (!this.isAuthenticated()) {
      // Si estamos en desarrollo local y se desea modo demo o login
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalDev && !this.getToken()) {
        // Inicializar con usuario autorizado de desarrollo
        this.setSession('demo_token', {
          email: ALLOWED_EMAIL,
          name: 'Administrador Demo',
          picture: '',
        });
        return;
      }

      window.location.href = 'login.html';
    }
  },

  loginWithGoogle() {
    const apiUrl = window.API?.getBaseUrl() || '';
    window.location.href = `${apiUrl}/api/auth/google`;
  },

  async logout() {
    try {
      if (window.API) {
        await window.API.post('/api/auth/logout', {});
      }
    } catch (e) {
      console.warn('Logout network error:', e);
    }
    this.clearSession();
    window.location.href = 'login.html';
  }
};
