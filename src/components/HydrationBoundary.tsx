'use client';

import { useEffect } from 'react';

export default function HydrationBoundary() {
  useEffect(() => {
    // Remover atributos adicionados por extensões do navegador que causam erro de hidratação
    const removeExtensionAttributes = () => {
      const body = document.body;
      if (body) {
        // Remover atributos comuns de extensões que causam problemas de hidratação
        const attributesToRemove = [
          'data-new-gr-c-s-check-loaded',
          'data-gr-ext-installed',
          'data-grammarly-shadow-root',
          'data-grammarly',
          'data-gramm_editor',
          'data-gramm_editor_plugin',
        ];

        attributesToRemove.forEach(attr => {
          if (body.hasAttribute(attr)) {
            body.removeAttribute(attr);
          }
        });
      }
    };

    // Executar imediatamente
    removeExtensionAttributes();

    // Executar após um pequeno delay para capturar atributos adicionados posteriormente
    const timeoutId = setTimeout(removeExtensionAttributes, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return null;
}
