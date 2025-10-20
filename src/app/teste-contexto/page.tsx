'use client';

import { useAuth } from '@/contexts/auth-context';
import { useState, useEffect } from 'react';

export default function TesteContextoPage() {
  const { user, isAuthenticated, isLoading, token, login } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('Componente montado');
    addLog(`isLoading: ${isLoading}`);
    addLog(`isAuthenticated: ${isAuthenticated}`);
    addLog(`user: ${user ? 'Presente' : 'Ausente'}`);
    addLog(`token: ${token ? 'Presente' : 'Ausente'}`);
  }, [isLoading, isAuthenticated, user, token]);

  const handleTesteLogin = async () => {
    addLog('Iniciando teste de login...');
    try {
      await login('teste@ieger.com.br', '123456');
      addLog('Login realizado com sucesso!');
    } catch (error) {
      addLog(`Erro no login: ${error}`);
    }
  };

  const handleLimparLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teste do Contexto de Autenticação</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estado do Contexto */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Estado do Contexto</h2>
            <div className="space-y-2">
              <p><strong>isLoading:</strong> {isLoading ? 'Sim' : 'Não'}</p>
              <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'Sim' : 'Não'}</p>
              <p><strong>Token:</strong> {token ? token.substring(0, 30) + '...' : 'Nenhum'}</p>
            </div>
          </div>

          {/* Dados do Usuário */}
          <div className="bg-white rounded-lg shadow p-6">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Nenhum usuário logado</p>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Ações</h2>
          <div className="space-x-4">
            <button
              onClick={handleTesteLogin}
              disabled={isLoading || isAuthenticated}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isLoading ? 'Carregando...' : 'Fazer Login de Teste'}
            </button>
            
            <button
              onClick={handleLimparLogs}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Limpar Logs
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Logs de Debug</h2>
          <div className="bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">Nenhum log ainda</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dados Brutos */}
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
