'use client';

import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';

export default function TesteLoginPage() {
  const { user, isAuthenticated, isLoading, token, login } = useAuth();
  const [testando, setTestando] = useState(false);

  const handleTesteLogin = async () => {
    setTestando(true);
    try {
      await login('teste@ieger.com.br', '123456');
      console.log('✅ Login realizado com sucesso!');
    } catch (error) {
      console.error('❌ Erro no login:', error);
    } finally {
      setTestando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fenix_token');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teste de Login</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado da Autenticação</h2>
          <div className="space-y-2">
            <p><strong>isLoading:</strong> {isLoading ? 'Sim' : 'Não'}</p>
            <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'Sim' : 'Não'}</p>
            <p><strong>Token:</strong> {token ? token.substring(0, 30) + '...' : 'Nenhum'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Dados do Usuário</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>Nome:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Telefone:</strong> {user.phone}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Empresas:</strong> {user.companies?.length || 0}</p>
              {user.companies && user.companies.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold">Empresas:</h3>
                  {user.companies.map((company: any) => (
                    <div key={company.id} className="ml-4 mt-2 p-2 bg-gray-100 rounded">
                      <p><strong>Nome:</strong> {company.name}</p>
                      <p><strong>CNPJ:</strong> {company.cnpj}</p>
                      <p><strong>ID:</strong> {company.id}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum usuário logado</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Ações</h2>
          <div className="space-x-4">
            <button
              onClick={handleTesteLogin}
              disabled={testando || isAuthenticated}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {testando ? 'Testando...' : 'Fazer Login de Teste'}
            </button>
            
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Dados Brutos (JSON)</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({ user, isAuthenticated, isLoading, token }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
