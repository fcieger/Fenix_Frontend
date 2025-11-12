export interface KioskModeConfig {
  bloquearTeclasSistema?: boolean;
  bloquearMenuContexto?: boolean;
  bloquearSelecao?: boolean;
  bloquearZoom?: boolean;
  bloquearRefresh?: boolean;
}

class KioskMode {
  private config: KioskModeConfig = {};
  private eventListeners: Array<{ element: any; event: string; handler: any }> = [];

  enable(config: KioskModeConfig = {}) {
    this.config = {
      bloquearTeclasSistema: true,
      bloquearMenuContexto: true,
      bloquearSelecao: false,
      bloquearZoom: true,
      bloquearRefresh: true,
      ...config
    };

    if (this.config.bloquearTeclasSistema) {
      this.bloquearTeclasSistema();
    }

    if (this.config.bloquearMenuContexto) {
      this.bloquearMenuContexto();
    }

    if (this.config.bloquearSelecao) {
      this.bloquearSelecaoTexto();
    }

    if (this.config.bloquearZoom) {
      this.bloquearZoom();
    }

    if (this.config.bloquearRefresh) {
      this.bloquearRefresh();
    }
  }

  disable() {
    // Remover todos os event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  private bloquearTeclasSistema() {
    const handler = (e: KeyboardEvent) => {
      // F11 (fullscreen nativo)
      if (e.key === 'F11') {
        e.preventDefault();
        return false;
      }

      // Alt + F4 (fechar janela)
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        return false;
      }

      // Ctrl + W (fechar aba)
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        return false;
      }

      // Ctrl + Shift + Q (fechar navegador)
      if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
        e.preventDefault();
        return false;
      }

      // Permitir Ctrl+H, Ctrl+D, Ctrl+P do nosso sistema
      // Mas bloquear outros Ctrl+...
    };

    document.addEventListener('keydown', handler);
    this.eventListeners.push({ element: document, event: 'keydown', handler });
  }

  private bloquearMenuContexto() {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handler);
    this.eventListeners.push({ element: document, event: 'contextmenu', handler });
  }

  private bloquearSelecaoTexto() {
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    style.id = 'kiosk-mode-no-select';
    document.head.appendChild(style);
  }

  private bloquearZoom() {
    // Bloquear pinch zoom
    const handler = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', handler, { passive: false });
    this.eventListeners.push({ element: document, event: 'touchstart', handler });

    // Bloquear zoom via teclado (Ctrl + / Ctrl -)
    const keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', keyHandler);
    this.eventListeners.push({ element: document, event: 'keydown', handler: keyHandler });

    // Adicionar meta tag viewport
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
  }

  private bloquearRefresh() {
    const handler = (e: KeyboardEvent) => {
      // F5 do nosso sistema é desconto, não refresh
      // Ctrl + R
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', handler);
    this.eventListeners.push({ element: document, event: 'keydown', handler });
  }
}

export const kioskMode = new KioskMode();



