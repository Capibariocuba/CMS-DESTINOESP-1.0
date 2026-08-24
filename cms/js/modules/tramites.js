/**
 * Destino España Admin - Módulos 4 & 5: Categorías y Trámites
 * Ruta JSON: /data/tramites.json
 * Estructura jerárquica: Categoría -> Trámite -> Subtrámite
 */

window.TramitesModule = {
  categorias: [],

  async render(container) {
    await this.loadData();

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Módulos 4 & 5: Categorías y Trámites</h2>
            <p class="card-subtitle">Estructura jerárquica: Categoría → Trámite → Subtrámites</p>
          </div>
          <button id="btn-add-category" class="btn-secondary" style="background: #0B1D3A; color: white; border: none; font-size: 13px;">
            + Nueva Categoría
          </button>
        </div>

        <div id="categories-tree-container" style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Categorías jerárquicas -->
        </div>

        <button id="btn-save-tramites-tree" class="btn-primary" style="margin-top: 18px;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
          </svg>
          Guardar cambios en Trámites
        </button>
      </div>
    `;

    this.renderTree(container);
    this.bindEvents(container);
  },

  renderTree(container) {
    const treeEl = container.querySelector('#categories-tree-container');
    if (!treeEl) return;

    if (this.categorias.length === 0) {
      treeEl.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; color: #64748B;">
          No hay categorías creadas.
        </div>
      `;
      return;
    }

    treeEl.innerHTML = this.categorias.map((cat, catIdx) => `
      <div class="card" style="margin-bottom: 0; border-top: 4px solid ${cat.color || '#0B3C6D'}; background: #FFFFFF;">
        <!-- Header de Categoría -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;">
          <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
            <input type="color" class="cat-color-picker" data-cat="${catIdx}" value="${cat.color || '#0B3C6D'}" style="width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer;">
            <input type="text" class="form-control cat-name-input" data-cat="${catIdx}" value="${this.escapeHtml(cat.nombre)}" placeholder="Nombre de categoría" style="font-weight: 700; color: #0B1D3A; min-height: 40px;">
          </div>
          <button class="btn-icon btn-danger-outline btn-delete-cat" data-cat="${catIdx}" title="Eliminar categoría" style="width: 36px; height: 36px; margin-left: 8px;">
            🗑️
          </button>
        </div>

        <div style="font-size: 11px; color: #64748B; margin-bottom: 10px;">
          ID Estable: <code>${cat.id}</code>
        </div>

        <!-- Trámites dentro de la categoría -->
        <div class="tramites-list" style="display: flex; flex-direction: column; gap: 12px; margin-left: 6px; border-left: 2px solid #E2E8F0; padding-left: 12px;">
          ${(cat.tramites || []).map((tram, tramIdx) => `
            <div class="card" style="padding: 12px; margin-bottom: 0; background: #F8FAFC; border: 1px solid #CBD5E1;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
                <input type="text" class="form-control tram-title-input" data-cat="${catIdx}" data-tram="${tramIdx}" value="${this.escapeHtml(tram.titulo)}" placeholder="Título del trámite" style="flex: 1; font-weight: 600; min-height: 38px; font-size: 14px;">
                <button class="btn-icon btn-danger-outline btn-delete-tram" data-cat="${catIdx}" data-tram="${tramIdx}" title="Eliminar trámite" style="width: 32px; height: 32px;">✕</button>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; margin-bottom: 10px;">
                <span style="color: #64748B;">Plazo general estimado:</span>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <input type="number" class="form-control tram-plazo-input" data-cat="${catIdx}" data-tram="${tramIdx}" value="${tram.plazoResolucion || 0}" min="0" style="width: 70px; min-height: 34px; text-align: center; font-weight: 700; font-family: var(--font-mono);">
                  <span style="color: #64748B; font-weight: 600;">días</span>
                </div>
              </div>

              <!-- Subtrámites -->
              <div style="background: white; border-radius: 8px; padding: 8px; border: 1px solid #E2E8F0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 11.5px; font-weight: 700; color: #0B1D3A; text-transform: uppercase;">Subtrámites y Fases:</span>
                  <button class="btn-secondary btn-add-subtram" data-cat="${catIdx}" data-tram="${tramIdx}" style="padding: 2px 8px; min-height: 28px; font-size: 11px;">
                    + Añadir Fase
                  </button>
                </div>

                <div class="subtramites-list" style="display: flex; flex-direction: column; gap: 6px;">
                  ${(tram.subtramites || []).map((sub, subIdx) => `
                    <div style="display: flex; align-items: center; gap: 6px; background: #F1F5F9; padding: 6px; border-radius: 6px;">
                      <span style="font-size: 10px; font-weight: 700; color: #64748B;">${subIdx + 1}.</span>
                      <input type="text" class="form-control sub-name-input" data-cat="${catIdx}" data-tram="${tramIdx}" data-sub="${subIdx}" value="${this.escapeHtml(sub.nombre)}" placeholder="Fase / Subtrámite" style="flex: 1; min-height: 32px; font-size: 12.5px; padding: 4px 8px;">
                      <input type="number" class="form-control sub-time-input" data-cat="${catIdx}" data-tram="${tramIdx}" data-sub="${subIdx}" value="${sub.tiempo || 0}" min="0" style="width: 50px; min-height: 32px; text-align: center; font-size: 12px; font-weight: 700; font-family: var(--font-mono); padding: 4px 2px;">
                      <span style="font-size: 10.5px; color: #64748B;">días</span>
                      
                      <div style="display: flex; gap: 2px;">
                        <button class="btn-icon btn-sub-up" data-cat="${catIdx}" data-tram="${tramIdx}" data-sub="${subIdx}" title="Subir" style="width: 24px; height: 24px; font-size: 10px; background: #CBD5E1; color: #0B1D3A;" ${subIdx === 0 ? 'disabled' : ''}>▲</button>
                        <button class="btn-icon btn-sub-down" data-cat="${catIdx}" data-tram="${tramIdx}" data-sub="${subIdx}" title="Bajar" style="width: 24px; height: 24px; font-size: 10px; background: #CBD5E1; color: #0B1D3A;" ${subIdx === (tram.subtramites || []).length - 1 ? 'disabled' : ''}>▼</button>
                        <button class="btn-icon btn-sub-del" data-cat="${catIdx}" data-tram="${tramIdx}" data-sub="${subIdx}" title="Eliminar" style="width: 24px; height: 24px; font-size: 10px; background: #FEE2E2; color: #EF4444;">✕</button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `).join('')}

          <button class="btn-secondary btn-add-tramite" data-cat="${catIdx}" style="width: 100%; min-height: 36px; font-size: 12.5px; border-style: dashed;">
            + Añadir Trámite a ${this.escapeHtml(cat.nombre || 'esta categoría')}
          </button>
        </div>
      </div>
    `).join('');

    this.bindTreeInputEvents(container);
  },

  bindTreeInputEvents(container) {
    // Categoría Inputs
    container.querySelectorAll('.cat-name-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const catIdx = parseInt(e.target.getAttribute('data-cat'), 10);
        this.categorias[catIdx].nombre = e.target.value;
      });
    });

    container.querySelectorAll('.cat-color-picker').forEach(picker => {
      picker.addEventListener('input', (e) => {
        const catIdx = parseInt(e.target.getAttribute('data-cat'), 10);
        this.categorias[catIdx].color = e.target.value;
      });
    });

    container.querySelectorAll('.btn-delete-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        const catIdx = parseInt(btn.getAttribute('data-cat'), 10);
        const cat = this.categorias[catIdx];
        if (confirm(`⚠ ADVERTENCIA: ¿Eliminar categoría "${cat.nombre}"?\nEsta acción eliminará todos sus trámites y subtrámites asociados.`)) {
          this.categorias.splice(catIdx, 1);
          this.renderTree(container);
        }
      });
    });

    // Trámites
    container.querySelectorAll('.btn-add-tramite').forEach(btn => {
      btn.addEventListener('click', () => {
        const catIdx = parseInt(btn.getAttribute('data-cat'), 10);
        if (!this.categorias[catIdx].tramites) this.categorias[catIdx].tramites = [];
        this.categorias[catIdx].tramites.push({
          id: `tram-${Date.now()}`,
          titulo: 'Nuevo Trámite',
          plazoResolucion: 30,
          subtramites: [
            { id: `sub-${Date.now()}-1`, nombre: 'Recepción de expediente', tiempo: 5 }
          ]
        });
        this.renderTree(container);
      });
    });

    container.querySelectorAll('.tram-title-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const catIdx = parseInt(e.target.getAttribute('data-cat'), 10);
        const tramIdx = parseInt(e.target.getAttribute('data-tram'), 10);
        this.categorias[catIdx].tramites[tramIdx].titulo = e.target.value;
      });
    });

    container.querySelectorAll('.tram-plazo-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const catIdx = parseInt(e.target.getAttribute('data-cat'), 10);
        const tramIdx = parseInt(e.target.getAttribute('data-tram'), 10);
        this.categorias[catIdx].tramites[tramIdx].plazoResolucion = parseInt(e.target.value, 10) || 0;
      });
    });

    container.querySelectorAll('.btn-delete-tram').forEach(btn => {
      btn.addEventListener('click', () => {
        const catIdx = parseInt(btn.getAttribute('data-cat'), 10);
        const tramIdx = parseInt(btn.getAttribute('data-tram'), 10);
        this.categorias[catIdx].tramites.splice(tramIdx, 1);
        this.renderTree(container);
      });
    });

    // Subtrámites
    container.querySelectorAll('.btn-add-subtram').forEach(btn => {
      btn.addEventListener('click', () => {
        const catIdx = parseInt(btn.getAttribute('data-cat'), 10);
        const tramIdx = parseInt(btn.getAttribute('data-tram'), 10);
        if (!this.categorias[catIdx].tramites[tramIdx].subtramites) {
          this.categorias[catIdx].tramites[tramIdx].subtramites = [];
        }
        this.categorias[catIdx].tramites[tramIdx].subtramites.push({
          id: `sub-${Date.now()}`,
          nombre: 'Nueva fase',
          tiempo: 10,
        });
        this.renderTree(container);
      });
    });

    container.querySelectorAll('.sub-name-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const catIdx = parseInt(e.target.getAttribute('data-cat'), 10);
        const tramIdx = parseInt(e.target.getAttribute('data-tram'), 10);
        const subIdx = parseInt(e.target.getAttribute('data-sub'), 10);
        this.categorias[catIdx].tramites[tramIdx].subtramites[subIdx].nombre = e.target.value;
      });
    });

    container.querySelectorAll('.sub-time-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const catIdx = parseInt(e.target.getAttribute('data-cat'), 10);
        const tramIdx = parseInt(e.target.getAttribute('data-tram'), 10);
        const subIdx = parseInt(e.target.getAttribute('data-sub'), 10);
        this.categorias[catIdx].tramites[tramIdx].subtramites[subIdx].tiempo = parseInt(e.target.value, 10) || 0;
      });
    });

    container.querySelectorAll('.btn-sub-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const catIdx = parseInt(btn.getAttribute('data-cat'), 10);
        const tramIdx = parseInt(btn.getAttribute('data-tram'), 10);
        const subIdx = parseInt(btn.getAttribute('data-sub'), 10);
        this.categorias[catIdx].tramites[tramIdx].subtramites.splice(subIdx, 1);
        this.renderTree(container);
      });
    });

    container.querySelectorAll('.btn-sub-up').forEach(btn => {
      btn.addEventListener('click', () => {
        const catIdx = parseInt(btn.getAttribute('data-cat'), 10);
        const tramIdx = parseInt(btn.getAttribute('data-tram'), 10);
        const subIdx = parseInt(btn.getAttribute('data-sub'), 10);
        if (subIdx > 0) {
          const list = this.categorias[catIdx].tramites[tramIdx].subtramites;
          const temp = list[subIdx];
          list[subIdx] = list[subIdx - 1];
          list[subIdx - 1] = temp;
          this.renderTree(container);
        }
      });
    });

    container.querySelectorAll('.btn-sub-down').forEach(btn => {
      btn.addEventListener('click', () => {
        const catIdx = parseInt(btn.getAttribute('data-cat'), 10);
        const tramIdx = parseInt(btn.getAttribute('data-tram'), 10);
        const subIdx = parseInt(btn.getAttribute('data-sub'), 10);
        const list = this.categorias[catIdx].tramites[tramIdx].subtramites;
        if (subIdx < list.length - 1) {
          const temp = list[subIdx];
          list[subIdx] = list[subIdx + 1];
          list[subIdx + 1] = temp;
          this.renderTree(container);
        }
      });
    });
  },

  bindEvents(container) {
    const btnAddCat = container.querySelector('#btn-add-category');
    btnAddCat.addEventListener('click', () => {
      this.categorias.push({
        id: `cat-${Date.now()}`,
        nombre: 'Nueva Categoría',
        color: '#0B3C6D',
        tramites: [],
      });
      this.renderTree(container);
    });

    const btnSave = container.querySelector('#btn-save-tramites-tree');
    btnSave.addEventListener('click', () => this.saveToR2(container));
  },

  async loadData() {
    try {
      const res = await window.API.get('/api/tramites');
      this.categorias = res?.categorias || [];
    } catch (e) {
      console.warn('Error loading tramites tree:', e);
    }
  },

  async saveToR2(container) {
    // Validar
    for (let i = 0; i < this.categorias.length; i++) {
      const cat = this.categorias[i];
      if (!cat.nombre || !cat.nombre.trim()) {
        window.App?.showToast(`Error: Categoría #${i + 1} debe tener nombre.`, 'error');
        return;
      }
    }

    const btn = container.querySelector('#btn-save-tramites-tree');
    btn.disabled = true;
    btn.textContent = 'Guardando en Cloudflare R2...';

    try {
      await window.API.put('/api/tramites', { categorias: this.categorias });
      window.App?.showToast('✓ Categorías y trámites guardados correctamente en R2.', 'success');
    } catch (err) {
      window.App?.showToast(`⚠ Error al guardar: ${err.message}`, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
        </svg>
        Guardar cambios en Trámites
      `;
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};
