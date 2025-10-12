'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { apiService } from '@/lib/api';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Bot,
  Settings,
  Bell,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Star,
  BarChart3,
  Users,
  Calendar,
  Link,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Shield,
  Target,
  CreditCard,
  LineChart,
  Activity,
  UserPlus,
  PlusCircle,
  TrendingDown,
  Edit,
  Trash2,
  Filter,
  Download,
  MapPin,
  RefreshCw,
  Building2,
  User as UserIcon
} from 'lucide-react';
import CadastrosAIAssistant from '@/components/CadastrosAIAssistant';

export default function CadastrosPage() {
  const router = useRouter();
  const { user, token, logout, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [cadastros, setCadastros] = useState<any[]>([]);
  const [isLoadingCadastros, setIsLoadingCadastros] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [editingCadastro, setEditingCadastro] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: number, name: string} | null>(null);
  const [expandedCadastros, setExpandedCadastros] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Buscar cadastros do backend
  useEffect(() => {
    const fetchCadastros = async () => {
      console.log('🔍 Estado de autenticação:', { isAuthenticated, token: !!token, isLoading });
      
      if (!isAuthenticated || !token) {
        console.log('❌ Não autenticado ou sem token:', { isAuthenticated, token: !!token });
        return;
      }
      
      try {
        console.log('🔍 Buscando cadastros com token:', token.substring(0, 20) + '...');
        setIsLoadingCadastros(true);
        setError(null);
        const data = await apiService.getCadastros(token);
        console.log('✅ Cadastros carregados:', data);
        setCadastros(data);
      } catch (error) {
        console.error('❌ Erro ao buscar cadastros:', error);
        setError('Erro ao carregar cadastros');
      } finally {
        setIsLoadingCadastros(false);
      }
    };

    if (isAuthenticated && token) {
      fetchCadastros();
    }
  }, [isAuthenticated, token, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">Carregando cadastros...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Filtrar cadastros baseado no termo de busca
  const filteredCadastros = cadastros.filter(cadastro =>
    cadastro.nomeRazaoSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadastro.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadastro.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginação
  const totalCadastros = filteredCadastros.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCadastros);
  const currentCadastros = filteredCadastros.slice(startIndex, endIndex);

  const handleEdit = (id: number) => {
    const cadastro = cadastros.find(c => c.id === id);
    if (cadastro) {
      // Redirecionar para a tela de novo cadastro com dados de edição
      const queryParams = new URLSearchParams({
        edit: 'true',
        id: cadastro.id.toString(),
        data: JSON.stringify(cadastro)
      });
      router.push(`/cadastros/novo?${queryParams.toString()}`);
    }
  };

  const handleDelete = (id: number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      console.log('🗑️ Tentando deletar cadastro:', deleteConfirm.id);
      await apiService.deleteCadastro(deleteConfirm.id.toString(), token!);
      console.log('✅ Cadastro deletado com sucesso');
      
      // Remover da lista local
      setCadastros(prev => prev.filter(c => c.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error('❌ Erro ao deletar cadastro:', error);
      
      // Se o erro indica que o item está vinculado, tentar inativar
      if (error.message?.includes('vinculado') || error.message?.includes('vínculo')) {
        try {
          console.log('🔄 Tentando inativar cadastro em vez de deletar');
          await apiService.updateCadastro(deleteConfirm.id.toString(), { ativo: false } as any, token!);
          console.log('✅ Cadastro inativado com sucesso');
          
          // Atualizar na lista local
          setCadastros(prev => prev.map(c => 
            c.id === deleteConfirm.id ? { ...c, ativo: false } : c
          ));
          setDeleteConfirm(null);
        } catch (inactivateError) {
          console.error('❌ Erro ao inativar cadastro:', inactivateError);
          setError('Erro ao excluir cadastro. Tente novamente.');
        }
      } else {
        setError('Erro ao excluir cadastro. Tente novamente.');
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const toggleExpanded = (id: number) => {
    setExpandedCadastros(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleNewCadastro = () => {
    router.push('/cadastros/novo');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
              <div>
              <h1 className="text-3xl font-bold mb-2">Lista de Clientes</h1>
              <p className="text-purple-100">Mostrando 1 a {Math.min(itemsPerPage, totalCadastros)} de {totalCadastros} clientes</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsAIAssistantOpen(true)}
                className="bg-white text-purple-700 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                IA - Gerar Cliente
              </Button>
              <Button
                onClick={handleNewCadastro}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                + Novo Cliente
              </Button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Itens por página:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

            
        {/* Cadastros Table */}
        <Card className="overflow-hidden">

          {isLoadingCadastros ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="text-gray-600 mt-2">Carregando cadastros...</p>
                  </div>
                </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : currentCadastros.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cadastro encontrado</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro cadastro.'}
                </p>
                {!searchTerm && (
                  <Button onClick={handleNewCadastro}>
                      <Plus className="w-4 h-4 mr-2" />
                    Novo Cadastro
                    </Button>
                )}
                  </div>
                </div>
          ) : (
                <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          NOME/RAZÃO SOCIAL
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CÓDIGO
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          APELIDO
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TIPO
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          DOCUMENTO
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          EMAIL
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          TELEFONE
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          AÇÕES
                        </th>
                      </tr>
                    </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCadastros.map((cadastro) => {
                    const isExpanded = expandedCadastros.has(cadastro.id);
                    return (
                      <React.Fragment key={cadastro.id}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleExpanded(cadastro.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              <span className="font-medium text-gray-900">
                                {cadastro.nomeRazaoSocial || 'Nome não informado'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              {cadastro.codigo || 'Sem código'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              {cadastro.nomeFantasia || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              {cadastro.tipoPessoa === 'Pessoa Física' ? 'PF' : 'PJ'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              {cadastro.cpfCnpj || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              {cadastro.email || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              {cadastro.telefone || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(cadastro.id)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                                <span className="ml-1">Editar</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(cadastro.id, cadastro.nomeRazaoSocial || 'Cadastro')}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="ml-1">Excluir</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded Details */}
                        {isExpanded && (
                          <tr className="bg-gray-50">
                            <td colSpan={5} className="px-4 py-6">
                              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                {/* Header */}
                                <div className="flex items-center space-x-3 mb-6">
                                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                    <UserIcon className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900">Detalhes do Cadastro</h4>
                                  </div>
                                </div>

                                {/* General Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Nome/Razão Social</label>
                                    <p className="text-sm text-gray-900">{cadastro.nomeRazaoSocial || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Nome Fantasia</label>
                                    <p className="text-sm text-gray-900">{cadastro.nomeFantasia || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Tipo de Pessoa</label>
                                    <p className="text-sm text-gray-900">{cadastro.tipoPessoa || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">CPF/CNPJ</label>
                                    <p className="text-sm text-gray-900">{cadastro.cpfCnpj || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-sm text-gray-900">{cadastro.email || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Telefone</label>
                                    <p className="text-sm text-gray-900">{cadastro.telefone || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Inscrição Estadual</label>
                                    <p className="text-sm text-gray-900">{cadastro.inscricaoEstadual || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Inscrição Municipal</label>
                                    <p className="text-sm text-gray-900">{cadastro.inscricaoMunicipal || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">SUFRAMA</label>
                                    <p className="text-sm text-gray-900">{cadastro.suframa || 'Não informado'}</p>
                                  </div>
                                  <div className="md:col-span-2 lg:col-span-3">
                                    <label className="text-sm font-medium text-gray-500">Observações</label>
                                    <p className="text-sm text-gray-900">{cadastro.observacoes || 'Nenhuma observação'}</p>
                                  </div>
                                </div>

                                {/* Addresses */}
                                {cadastro.enderecos && cadastro.enderecos.length > 0 && (
                                  <div className="mb-8">
                                    <div className="flex items-center space-x-3 mb-4">
                                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                        <MapPin className="w-3 h-3 text-white" />
                                      </div>
                                      <h5 className="text-md font-semibold text-gray-900">Endereços</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {cadastro.enderecos.map((endereco: any, index: number) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                              <label className="text-xs font-medium text-gray-500">Tipo</label>
                                              <p className="text-gray-900">{endereco.tipo || 'Não informado'}</p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500">CEP</label>
                                              <p className="text-gray-900">{endereco.cep || 'Não informado'}</p>
                                            </div>
                                            <div className="col-span-2">
                                              <label className="text-xs font-medium text-gray-500">Logradouro</label>
                                              <p className="text-gray-900">{endereco.logradouro || 'Não informado'}</p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500">Número</label>
                                              <p className="text-gray-900">{endereco.numero || 'Não informado'}</p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500">Bairro</label>
                                              <p className="text-gray-900">{endereco.bairro || 'Não informado'}</p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500">Cidade</label>
                                              <p className="text-gray-900">{endereco.cidade || 'Não informado'}</p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500">Estado</label>
                                              <p className="text-gray-900">{endereco.estado || 'Não informado'}</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Contacts */}
                                {cadastro.contatos && cadastro.contatos.length > 0 && (
                                  <div>
                                    <div className="flex items-center space-x-3 mb-4">
                                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                        <Users className="w-3 h-3 text-white" />
                                      </div>
                                      <h5 className="text-md font-semibold text-gray-900">Contatos</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {cadastro.contatos.map((contato: any, index: number) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                              <label className="text-xs font-medium text-gray-500">Pessoa de Contato</label>
                                              <p className="text-gray-900">{contato.pessoaContato || 'Não informado'}</p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500">Cargo</label>
                                              <p className="text-gray-900">{contato.cargo || 'Não informado'}</p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500">Email</label>
                                              <p className="text-gray-900">{contato.email || 'Não informado'}</p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500">Telefone Comercial</label>
                                              <p className="text-gray-900">{contato.telefoneComercial || 'Não informado'}</p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500">Celular</label>
                                              <p className="text-gray-900">{contato.celular || 'Não informado'}</p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500">Celular de Contato</label>
                                              <p className="text-gray-900">{contato.celularContato || 'Não informado'}</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                    </tbody>
                  </table>
                </div>
          )}
        </Card>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Total: {totalCadastros} clientes</span>
            </div>
            <div className="text-sm text-gray-500">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}, {new Date().toLocaleTimeString('pt-BR')}
            </div>
          </div>
        </div>
              </div>

      {/* AI Assistant Modal */}
      <CadastrosAIAssistant 
        isOpen={isAIAssistantOpen} 
        onClose={() => setIsAIAssistantOpen(false)} 
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o cadastro <strong>"{deleteConfirm.name}"</strong>?
              {cadastros.find(c => c.id === deleteConfirm.id)?.enderecos?.length > 0 && (
                <span className="block mt-2 text-sm text-orange-600">
                  ⚠️ Este cadastro possui endereços vinculados e será inativado em vez de excluído.
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="px-4 py-2"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                {cadastros.find(c => c.id === deleteConfirm.id)?.enderecos?.length > 0 ? (
                  'Inativar'
                ) : (
                  'Excluir'
                )}
              </Button>
        </div>
      </div>
    </div>
      )}
    </Layout>
  );
}