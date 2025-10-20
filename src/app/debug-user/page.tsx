'use client';

import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';

export default function DebugUserPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Debug - Dados do Usuário</h1>
        
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Estado da Autenticação</h2>
            <div className="space-y-2">
              <p><strong>isLoading:</strong> {isLoading ? 'Sim' : 'Não'}</p>
              <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'Sim' : 'Não'}</p>
              <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'Nenhum'}</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Dados do Usuário</h2>
            {user ? (
              <div className="space-y-2">
                <p><strong>ID:</strong> {user.id || 'N/A'}</p>
                <p><strong>Nome:</strong> {user.name || 'N/A'}</p>
                <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                <p><strong>Telefone:</strong> {user.phone || 'N/A'}</p>
                <p><strong>Ativo:</strong> {user.isActive ? 'Sim' : 'Não'}</p>
                <p><strong>Empresas:</strong> {user.companies?.length || 0}</p>
                
                {user.companies && user.companies.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Empresas:</h3>
                    {user.companies.map((company: any, index: number) => (
                      <div key={index} className="ml-4 p-2 bg-gray-50 rounded">
                        <p><strong>Nome:</strong> {company.name}</p>
                        <p><strong>CNPJ:</strong> {company.cnpj}</p>
                        <p><strong>ID:</strong> {company.id}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Nenhum usuário carregado</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Dados Brutos (JSON)</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
