'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export interface PageContext {
  tipo: 'produto' | 'cadastro' | 'geral';
  nome?: string;
  valor?: number;
  descricao?: string;
}

export function usePageContext(): PageContext {
  const pathname = usePathname();
  const [context, setContext] = useState<PageContext>({ tipo: 'geral' });

  useEffect(() => {
    if (pathname.includes('/produtos')) {
      setContext({ tipo: 'produto' });
    } else if (pathname.includes('/cadastros')) {
      setContext({ tipo: 'cadastro' });
    } else {
      setContext({ tipo: 'geral' });
    }
  }, [pathname]);

  return context;
}


