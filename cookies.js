// =============================================================
// Tahor Clean — Banner de cookies / consentimiento
// =============================================================
// Drop-in: solo agrega <script defer src="cookies.js"></script>
// al final del <body> de tu index.html.
//
// Cumple con LOPDP (Ecuador) y buenas prácticas GDPR:
//   · Consentimiento explícito y granular
//   · Rechazo tan visible como aceptación
//   · Categorías desmarcadas por defecto
//   · Posibilidad de cambiar la preferencia en cualquier momento
//
// Para escuchar el consentimiento desde otro código:
//   window.addEventListener('cookies:updated', (e) => {
//     console.log(e.detail);
//     // { necessary: true, analytics: false, marketing: false }
//   });
// =============================================================

(function () {
  'use strict';

  const STORAGE_KEY = 'tahor_cookies_consent_v1';
  const VERSION     = 1;
  const MAX_AGE_DAYS = 365;

  // -----------------------------------------------------------
  // Estado y storage
  // -----------------------------------------------------------
  function readConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (obj.version !== VERSION) return null;
      const ageDays = (Date.now() - obj.timestamp) / 86400000;
      if (ageDays > MAX_AGE_DAYS) return null;
      return obj;
    } catch { return null; }
  }

  function saveConsent(prefs) {
    const obj = {
      version: VERSION,
      timestamp: Date.now(),
      necessary: true,
      analytics: !!prefs.analytics,
      marketing: !!prefs.marketing,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    window.dispatchEvent(new CustomEvent('cookies:updated', { detail: obj }));
    return obj;
  }

  // -----------------------------------------------------------
  // Estilos inyectados (no dependen de Tailwind ni nada externo)
  // -----------------------------------------------------------
  const css = `
.tcc-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 99998; display: none; backdrop-filter: blur(2px); }
.tcc-overlay.show { display: block; }

.tcc-banner {
  position: fixed; left: 1rem; right: 1rem; bottom: 1rem;
  z-index: 99999;
  background: #fff; color: #0b1220;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,.25);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 14px; line-height: 1.55;
  max-width: 580px; margin-left: auto;
  transform: translateY(120%);
  transition: transform .35s cubic-bezier(.4,0,.2,1);
}
.tcc-banner.show { transform: translateY(0); }

.tcc-title { font-weight: 700; font-size: 15px; margin: 0 0 .35rem; }
.tcc-text { color: #475569; margin: 0 0 .9rem; }
.tcc-text a { color: #2563eb; text-decoration: underline; }

.tcc-actions {
  display: flex; flex-wrap: wrap; gap: .5rem; align-items: center;
}
.tcc-btn {
  padding: .55rem 1rem;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: background .15s, border-color .15s, color .15s;
  font-family: inherit;
}
.tcc-btn-primary   { background: #0b1220; color: #fff; }
.tcc-btn-primary:hover   { background: #1f2937; }
.tcc-btn-secondary { background: #fff; color: #0b1220; border-color: #e2e8f0; }
.tcc-btn-secondary:hover { background: #f8fafc; }
.tcc-btn-link {
  background: transparent; border: none; color: #475569;
  text-decoration: underline; padding: .55rem .25rem;
  cursor: pointer; font-size: 13px; font-weight: 500;
}
.tcc-btn-link:hover { color: #0b1220; }

/* Modal de configuración */
.tcc-modal {
  position: fixed; left: 50%; top: 50%;
  transform: translate(-50%, -50%) scale(.96);
  z-index: 99999;
  background: #fff; color: #0b1220;
  border-radius: 14px;
  width: calc(100% - 2rem); max-width: 540px; max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,.35);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  display: none;
}
.tcc-modal.show { display: block; transform: translate(-50%, -50%) scale(1); }
.tcc-modal-head {
  padding: 1.1rem 1.25rem; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}
.tcc-modal-head h3 { margin: 0; font-size: 16px; font-weight: 700; }
.tcc-modal-close {
  background: none; border: none; font-size: 22px; line-height: 1;
  cursor: pointer; color: #64748b; padding: .25rem .5rem;
}
.tcc-modal-body { padding: 1.1rem 1.25rem; }

.tcc-cat {
  border: 1px solid #e2e8f0; border-radius: 10px;
  padding: .85rem 1rem; margin-bottom: .65rem;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
}
.tcc-cat-info { flex: 1; }
.tcc-cat-title { font-weight: 600; font-size: 14px; margin-bottom: .15rem; }
.tcc-cat-desc { font-size: 12.5px; color: #64748b; }

/* Toggle switch */
.tcc-switch { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }
.tcc-switch input { opacity: 0; width: 0; height: 0; }
.tcc-slider {
  position: absolute; cursor: pointer; inset: 0;
  background: #cbd5e1; border-radius: 22px;
  transition: background .2s;
}
.tcc-slider:before {
  content: ""; position: absolute;
  height: 16px; width: 16px; left: 3px; top: 3px;
  background: #fff; border-radius: 50%;
  transition: transform .2s;
}
.tcc-switch input:checked + .tcc-slider { background: #16a34a; }
.tcc-switch input:checked + .tcc-slider:before { transform: translateX(18px); }
.tcc-switch input:disabled + .tcc-slider { background: #16a34a; opacity: .55; cursor: not-allowed; }

.tcc-modal-foot {
  padding: 1rem 1.25rem; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; gap: .5rem; flex-wrap: wrap;
}

/* Botón flotante para reabrir preferencias después */
.tcc-fab {
  position: fixed; left: 1rem; bottom: 1rem;
  z-index: 99997;
  width: 38px; height: 38px;
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,.08);
  transition: all .15s;
  font-size: 18px;
  opacity: .8;
}
.tcc-fab:hover { opacity: 1; transform: scale(1.05); }

@media (max-width: 480px) {
  .tcc-banner { left: .5rem; right: .5rem; bottom: .5rem; padding: .9rem 1rem; }
  .tcc-actions { flex-direction: column; align-items: stretch; }
  .tcc-actions .tcc-btn { width: 100%; }
  .tcc-actions .tcc-btn-link { width: 100%; text-align: center; }
}
`;

  // -----------------------------------------------------------
  // HTML del banner y modal
  // -----------------------------------------------------------
  const bannerHTML = `
<div class="tcc-banner" id="tcc-banner" role="dialog" aria-live="polite" aria-label="Aviso de cookies">
  <p class="tcc-title">🍪 Usamos cookies</p>
  <p class="tcc-text">
    Utilizamos cookies y tecnologías similares para que el sitio funcione, mejorar tu experiencia
    y analizar el uso. Algunos datos personales (como tu pedido) se procesan según nuestra
    <a href="legal-tahor-clean.html" target="_blank" rel="noopener">Política de Privacidad</a>.
    Puedes aceptar, rechazar las opcionales o configurarlas.
  </p>
  <div class="tcc-actions">
    <button class="tcc-btn tcc-btn-primary"   id="tcc-accept-all">Aceptar todas</button>
    <button class="tcc-btn tcc-btn-secondary" id="tcc-reject-all">Rechazar opcionales</button>
    <button class="tcc-btn-link"              id="tcc-configure">Configurar</button>
  </div>
</div>`;

  const modalHTML = `
<div class="tcc-overlay" id="tcc-overlay"></div>
<div class="tcc-modal" id="tcc-modal" role="dialog" aria-modal="true" aria-label="Configuración de cookies">
  <div class="tcc-modal-head">
    <h3>Configurar cookies</h3>
    <button class="tcc-modal-close" id="tcc-modal-close" aria-label="Cerrar">×</button>
  </div>
  <div class="tcc-modal-body">

    <div class="tcc-cat">
      <div class="tcc-cat-info">
        <div class="tcc-cat-title">Necesarias</div>
        <div class="tcc-cat-desc">
          Indispensables para el funcionamiento del sitio: carrito, sesión, preferencias.
          No se pueden desactivar.
        </div>
      </div>
      <label class="tcc-switch">
        <input type="checkbox" checked disabled>
        <span class="tcc-slider"></span>
      </label>
    </div>

    <div class="tcc-cat">
      <div class="tcc-cat-info">
        <div class="tcc-cat-title">Análisis y rendimiento</div>
        <div class="tcc-cat-desc">
          Nos ayudan a entender cómo se usa el sitio (páginas más vistas, errores) para mejorarlo.
          Datos anónimos.
        </div>
      </div>
      <label class="tcc-switch">
        <input type="checkbox" id="tcc-cat-analytics">
        <span class="tcc-slider"></span>
      </label>
    </div>

    <div class="tcc-cat">
      <div class="tcc-cat-info">
        <div class="tcc-cat-title">Marketing y publicidad</div>
        <div class="tcc-cat-desc">
          Para mostrar contenido y anuncios relevantes en otras plataformas.
        </div>
      </div>
      <label class="tcc-switch">
        <input type="checkbox" id="tcc-cat-marketing">
        <span class="tcc-slider"></span>
      </label>
    </div>

  </div>
  <div class="tcc-modal-foot">
    <button class="tcc-btn tcc-btn-secondary" id="tcc-save-reject">Solo necesarias</button>
    <button class="tcc-btn tcc-btn-primary"   id="tcc-save-selection">Guardar selección</button>
  </div>
</div>`;

  // -----------------------------------------------------------
  // Inicialización
  // -----------------------------------------------------------
  function init() {
    // Inyectar estilos
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // Inyectar HTML
    const wrap = document.createElement('div');
    wrap.innerHTML = bannerHTML + modalHTML + `<button class="tcc-fab" id="tcc-fab" title="Configuración de cookies" aria-label="Configuración de cookies">🍪</button>`;
    document.body.appendChild(wrap);

    const $banner   = document.getElementById('tcc-banner');
    const $overlay  = document.getElementById('tcc-overlay');
    const $modal    = document.getElementById('tcc-modal');
    const $fab      = document.getElementById('tcc-fab');
    const $cbAna    = document.getElementById('tcc-cat-analytics');
    const $cbMkt    = document.getElementById('tcc-cat-marketing');

    // Si ya hay consentimiento válido → no mostrar banner, solo el FAB
    const stored = readConsent();
    if (stored) {
      $cbAna.checked = !!stored.analytics;
      $cbMkt.checked = !!stored.marketing;
      window.dispatchEvent(new CustomEvent('cookies:updated', { detail: stored }));
    } else {
      // Mostrar banner con animación
      requestAnimationFrame(() => $banner.classList.add('show'));
    }

    // Acciones del banner
    document.getElementById('tcc-accept-all').addEventListener('click', () => {
      saveConsent({ analytics: true, marketing: true });
      $cbAna.checked = true; $cbMkt.checked = true;
      hideBanner();
    });

    document.getElementById('tcc-reject-all').addEventListener('click', () => {
      saveConsent({ analytics: false, marketing: false });
      $cbAna.checked = false; $cbMkt.checked = false;
      hideBanner();
    });

    document.getElementById('tcc-configure').addEventListener('click', openModal);

    // FAB
    $fab.addEventListener('click', openModal);

    // Modal
    document.getElementById('tcc-modal-close').addEventListener('click', closeModal);
    $overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    document.getElementById('tcc-save-reject').addEventListener('click', () => {
      saveConsent({ analytics: false, marketing: false });
      $cbAna.checked = false; $cbMkt.checked = false;
      closeModal(); hideBanner();
    });

    document.getElementById('tcc-save-selection').addEventListener('click', () => {
      saveConsent({ analytics: $cbAna.checked, marketing: $cbMkt.checked });
      closeModal(); hideBanner();
    });

    function hideBanner() {
      $banner.classList.remove('show');
      setTimeout(() => { $banner.style.display = 'none'; }, 350);
    }

    function openModal() {
      $overlay.classList.add('show');
      $modal.classList.add('show');
    }
    function closeModal() {
      $overlay.classList.remove('show');
      $modal.classList.remove('show');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
