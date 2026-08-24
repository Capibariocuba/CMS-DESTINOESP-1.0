/**
 * Destino España Admin - Módulo 3: Calculadora de Trámites
 * Ruta JSON: /data/calculadora-tramites.json
 */

window.CalculadoraModule = {
  tramites: [],

  async render(container) {
    await this.loadData();

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Módulo 3: Calculadora de Trámites</h2>
            <p class="card-subtitle">Tiempos de resolución estimados (en días puros) para la app</p>
          </div>
          <button id="btn-add-calc-row" class="btn-secondary" style="background: #0B1D3A; color: white; border: none; font-size: 13px;">
            + Añadir Trámite
          </button>
        </div>

        <div style="margin-bottom: 14px; padding: 10px; background: #EEF2F6; border-radius: 8px; font-size: 12.5px; color: #475569;">
          <strong>Nota:</strong> El tiempo es un número entero en días. El frontend de la app pública decide cómo mostrarlo (semanas, meses o días).
        </div>

        <div id="calc-items-list" style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Rendered dynamically -->
        </div>

        <button id="btn-save-calculadora" class="btn-primary" style="margin-top: 16px;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
          </svg>
          Guardar cambios en Calculadora
        </button>
      </div>
    `;

    this.renderItems(container);
    this.bindEvents(container);
  },

  renderItems(container) {
    const listEl = container.querySelector('#calc-items-list');
    if (!listEl) return;

    if (this.tramites.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 24px; color: #64748B;">
          No hay trámites configurados en la calculadora.
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.tramites.map((t, idx) => `
      <div class="card" style="padding: 12px; margin-bottom: 0; background: #FAFCFE; border: 1px solid #E2E8F0;">
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: #64748B; background: #E2E8F0; padding: 2px 6px; border-radius: 4px;">#${idx + 1}</span>
          <input
            type="text"
            class="form-control input-calc-name"
            data-idx="${idx}"
            value="${this.escapeHtml(t.nombre)}"
            placeholder="Nombre del trámite consular o migratorio"
            style="flex: 1; min-height: 40px; font-size: 14px;"
            required
          />
          <button class="btn-icon btn-danger-outline btn-delete-calc" data-idx="${idx}" title="Eliminar" style="width: 36px; height: 36px; color: #EF4444; border: 1px solid #FCA5A5;">
            ✕
          </button>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; justify-content: flex-end;">
          <label style="font-size: 12.5px; font-weight: 600; color: #0B1D3A;">Tiempo de resolución:</label>
          <div style="display: flex; align-items: center; gap: 4px;">
            <input
              type="number"
              class="form-control input-calc-days"
              data-idx="${idx}"
              value="${t.tiempoResolucion || 0}"
              min="0"
              style="width: 80px; min-height: 38px; text-align: center; font-weight: 700; font-family: var(--font-mono);"
              required
            />
            <span style="font-size: 12px; font-weight: 600; color: #64748B;">días</span>
          </div>
        </div>
      </div>
    `).join('');

    // Bind item inputs
    listEl.querySelectorAll('.input-calc-name').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        this.tramites[idx].nombre = e.target.value;
      });
    });

    listEl.querySelectorAll('.input-calc-days').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        this.tramites[idx].tiempoResolucion = parseInt(e.target.value, 10) || 0;
      });
    });

    listEl.querySelectorAll('.btn-delete-calc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.tramites.splice(idx, 1);
        this.renderItems(container);
      });
    });
  },

  bindEvents(container) {
    const btnAdd = container.querySelector('#btn-add-calc-row');
    btnAdd.addEventListener('click', () => {
      this.tramites.push({
        id: `calc-${Date.now()}`,
        nombre: '',
        tiempoResolucion: 30,
      });
      this.renderItems(container);
      // Focus on new input
      const inputs = container.querySelectorAll('.input-calc-name');
      if (inputs.length > 0) inputs[inputs.length - 1].focus();
    });

    const btnSave = container.querySelector('#btn-save-calculadora');
    btnSave.addEventListener('click', () => this.saveToR2(container));
  },

  async loadData() {
    try {
      const res = await window.API.get('/api/calculadora');
      this.tramites = res?.tramites || [];
    } catch (e) {
      console.warn('Error loading calculadora:', e);
    }
  },

  async saveToR2(container) {
    // Validar
    for (let i = 0; i < this.tramites.length; i++) {
      const t = this.tramites[i];
      if (!t.nombre || !t.nombre.trim()) {
        window.App?.showToast(`Error: El trámite #${i + 1} debe tener un nombre.`, 'error');
        return;
      }
      if (isNaN(t.tiempoResolucion) || t.tiempoResolucion < 0) {
        window.App?.showToast(`Error: El trámite "${t.nombre}" debe tener días válidos (>= 0).`, 'error');
        return;
      }
    }

    const btn = container.querySelector('#btn-save-calculadora');
    btn.disabled = true;
    btn.textContent = 'Guardando en Cloudflare R2...';

    try {
      await window.API.put('/api/calculadora', { tramites: this.tramites });
      window.App?.showToast('✓ Calculadora guardada correctamente en R2.', 'success');
    } catch (err) {
      window.App?.showToast(`⚠ Error al guardar: ${err.message}`, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
        </svg>
        Guardar cambios en Calculadora
      `;
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};
