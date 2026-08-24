/**
 * Destino España Admin - Módulo 1: Cintillo
 * Ruta JSON: /data/cintillo.json
 */

window.CintilloModule = {
  data: {
    texto: '',
    color: 'verde',
    actualizadoEn: '',
  },

  async render(container) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Módulo 1: Cintillo Informativo</h2>
            <p class="card-subtitle">Barra de texto desplazable en la app pública con indicador de color</p>
          </div>
        </div>

        <!-- Vista previa en tiempo real -->
        <div class="preview-container">
          <div class="preview-header">
            <span>Vista Previa en Tiempo Real</span>
            <span style="font-size: 10.5px; opacity: 0.8;">App Móvil</span>
          </div>
          <div class="cintillo-preview-bar">
            <span id="preview-cintillo-dot" class="cintillo-indicator verde"></span>
            <span id="preview-cintillo-text" class="cintillo-preview-text">Escribe el texto del cintillo...</span>
          </div>
        </div>

        <!-- Formulario -->
        <form id="form-cintillo" novalidate>
          <div class="form-group">
            <label class="form-label" for="input-cintillo-texto">
              Texto del cintillo <span class="required">*</span>
            </label>
            <textarea
              id="input-cintillo-texto"
              class="form-control"
              placeholder="Ej: Consulado operando con normalidad. Nuevas citas habilitadas este jueves."
              rows="3"
              required
            ></textarea>
            <span id="err-cintillo-texto" class="form-error-msg" style="display: none;">El texto del cintillo es obligatorio.</span>
          </div>

          <div class="form-group">
            <label class="form-label">
              Color del indicador <span class="required">*</span>
            </label>
            <div class="color-options-grid" id="color-options-cintillo">
              <button type="button" class="color-option-btn selected" data-color="verde">
                <span class="color-dot verde"></span>
                <span>Verde</span>
              </button>
              <button type="button" class="color-option-btn" data-color="amarillo">
                <span class="color-dot amarillo"></span>
                <span>Amarillo</span>
              </button>
              <button type="button" class="color-option-btn" data-color="rojo">
                <span class="color-dot rojo"></span>
                <span>Rojo</span>
              </button>
              <button type="button" class="color-option-btn" data-color="azul">
                <span class="color-dot azul"></span>
                <span>Azul</span>
              </button>
              <button type="button" class="color-option-btn" data-color="blanco">
                <span class="color-dot blanco"></span>
                <span>Blanco</span>
              </button>
              <button type="button" class="color-option-btn" data-color="negro">
                <span class="color-dot negro"></span>
                <span>Negro</span>
              </button>
            </div>
          </div>

          <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 16px;">
            <strong>Ruta en R2:</strong> <code>/data/cintillo.json</code> &bull; 
            <span id="cintillo-last-saved">No guardado en esta sesión</span>
          </div>

          <button type="submit" id="btn-save-cintillo" class="btn-primary">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
            </svg>
            Guardar cambios en Cintillo
          </button>
        </form>
      </div>
    `;

    this.bindEvents(container);
    await this.loadData();
  },

  bindEvents(container) {
    const textarea = container.querySelector('#input-cintillo-texto');
    const previewText = container.querySelector('#preview-cintillo-text');
    const previewDot = container.querySelector('#preview-cintillo-dot');
    const colorBtns = container.querySelectorAll('.color-option-btn');
    const form = container.querySelector('#form-cintillo');

    // Live update text
    textarea.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      previewText.textContent = val || 'Escribe el texto del cintillo...';
      this.data.texto = e.target.value;
      container.querySelector('#err-cintillo-texto').style.display = 'none';
      textarea.classList.remove('error');
    });

    // Select color
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const color = btn.getAttribute('data-color');
        this.data.color = color;
        previewDot.className = `cintillo-indicator ${color}`;
      });
    });

    // Form Submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveData(container);
    });
  },

  async loadData() {
    try {
      const res = await window.API.get('/api/cintillo');
      if (res) {
        this.data = res;
        const textarea = document.getElementById('input-cintillo-texto');
        if (textarea) {
          textarea.value = res.texto || '';
          document.getElementById('preview-cintillo-text').textContent = res.texto || 'Escribe el texto del cintillo...';
        }

        const color = res.color || 'verde';
        const colorBtns = document.querySelectorAll('#color-options-cintillo .color-option-btn');
        colorBtns.forEach(btn => {
          if (btn.getAttribute('data-color') === color) {
            btn.classList.add('selected');
          } else {
            btn.classList.remove('selected');
          }
        });

        const previewDot = document.getElementById('preview-cintillo-dot');
        if (previewDot) previewDot.className = `cintillo-indicator ${color}`;

        if (res.actualizadoEn) {
          const lastEl = document.getElementById('cintillo-last-saved');
          if (lastEl) lastEl.textContent = `Actualizado: ${new Date(res.actualizadoEn).toLocaleString()}`;
        }
      }
    } catch (err) {
      console.warn('Error loading cintillo:', err);
    }
  },

  async saveData(container) {
    const textarea = container.querySelector('#input-cintillo-texto');
    const errText = container.querySelector('#err-cintillo-texto');
    const texto = textarea.value.trim();

    if (!texto) {
      textarea.classList.add('error');
      errText.style.display = 'block';
      window.App?.showToast('El texto del cintillo es obligatorio', 'error');
      return;
    }

    const btn = container.querySelector('#btn-save-cintillo');
    btn.disabled = true;
    btn.textContent = 'Guardando en Cloudflare R2...';

    try {
      const payload = {
        texto: texto,
        color: this.data.color || 'verde',
      };

      const res = await window.API.put('/api/cintillo', payload);
      window.App?.showToast('✓ Cambios guardados correctamente en R2.', 'success');

      if (res.data?.actualizadoEn) {
        const lastEl = container.querySelector('#cintillo-last-saved');
        if (lastEl) lastEl.textContent = `Actualizado: ${new Date(res.data.actualizadoEn).toLocaleString()}`;
      }
    } catch (err) {
      window.App?.showToast(`⚠ Error al guardar: ${err.message}`, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
        </svg>
        Guardar cambios en Cintillo
      `;
    }
  }
};
