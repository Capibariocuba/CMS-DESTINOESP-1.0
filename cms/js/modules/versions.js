/**
 * Destino España Admin - Módulo de Historial de Versiones
 * Permite auditar, comparar y restaurar versiones previas de Cloudflare R2
 */

window.VersionsModule = {
  activeModule: 'cintillo',

  async openVersionsModal(moduleName = 'cintillo') {
    this.activeModule = moduleName;
    const modalTitle = `Historial de Versiones: ${this.getModuleDisplayName(moduleName)}`;
    
    window.App?.openModal(modalTitle, `
      <div style="margin-bottom: 12px; display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;">
        <button class="btn-secondary btn-ver-tab ${moduleName === 'cintillo' ? 'active' : ''}" data-mod="cintillo" style="font-size: 12px; padding: 6px 12px;">Cintillo</button>
        <button class="btn-secondary btn-ver-tab ${moduleName === 'promociones' ? 'active' : ''}" data-mod="promociones" style="font-size: 12px; padding: 6px 12px;">Promociones</button>
        <button class="btn-secondary btn-ver-tab ${moduleName === 'calculadora' ? 'active' : ''}" data-mod="calculadora" style="font-size: 12px; padding: 6px 12px;">Calculadora</button>
        <button class="btn-secondary btn-ver-tab ${moduleName === 'tramites' ? 'active' : ''}" data-mod="tramites" style="font-size: 12px; padding: 6px 12px;">Trámites</button>
      </div>

      <div id="versions-list-content" style="max-height: 60vh; overflow-y: auto;">
        <div style="text-align: center; padding: 20px; color: #64748B;">Cargando versiones desde R2...</div>
      </div>
    `);

    document.querySelectorAll('.btn-ver-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const mod = e.target.getAttribute('data-mod');
        this.openVersionsModal(mod);
      });
    });

    await this.loadVersions(this.activeModule);
  },

  async loadVersions(moduleName) {
    const contentEl = document.getElementById('versions-list-content');
    if (!contentEl) return;

    try {
      const res = await window.API.get(`/api/versions/${moduleName}`);
      const versions = res?.versions || [];

      if (versions.length === 0) {
        contentEl.innerHTML = `
          <div style="text-align: center; padding: 30px; color: #64748B;">
            <p>No hay versiones guardadas para este módulo aún.</p>
            <span style="font-size: 12px;">Las versiones se generan automáticamente cada vez que guardas cambios en R2.</span>
          </div>
        `;
        return;
      }

      contentEl.innerHTML = versions.map((v, idx) => `
        <div class="card" style="padding: 12px; margin-bottom: 10px; background: #F8FAFC; border: 1px solid #CBD5E1;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div>
              <strong style="font-size: 13.5px; color: #0B1D3A;">
                📅 ${new Date(v.timestamp).toLocaleString()}
              </strong>
              <div style="font-size: 12px; color: #64748B;">Autor: ${v.autor || 'Administrador'}</div>
            </div>
            <button class="btn-primary btn-restore-version" data-key="${v.key}" style="width: auto; min-height: 34px; padding: 4px 12px; font-size: 12px; background: #0B1D3A;">
              Restaurar
            </button>
          </div>

          <details style="margin-top: 6px; font-size: 12px;">
            <summary style="cursor: pointer; color: #004481; font-weight: 600;">Ver contenido JSON de la versión</summary>
            <pre style="background: #0B1D3A; color: #E2E8F0; padding: 10px; border-radius: 6px; overflow-x: auto; margin-top: 6px; font-family: var(--font-mono); font-size: 11px; max-height: 180px;">${JSON.stringify(v.data, null, 2)}</pre>
          </details>
        </div>
      `).join('');

      contentEl.querySelectorAll('.btn-restore-version').forEach(btn => {
        btn.addEventListener('click', async () => {
          const versionKey = btn.getAttribute('data-key');
          if (confirm(`¿Confirmas que deseas restaurar los datos del módulo "${moduleName}" a esta versión previa?\n\nLos datos actuales serán respaldados antes de sobrescribir.`)) {
            await this.restoreVersion(moduleName, versionKey);
          }
        });
      });

    } catch (err) {
      contentEl.innerHTML = `
        <div style="color: #EF4444; padding: 16px; text-align: center;">
          Error al cargar historial: ${err.message}
        </div>
      `;
    }
  },

  async restoreVersion(moduleName, versionKey) {
    try {
      const res = await window.API.post(`/api/versions/${moduleName}/restore`, { versionKey });
      window.App?.closeModal();
      window.App?.showToast(`✓ ${res.message || 'Versión restaurada con éxito'}`, 'success');
      
      // Recargar el módulo activo
      window.App?.reloadActiveModule();
    } catch (err) {
      window.App?.showToast(`⚠ Error al restaurar: ${err.message}`, 'error');
    }
  },

  getModuleDisplayName(mod) {
    switch (mod) {
      case 'cintillo': return 'Cintillo';
      case 'promociones': return 'Promociones';
      case 'calculadora': return 'Calculadora de Trámites';
      case 'tramites': return 'Categorías y Trámites';
      default: return mod;
    }
  }
};
