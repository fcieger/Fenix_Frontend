import { useEffect, useCallback, useRef } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  callback: () => void;
  description?: string;
  disabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  disabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { disabled = false, preventDefault = true } = options;
  const shortcutsRef = useRef(shortcuts);

  // Atualizar ref quando shortcuts mudarem
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Se estiver desabilitado, não fazer nada
      if (disabled) return;

      // Verificar se o foco está em um input/textarea (exceto se for ESC)
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      const isContentEditable = target.isContentEditable;

      // Para ESC, sempre permitir
      if (event.key === 'Escape') {
        if (preventDefault) event.preventDefault();
        
        const shortcut = shortcutsRef.current.find(s => 
          s.key.toLowerCase() === 'escape' && !s.disabled
        );
        
        if (shortcut) {
          shortcut.callback();
        }
        return;
      }

      // Para outras teclas de função (F1-F12), sempre permitir
      const isFunctionKey = event.key.match(/^F\d{1,2}$/i);
      
      if (!isFunctionKey && (isInput || isContentEditable)) {
        // Se for Ctrl+P, Ctrl+H, Ctrl+D, permitir
        const isCtrlShortcut = event.ctrlKey && ['p', 'h', 'd'].includes(event.key.toLowerCase());
        if (!isCtrlShortcut) return;
      }

      // Buscar atalho correspondente
      const shortcut = shortcutsRef.current.find(s => {
        if (s.disabled) return false;

        const keyMatches = s.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatches = !!s.ctrl === event.ctrlKey;
        const altMatches = !!s.alt === event.altKey;
        const shiftMatches = !!s.shift === event.shiftKey;

        return keyMatches && ctrlMatches && altMatches && shiftMatches;
      });

      if (shortcut) {
        if (preventDefault) event.preventDefault();
        shortcut.callback();
      }
    },
    [disabled, preventDefault]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { shortcuts: shortcutsRef.current };
}





