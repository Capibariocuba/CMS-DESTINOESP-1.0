/**
 * Destino España Admin - Módulo Dashboard
 */

window.DashboardModule = {
  async render(container) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
              </svg>
              Estado de Cloudflare R2
            </h2>
            <p class="card-subtitle">Conexión en tiempo real con el bucket de datos</p>
          </div>
          <span id="r2-badge-status" class="badge-status online">Conectado</span>
        </div>

        <div class="stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px;">
          <div class="stat-box" style="background: #F8FAFC; padding: 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
            <span style="font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase;">Bucket Principal</span>
            <div id="stat-bucket-name" style="font-size: 14px; font-weight: 700; color: #0B1D3A; margin-top: 2px;">destino-espana-data</div>
          </div>
          <div class="stat-box" style="background: #F8FAFC; padding: 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
            <span style="font-size: 11px; color: #64748B; font-weight: 700; text-transform: uppercase;">Última Sync</span>
            <div id="stat-last-sync" style="font-size: 13px; font-weight: 600; color: #0B1D3A; margin-top: 2px;">--:--:--</div>
          </div>
        </div>

        <div style="margin-top: 12px; padding: 10px; background: #EEF2F6; border-radius: 8px; font-size: 12.5px;">
          <strong>Último cambio guardado:</strong> <span id="stat-last-change">Cargando...</span>
        </div>

        <button id="btn-sync-all" class="btn-secondary" style="width: 100%; margin-top: 14px;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
          </svg>
          Sincronizar / Recargar datos
        </button>
      </div>

      <div class="card">
        <h2 class="card-title" style="margin-bottom: 12px;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          Resumen de Módulos Activos
        </h2>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="summary-row" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #FAFCFE; border-radius: 8px; border: 1px solid #E2E8F0;">
            <div>
              <strong style="color: #0B1D3A;">Promociones</strong>
              <div style="font-size: 12px; color: #64748B;">Banners en carrusel</div>
            </div>
            <span id="sum-promos" class="badge" style="background: #E0E7FF; color: #3730A3; font-weight: 700; padding: 4px 10px; border-radius: 12px; font-size: 13px;">0 activas / 0</span>
          </div>

          <div class="summary-row" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #FAFCFE; border-radius: 8px; border: 1px solid #E2E8F0;">
            <div>
              <strong style="color: #0B1D3A;">Calculadora de Trámites</strong>
              <div style="font-size: 12px; color: #64748B;">Tiempos de resolución estimados</div>
            </div>
            <span id="sum-calculadora" class="badge" style="background: #FEF3C7; color: #92400E; font-weight: 700; padding: 4px 10px; border-radius: 12px; font-size: 13px;">0 registros</span>
          </div>

          <div class="summary-row" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #FAFCFE; border-radius: 8px; border: 1px solid #E2E8F0;">
            <div>
              <strong style="color: #0B1D3A;">Categorías y Trámites</strong>
              <div style="font-size: 12px; color: #64748B;">Estructura jerárquica con subtrámites</div>
            </div>
            <span id="sum-tramites" class="badge" style="background: #DCFCE7; color: #166534; font-weight: 700; padding: 4px 10px; border-radius: 12px; font-size: 13px;">0 cat / 0 trámites</span>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-sync-all').addEventListener('click', () => {
      this.loadStatus();
      window.App?.showToast('Datos sincronizados con Cloudflare R2', 'success');
    });

    await this.loadStatus();
  },

  async loadStatus() {
    try {
      const status = await window.API.get('/api/status');
      
      const badge = document.getElementById('r2-badge-status');
      if (badge) {
        badge.textContent = status.connected ? 'Conectado' : 'Desconectado';
        badge.style.backgroundColor = status.connected ? '#10B981' : '#EF4444';
        badge.style.color = '#FFFFFF';
        badge.style.padding = '4px 10px';
        badge.style.borderRadius = '12px';
        badge.style.fontSize = '12px';
        badge.style.fontWeight = '700';
      }

      const bucketEl = document.getElementById('stat-bucket-name');
      if (bucketEl) bucketEl.textContent = status.bucketName || 'destino-espana-data';

      const syncEl = document.getElementById('stat-last-sync');
      if (syncEl) syncEl.textContent = new Date().toLocaleTimeString();

      const lastChangeEl = document.getElementById('stat-last-change');
      if (lastChangeEl && status.lastChange) {
        lastChangeEl.textContent = `${status.lastChange.modulo} (${new Date(status.lastChange.timestamp).toLocaleString()})`;
      }

      if (status.stats) {
        const promoEl = document.getElementById('sum-promos');
        if (promoEl) promoEl.textContent = `${status.stats.promociones.activas} activas / ${status.stats.promociones.total} total`;

        const calcEl = document.getElementById('sum-calculadora');
        if (calcEl) calcEl.textContent = `${status.stats.calculadora.total} trámites`;

        const tramEl = document.getElementById('sum-tramites');
        if (tramEl) tramEl.textContent = `${status.stats.tramites.categorias} cat / ${status.stats.tramites.tramites} trámites`;
      }
    } catch (e) {
      console.warn('Could not load status:', e);
    }
  }
};
