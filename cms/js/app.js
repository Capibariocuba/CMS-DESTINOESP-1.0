/**
 * Destino España Admin - Controlador Principal App
 */

window.App = {
  activeSection: 'dashboard',

  init() {
    // 1. Validar sesión
    window.Auth?.checkAuthOrRedirect();

    // 2. Vincular navegación inferior
    this.bindNavigation();

    // 3. Vincular acciones globales de cabecera
    this.bindHeaderActions();

    // 4. Modal listeners
    this.bindModal();

    // 5. Cargar vista inicial
    this.navigateTo('dashboard');
  },

  bindNavigation() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        this.navigateTo(target);
      });
    });
  },

  bindHeaderActions() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        if (confirm('¿Deseas cerrar la sesión del panel administrativo?')) {
          window.Auth?.logout();
        }
      });
    }

    const btnVersions = document.getElementById('btn-open-versions');
    if (btnVersions) {
      btnVersions.addEventListener('click', () => {
        const currentMod = this.activeSection === 'dashboard' || this.activeSection === 'config' 
          ? 'cintillo' 
          : this.activeSection;
        window.VersionsModule?.openVersionsModal(currentMod);
      });
    }
  },

  bindModal() {
    const backdrop = document.getElementById('modal-backdrop');
    const btnClose = document.getElementById('btn-close-modal');

    if (btnClose) {
      btnClose.addEventListener('click', () => this.closeModal());
    }

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeModal();
      });
    }
  },

  openModal(title, htmlBody) {
    const backdrop = document.getElementById('modal-backdrop');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = htmlBody;
    if (backdrop) backdrop.classList.remove('hidden');
  },

  closeModal() {
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.classList.add('hidden');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  navigateTo(sectionId) {
    this.activeSection = sectionId;

    // Actualizar nav bar
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
      if (item.getAttribute('data-target') === sectionId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Ocultar todas las vistas
    document.querySelectorAll('.module-view').forEach(view => {
      view.classList.remove('active');
    });

    // Mostrar vista seleccionada
    const targetView = document.getElementById(`view-${sectionId}`);
    if (targetView) {
      targetView.classList.add('active');

      switch (sectionId) {
        case 'dashboard':
          window.DashboardModule?.render(targetView);
          break;
        case 'cintillo':
          window.CintilloModule?.render(targetView);
          break;
        case 'promociones':
          window.PromocionesModule?.render(targetView);
          break;
        case 'calculadora':
          window.CalculadoraModule?.render(targetView);
          break;
        case 'tramites':
          window.TramitesModule?.render(targetView);
          break;
        case 'config':
          this.renderConfig(targetView);
          break;
      }
    }

    window.scrollTo(0, 0);
  },

  reloadActiveModule() {
    this.navigateTo(this.activeSection);
  },

  renderConfig(container) {
    const user = window.Auth?.getUser() || { email: 'eblito.lopez@gmail.com', name: 'Administrador' };
    const customWorkerUrl = localStorage.getItem('destino_worker_url') || '';

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Configuración del Sistema</h2>
            <p class="card-subtitle">Administrador autorizado y parámetros de conexión</p>
          </div>
        </div>

        <div style="margin-bottom: 16px; padding: 14px; background: #FAFCFE; border-radius: 8px; border: 1px solid #E2E8F0;">
          <strong style="color: #0B1D3A; font-size: 14px;">Administrador Autenticado:</strong>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #EC1313; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">
              ${(user.name || 'A')[0]}
            </div>
            <div>
              <div style="font-weight: 700; color: #0B1D3A;">${user.name || 'Administrador'}</div>
              <code style="font-size: 12.5px; color: #64748B;">${user.email}</code>
            </div>
          </div>
        </div>

        <form id="form-config-worker">
          <div class="form-group">
            <label class="form-label" for="cfg-worker-url">URL del Cloudflare Worker (opcional)</label>
            <input type="url" id="cfg-worker-url" class="form-control" value="${customWorkerUrl}" placeholder="https://destino-espana-api.tu-subdominio.workers.dev" style="font-family: var(--font-mono); font-size: 13px;">
            <span style="font-size: 12px; color: #64748B; margin-top: 4px; display: block;">
              Deja este campo en blanco si el CMS está alojado en el mismo dominio o Cloudflare Pages.
            </span>
          </div>

          <button type="submit" class="btn-secondary" style="width: 100%;">
            Guardar Configuración
          </button>
        </form>
      </div>

      <div class="card">
        <h2 class="card-title" style="margin-bottom: 8px;">Arquitectura R2 JSON</h2>
        <div style="font-size: 13px; color: #475569; line-height: 1.6;">
          <p>Los datos editados en este CMS se guardan directamente como archivos JSON estáticos en Cloudflare R2:</p>
          <ul style="margin: 8px 0 8px 20px; font-family: var(--font-mono); font-size: 12px;">
            <li>/data/cintillo.json</li>
            <li>/data/promociones.json</li>
            <li>/data/calculadora-tramites.json</li>
            <li>/data/tramites.json</li>
            <li>/versions/{modulo}/{timestamp}.json</li>
          </ul>
          <p>La app móvil pública lee estos archivos de manera ultrarrápida mediante CDN sin necesidad de servidores de base de datos intermedios.</p>
        </div>
      </div>
    `;

    container.querySelector('#form-config-worker').addEventListener('submit', (e) => {
      e.preventDefault();
      const val = container.querySelector('#cfg-worker-url').value.trim();
      if (val) {
        localStorage.setItem('destino_worker_url', val);
      } else {
        localStorage.removeItem('destino_worker_url');
      }
      this.showToast('Configuración guardada correctamente.', 'success');
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
