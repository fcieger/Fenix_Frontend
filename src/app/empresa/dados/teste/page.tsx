'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';

export default function TesteEmpresaPage() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Carregando dados da empresa...');
        
        // Usar token fixo para teste
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RlQGllZ2VyLmNvbS5iciIsInN1YiI6IjJiODY2MTI2LThjZmEtNGM4ZC1iNWZiLWE5MWU1Y2M0YzE4YiIsImlhdCI6MTc2MDI1MTk5OSwiZXhwIjoxNzYwMzM4Mzk5fQ.DeqO9sMZWlv0hPn-FCsLMf6qdv302b_6QGjAvKMc6dk';
        const companyId = '2c650c76-4e2a-4b58-933c-c3f8b7434d80';
        
        console.log('🔄 Chamando apiService.getCompany...');
        
        // Testar fetch direto primeiro
        const response = await fetch(`http://localhost:3001/api/companies/${companyId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const companyData = await response.json();
        console.log('✅ Dados da empresa carregados:', companyData);
        setCompany(companyData);
      } catch (err) {
        console.error('❌ Erro ao carregar dados da empresa:', err);
        setError(`Erro ao carregar dados da empresa: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">Carregando dados da empresa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-xl font-bold">Erro</p>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dados da Empresa (Teste)</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Informações da Empresa</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{company?.name || 'N/A'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{company?.cnpj || 'N/A'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{company?.emails?.[0]?.address || 'N/A'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{company?.phones?.[0]?.number || 'N/A'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{company?.address?.street || 'N/A'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{company?.address?.city || 'N/A'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{company?.address?.state || 'N/A'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{company?.address?.zip || 'N/A'}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Atividade Principal</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded">{company?.mainActivity || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
