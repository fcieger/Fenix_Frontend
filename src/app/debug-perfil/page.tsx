'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

export default function DebugPerfilPage() {
  const { user, token, isLoading, isAuthenticated } = useAuth();
  const [apiData, setApiData] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const testApi = async () => {
    if (!token) return;
    
    setApiLoading(true);
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiData(data);
      } else {
        console.error('Erro na API:', response.status);
      }
    } catch (error) {
      console.error('Erro ao chamar API:', error);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      testApi();
    }
  }, [token]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Perfil</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">AuthContext State:</h2>
          <p>isLoading: {isLoading.toString()}</p>
          <p>isAuthenticated: {isAuthenticated.toString()}</p>
          <p>token: {token ? token.substring(0, 20) + '...' : 'null'}</p>
          <p>user: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold">API Data:</h2>
          <p>apiLoading: {apiLoading.toString()}</p>
          <p>apiData: {apiData ? JSON.stringify(apiData, null, 2) : 'null'}</p>
        </div>

        <button 
          onClick={testApi}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={!token || apiLoading}
        >
          {apiLoading ? 'Testando...' : 'Testar API'}
        </button>
      </div>
    </div>
  );
}
