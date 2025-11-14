'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Eye } from 'lucide-react';
import { api } from '@/config/api';

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/credito/admin/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.name?.toLowerCase().includes(busca.toLowerCase()) ||
    c.cnpj?.includes(busca)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/credito/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Users className="h-8 w-8 mr-3 text-blue-600" />
          Clientes
        </h1>
        <p className="text-gray-600 mt-2">Visualize todos os clientes que solicitaram crédito</p>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou CNPJ..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Tabela */}
      {clientesFiltrados.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Solicitações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aprovadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Última Solicitação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{cliente.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.cnpj}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cliente.totalsolicitacoes || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      {cliente.aprovadas || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.ultimasolicitacao
                      ? new Date(cliente.ultimasolicitacao).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/credito/admin/clientes/${cliente.id}`}
                      className="text-blue-600 hover:text-blue-700 inline-flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Nenhum cliente encontrado.</p>
        </div>
      )}
    </div>
  );
}




