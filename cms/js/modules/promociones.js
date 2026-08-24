/**
 * Destino España Admin - Módulo 2: Promociones
 * Ruta JSON: /data/promociones.json
 */

window.PromocionesModule = {
  promociones: [],
  editingIndex: -1, // -1 significa vista lista, >=0 significa editando

  async render(container) {
    await this.loadData();
    this.renderView(container);
  },

  renderView(container) {
    if (this.editingIndex >= 0) {
      this.renderEditor(container);
    } else {
      this.renderList(container);
    }
  },

  renderList(container) {
    const listHtml = this.promociones.map((p, idx) => `
      <div class="card" style="border-left: 5px solid ${p.colorFondo || '#004481'}; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 11px; font-weight: 700; color: #64748B; background: #EEF2F6; padding: 2px 6px; border-radius: 4px;">#${p.orden || idx + 1}</span>
              <h3 style="font-size: 15px; font-weight: 700; color: #0B1D3A; margin: 0;">${this.escapeHtml(p.titulo)}</h3>
            </div>
            ${p.subtitulo ? `<p style="font-size: 13px; color: #64748B; margin-top: 4px;">${this.escapeHtml(p.subtitulo)}</p>` : ''}
            <div style="margin-top: 8px; display: flex; gap: 8px; align-items: center;">
              <span style="font-size: 11.5px; font-weight: 600; padding: 3px 8px; border-radius: 10px; background: ${p.activa ? '#DCFCE7' : '#F1F5F9'}; color: ${p.activa ? '#166534' : '#64748B'};">
                ${p.activa ? '● Activa' : '○ Inactiva'}
              </span>
              <span style="font-size: 12px; color: #64748B;">Botón: "<strong>${this.escapeHtml(p.textoBoton)}</strong>"</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px; margin-left: 8px;">
            <button class="btn-icon btn-reorder-up" data-idx="${idx}" title="Subir" style="width: 32px; height: 32px; color: #0B1D3A;" ${idx === 0 ? 'disabled' : ''}>▲</button>
            <button class="btn-icon btn-reorder-down" data-idx="${idx}" title="Bajar" style="width: 32px; height: 32px; color: #0B1D3A;" ${idx === this.promociones.length - 1 ? 'disabled' : ''}>▼</button>
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 12px; border-top: 1px solid #E2E8F0; padding-top: 10px;">
          <button class="btn-secondary btn-edit-promo" data-idx="${idx}" style="flex: 1; height: 38px; font-size: 13px;">
            Editar
          </button>
          <button class="btn-secondary btn-preview-modal-promo" data-idx="${idx}" style="height: 38px; font-size: 13px;">
            Ver Popup
          </button>
          <button class="btn-secondary btn-danger-outline btn-delete-promo" data-idx="${idx}" style="height: 38px; font-size: 13px;">
            Eliminar
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Módulo 2: Promociones</h2>
            <p class="card-subtitle">Banners en carrusel y popups enriquecidos</p>
          </div>
          <button id="btn-new-promo" class="btn-secondary" style="background: #0B1D3A; color: white; border: none; font-size: 13px;">
            + Nueva Promoción
          </button>
        </div>

        <div id="promos-list-container">
          ${this.promociones.length > 0 ? listHtml : `
            <div style="text-align: center; padding: 32px 16px; color: #64748B;">
              <p>No hay promociones registradas.</p>
              <button id="btn-empty-new-promo" class="btn-primary" style="margin-top: 12px; max-width: 200px; margin-left: auto; margin-right: auto;">
                Crear primera promoción
              </button>
            </div>
          `}
        </div>

        <button id="btn-save-all-promos" class="btn-primary" style="margin-top: 16px;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
          </svg>
          Guardar cambios en Promociones
        </button>
      </div>
    `;

    this.bindListEvents(container);
  },

  bindListEvents(container) {
    const btnNew = container.querySelector('#btn-new-promo');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        this.promociones.push({
          id: `promo-${Date.now()}`,
          titulo: 'Nueva Promoción',
          subtitulo: 'Subtítulo descriptivo',
          textoBoton: 'Saber más',
          colorFondo: '#004481',
          colorTexto: '#FFFFFF',
          contenido: '<h2>Título del Popup</h2><p>Describe las ventajas del servicio aquí.</p>',
          activa: true,
          orden: this.promociones.length + 1,
          creadaEn: new Date().toISOString(),
          actualizadaEn: new Date().toISOString(),
        });
        this.editingIndex = this.promociones.length - 1;
        this.renderView(container);
      });
    }

    const btnEmpty = container.querySelector('#btn-empty-new-promo');
    if (btnEmpty) {
      btnEmpty.addEventListener('click', () => btnNew.click());
    }

    // Edit buttons
    container.querySelectorAll('.btn-edit-promo').forEach(btn => {
      btn.addEventListener('click', () => {
        this.editingIndex = parseInt(btn.getAttribute('data-idx'), 10);
        this.renderView(container);
      });
    });

    // Delete buttons
    container.querySelectorAll('.btn-delete-promo').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const p = this.promociones[idx];
        if (confirm(`¿Estás seguro de eliminar la promoción "${p.titulo}"?`)) {
          this.promociones.splice(idx, 1);
          // Reindexar orden
          this.promociones.forEach((item, i) => item.orden = i + 1);
          this.renderView(container);
          window.App?.showToast('Promoción eliminada localmente. Pulsa guardar para confirmar en R2.', 'info');
        }
      });
    });

    // Preview popup modal
    container.querySelectorAll('.btn-preview-modal-promo').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const p = this.promociones[idx];
        window.App?.openModal(`Popup: ${p.titulo}`, `
          <div style="font-family: var(--font-sans); color: #1A202C; line-height: 1.6;">
            ${p.contenido || '<p>Sin contenido</p>'}
          </div>
        `);
      });
    });

    // Reorder buttons
    container.querySelectorAll('.btn-reorder-up').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (idx > 0) {
          const temp = this.promociones[idx];
          this.promociones[idx] = this.promociones[idx - 1];
          this.promociones[idx - 1] = temp;
          this.promociones.forEach((item, i) => item.orden = i + 1);
          this.renderView(container);
        }
      });
    });

    container.querySelectorAll('.btn-reorder-down').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (idx < this.promociones.length - 1) {
          const temp = this.promociones[idx];
          this.promociones[idx] = this.promociones[idx + 1];
          this.promociones[idx + 1] = temp;
          this.promociones.forEach((item, i) => item.orden = i + 1);
          this.renderView(container);
        }
      });
    });

    // Save All Promos
    const btnSave = container.querySelector('#btn-save-all-promos');
    if (btnSave) {
      btnSave.addEventListener('click', () => this.saveToR2(container));
    }
  },

  renderEditor(container) {
    const promo = this.promociones[this.editingIndex];
    if (!promo) {
      this.editingIndex = -1;
      this.renderView(container);
      return;
    }

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Editando Promoción #${promo.orden}</h2>
          <button id="btn-back-promos" class="btn-secondary" style="font-size: 13px;">
            ← Volver a la lista
          </button>
        </div>

        <!-- Vista previa en tiempo real -->
        <div class="preview-container">
          <div class="preview-header">
            <span>Vista Previa del Banner</span>
            <span style="font-size: 10.5px; opacity: 0.8;">App Móvil</span>
          </div>
          <div id="promo-live-banner" class="promo-preview-banner" style="background-color: ${promo.colorFondo || '#004481'}; color: ${promo.colorTexto || '#FFFFFF'};">
            <div id="prev-promo-title" class="promo-preview-title">${this.escapeHtml(promo.titulo || 'Título de ejemplo')}</div>
            <div id="prev-promo-sub" class="promo-preview-sub">${this.escapeHtml(promo.subtitulo || 'Subtítulo descriptivo')}</div>
            <span id="prev-promo-btn" class="promo-preview-btn">${this.escapeHtml(promo.textoBoton || 'Saber más')}</span>
          </div>
        </div>

        <form id="form-edit-promo">
          <div class="form-group">
            <label class="form-label" for="promo-titulo">Título <span class="required">*</span></label>
            <input type="text" id="promo-titulo" class="form-control" value="${this.escapeHtml(promo.titulo || '')}" required>
            <span id="err-promo-titulo" class="form-error-msg" style="display: none;">El título es obligatorio.</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="promo-subtitulo">Subtítulo</label>
            <input type="text" id="promo-subtitulo" class="form-control" value="${this.escapeHtml(promo.subtitulo || '')}">
          </div>

          <div class="form-group">
            <label class="form-label" for="promo-texto-boton">Texto del Botón <span class="required">*</span></label>
            <input type="text" id="promo-texto-boton" class="form-control" value="${this.escapeHtml(promo.textoBoton || '')}" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label" for="promo-color-fondo">Color Fondo</label>
              <div style="display: flex; gap: 6px; align-items: center;">
                <input type="color" id="promo-color-fondo-picker" value="${promo.colorFondo || '#004481'}" style="width: 44px; height: 44px; border: none; border-radius: 8px; cursor: pointer;">
                <input type="text" id="promo-color-fondo" class="form-control" value="${promo.colorFondo || '#004481'}" style="font-family: var(--font-mono); font-size: 13px;">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="promo-color-texto">Color Texto</label>
              <div style="display: flex; gap: 6px; align-items: center;">
                <input type="color" id="promo-color-texto-picker" value="${promo.colorTexto || '#FFFFFF'}" style="width: 44px; height: 44px; border: none; border-radius: 8px; cursor: pointer;">
                <input type="text" id="promo-color-texto" class="form-control" value="${promo.colorTexto || '#FFFFFF'}" style="font-family: var(--font-mono); font-size: 13px;">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              Contenido Modal Popup (HTML Enriquecido) <span class="required">*</span>
            </label>
            
            <!-- Toolbar Editor Enriquecido -->
            <div class="editor-toolbar">
              <button type="button" class="editor-btn" data-cmd="bold" title="Negrita"><b>B</b></button>
              <button type="button" class="editor-btn" data-cmd="italic" title="Cursiva"><i>I</i></button>
              <button type="button" class="editor-btn" data-cmd="strikeThrough" title="Tachado"><s>S</s></button>
              <button type="button" class="editor-btn" data-format="h1" title="Título H1">H1</button>
              <button type="button" class="editor-btn" data-format="h2" title="Título H2">H2</button>
              <button type="button" class="editor-btn" data-format="h3" title="Título H3">H3</button>
              <button type="button" class="editor-btn" data-cmd="insertUnorderedList" title="Lista Viñetas">• Lista</button>
              <button type="button" class="editor-btn" data-cmd="insertOrderedList" title="Lista Numerada">1. Lista</button>
              <button type="button" class="editor-btn" id="btn-editor-link" title="Insertar Enlace">🔗 Link</button>
              <button type="button" class="editor-btn" id="btn-editor-img" title="Insertar Imagen">🖼️ Img</button>
              <button type="button" class="editor-btn" data-cmd="justifyLeft" title="Alinear Izquierda">⬅</button>
              <button type="button" class="editor-btn" data-cmd="justifyCenter" title="Alinear Centro">☰</button>
              <button type="button" class="editor-btn" data-cmd="justifyRight" title="Alinear Derecha">➡</button>
              <button type="button" class="editor-btn" data-cmd="insertHorizontalRule" title="Línea divisoria">— HR</button>
            </div>
            <div id="promo-editor-content" class="editor-content-area" contenteditable="true">
              ${promo.contenido || '<p></p>'}
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 12px; background: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0;">
            <div>
              <strong style="color: #0B1D3A; font-size: 14px;">Estado de la Promoción</strong>
              <div style="font-size: 12px; color: #64748B;">Visible en el carrusel de la app pública</div>
            </div>
            <label style="position: relative; display: inline-block; width: 48px; height: 26px;">
              <input type="checkbox" id="promo-activa" ${promo.activa ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
              <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${promo.activa ? '#10B981' : '#CBD5E1'}; transition: .3s; border-radius: 26px;" id="toggle-slider"></span>
            </label>
          </div>

          <div style="display: flex; gap: 8px;">
            <button type="button" id="btn-finish-editing" class="btn-primary" style="flex: 1;">
              Aplicar a la lista
            </button>
          </div>
        </form>
      </div>
    `;

    this.bindEditorEvents(container);
  },

  bindEditorEvents(container) {
    const promo = this.promociones[this.editingIndex];
    const banner = container.querySelector('#promo-live-banner');
    const prevTitle = container.querySelector('#prev-promo-title');
    const prevSub = container.querySelector('#prev-promo-sub');
    const prevBtn = container.querySelector('#prev-promo-btn');

    const inputTitle = container.querySelector('#promo-titulo');
    const inputSub = container.querySelector('#promo-subtitulo');
    const inputBtn = container.querySelector('#promo-texto-boton');
    const bgPicker = container.querySelector('#promo-color-fondo-picker');
    const bgInput = container.querySelector('#promo-color-fondo');
    const textPicker = container.querySelector('#promo-color-texto-picker');
    const textInput = container.querySelector('#promo-color-texto');
    const editor = container.querySelector('#promo-editor-content');
    const checkActive = container.querySelector('#promo-activa');
    const toggleSlider = container.querySelector('#toggle-slider');

    inputTitle.addEventListener('input', (e) => {
      prevTitle.textContent = e.target.value.trim() || 'Título de ejemplo';
      promo.titulo = e.target.value;
    });

    inputSub.addEventListener('input', (e) => {
      prevSub.textContent = e.target.value.trim() || 'Subtítulo descriptivo';
      promo.subtitulo = e.target.value;
    });

    inputBtn.addEventListener('input', (e) => {
      prevBtn.textContent = e.target.value.trim() || 'Saber más';
      promo.textoBoton = e.target.value;
    });

    bgPicker.addEventListener('input', (e) => {
      bgInput.value = e.target.value;
      banner.style.backgroundColor = e.target.value;
      promo.colorFondo = e.target.value;
    });

    bgInput.addEventListener('input', (e) => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        bgPicker.value = e.target.value;
        banner.style.backgroundColor = e.target.value;
        promo.colorFondo = e.target.value;
      }
    });

    textPicker.addEventListener('input', (e) => {
      textInput.value = e.target.value;
      banner.style.color = e.target.value;
      promo.colorTexto = e.target.value;
    });

    textInput.addEventListener('input', (e) => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        textPicker.value = e.target.value;
        banner.style.color = e.target.value;
        promo.colorTexto = e.target.value;
      }
    });

    checkActive.addEventListener('change', (e) => {
      promo.activa = e.target.checked;
      toggleSlider.style.backgroundColor = e.target.checked ? '#10B981' : '#CBD5E1';
    });

    // Rich Text Toolbar
    container.querySelectorAll('.editor-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.execCommand(btn.getAttribute('data-cmd'), false, null);
      });
    });

    container.querySelectorAll('.editor-btn[data-format]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.execCommand('formatBlock', false, btn.getAttribute('data-format'));
      });
    });

    container.querySelector('#btn-editor-link').addEventListener('click', () => {
      const url = prompt('Introduce la URL del enlace:');
      if (url) document.execCommand('createLink', false, url);
    });

    container.querySelector('#btn-editor-img').addEventListener('click', () => {
      const url = prompt('Introduce la URL de la imagen:');
      if (url) document.execCommand('insertImage', false, url);
    });

    container.querySelector('#btn-back-promos').addEventListener('click', () => {
      this.editingIndex = -1;
      this.renderView(container);
    });

    container.querySelector('#btn-finish-editing').addEventListener('click', () => {
      if (!inputTitle.value.trim()) {
        alert('El título es obligatorio');
        return;
      }
      promo.contenido = editor.innerHTML;
      promo.actualizadaEn = new Date().toISOString();
      this.editingIndex = -1;
      this.renderView(container);
      window.App?.showToast('Cambios aplicados a la lista. No olvides pulsar "Guardar cambios".', 'info');
    });
  },

  async loadData() {
    try {
      const res = await window.API.get('/api/promociones');
      this.promociones = res?.promociones || [];
    } catch (e) {
      console.warn('Error loading promociones:', e);
    }
  },

  async saveToR2(container) {
    const btn = container.querySelector('#btn-save-all-promos');
    btn.disabled = true;
    btn.textContent = 'Guardando en Cloudflare R2...';

    try {
      await window.API.put('/api/promociones', { promociones: this.promociones });
      window.App?.showToast('✓ Promociones guardadas correctamente en R2.', 'success');
    } catch (err) {
      window.App?.showToast(`⚠ Error al guardar: ${err.message}`, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
        </svg>
        Guardar cambios en Promociones
      `;
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};
