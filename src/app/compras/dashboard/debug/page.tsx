'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { Loader2, CheckCircle, XCircle, Search } from 'lucide-react';

export default function DebugComprasPage() {
  const { token, activeCompanyId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [numeroPedido, setNumeroPedido] = useState('123');
  const [companyId, setCompanyId] = useState('876fcdff-e957-4ca7-987f-19b934094f1d');

  const buscarPedido = async () => {
    if (!token || !companyId) {
      setError('Token ou company_id necessário');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const url = `/api/compras/dashboard/debug?company_id=${companyId}&numero=${numeroPedido}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error('Erro ao buscar pedido:', err);
      setError(err.message || 'Erro ao buscar pedido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCompanyId && !companyId) {
      setCompanyId(activeCompanyId);
    }
  }, [activeCompanyId, companyId]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center">
            <Search className="h-6 w-6 mr-2" />
            Debug - Validação de Pedidos de Compra
          </h1>

          {/* Formulário de busca */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company ID
                </label>
                <input
                  type="text"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="876fcdff-e957-4ca7-987f-19b934094f1d"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número do Pedido
                </label>
                <input
                  type="text"
                  value={numeroPedido}
                  onChange={(e) => setNumeroPedido(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="123"
                />
              </div>
            </div>
            <button
              onClick={buscarPedido}
              disabled={loading || !companyId || !numeroPedido}
              className="w-full md:w-auto px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Pedido
                </>
              )}
            </button>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Resultados */}
          {data && (
            <div className="space-y-6">
              {/* Diagnóstico principal */}
              {data.data?.diagnosticos && (
                <div className={`rounded-lg p-6 ${
                  data.data.diagnosticos.pedido123Encontrado 
                    ? 'bg-green-50 border-2 border-green-200' 
                    : 'bg-yellow-50 border-2 border-yellow-200'
                }`}>
                  <div className="flex items-center mb-4">
                    {data.data.diagnosticos.pedido123Encontrado ? (
                      <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-6 w-6 text-yellow-600 mr-2" />
                    )}
                    <h2 className="text-xl font-bold">
                      {data.data.diagnosticos.mensagem}
                    </h2>
                  </div>
                  
                  {data.data.diagnosticos.pedido123Exato && (
                    <div className="mt-4 bg-white rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Detalhes do Pedido:</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>ID:</strong> {data.data.diagnosticos.pedido123Exato.id}</div>
                        <div><strong>Número:</strong> {data.data.diagnosticos.pedido123Exato.numero}</div>
                        <div><strong>Status:</strong> {data.data.diagnosticos.pedido123Exato.status}</div>
                        <div><strong>Data Emissão:</strong> {new Date(data.data.diagnosticos.pedido123Exato.dataEmissao).toLocaleDateString('pt-BR')}</div>
                        <div><strong>Total:</strong> R$ {parseFloat(data.data.diagnosticos.pedido123Exato.totalGeral || 0).toFixed(2)}</div>
                        <div><strong>Company ID:</strong> {data.data.diagnosticos.pedido123Exato.companyId}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Estatísticas gerais */}
              {data.data?.estatisticas && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Estatísticas da Empresa</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {data.data.estatisticas.total_pedidos || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total de Pedidos</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <div className="text-2xl font-bold text-yellow-600">
                        {data.data.diagnosticos?.statusDistribuicao?.rascunho || 0}
                      </div>
                      <div className="text-sm text-gray-600">Rascunhos</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="text-2xl font-bold text-orange-600">
                        {data.data.diagnosticos?.statusDistribuicao?.pendente || 0}
                      </div>
                      <div className="text-sm text-gray-600">Pendentes</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {data.data.diagnosticos?.statusDistribuicao?.entregue || 0}
                      </div>
                      <div className="text-sm text-gray-600">Entregues</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Últimos pedidos */}
              {data.data?.ultimos50Pedidos && data.data.ultimos50Pedidos.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Últimos Pedidos ({data.data.ultimos50Pedidos.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.data.ultimos50Pedidos.slice(0, 10).map((pedido: any) => (
                          <tr key={pedido.id} className={pedido.numero === numeroPedido ? 'bg-yellow-50' : ''}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{pedido.numero}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(pedido.dataEmissao).toLocaleDateString('pt-BR')}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                pedido.status === 'rascunho' ? 'bg-yellow-100 text-yellow-800' :
                                pedido.status === 'pendente' ? 'bg-orange-100 text-orange-800' :
                                pedido.status === 'entregue' ? 'bg-green-100 text-green-800' :
                                pedido.status === 'faturado' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {pedido.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">R$ {pedido.totalGeral.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Dados completos (JSON) */}
              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer font-semibold">Ver dados completos (JSON)</summary>
                <pre className="mt-4 text-xs overflow-auto bg-white p-4 rounded border">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}






