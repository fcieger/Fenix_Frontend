'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

export function useCompanyLogo() {
  const { user, isAuthenticated } = useAuth();
  const [logo, setLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && typeof window !== 'undefined') {
      // TODO: Implementar carregamento da logo da empresa do backend
      // Por enquanto, vamos simular com localStorage
      const savedLogo = localStorage.getItem('company-logo');
      console.log('🔄 Carregando logo do localStorage:', savedLogo ? 'Encontrada' : 'Não encontrada');
      if (savedLogo) {
        setLogo(savedLogo);
        console.log('✅ Logo carregada do localStorage');
      }
    }
  }, [isAuthenticated, user]);

  const updateLogo = (newLogo: string | null) => {
    console.log('🔧 useCompanyLogo.updateLogo chamado:', newLogo ? 'Com logo' : 'Sem logo');
    setLogo(newLogo);
    if (typeof window !== 'undefined') {
      if (newLogo) {
        localStorage.setItem('company-logo', newLogo);
        console.log('💾 Logo salva no localStorage');
      } else {
        localStorage.removeItem('company-logo');
        console.log('🗑️ Logo removida do localStorage');
      }
    }
  };

  return {
    logo,
    loading,
    updateLogo
  };
}
