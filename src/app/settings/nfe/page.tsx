'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Search, Settings, FileText, Edit, Trash2, 
  Copy, CheckCircle, AlertCircle, Clock, RefreshCw, 
  ArrowLeft, Loader2, XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useFeedback } from '@/contexts/feedback-context';
import { apiService, ConfiguracaoNfeResponse } from '@/lib/api';

interface NFeConfig {
  id: string;
  nome: string;
  descricao: string;
  tipoModelo: string;
  modelo: string;
  serie: string;
  numeroAtual: number;
  ambiente: 'homologacao' | 'producao';
  prefeitura: string;
  certificado: {
    nome: string;
    validade: string;
    status: 'valido' | 'vencido' | 'invalido';
  };
  empresa: string;
  dataCriacao: string;
  dataAtualizacao: string;
  ativo: boolean;
}

export default function ConfiguracoesNFEPage() {
  const router = useRouter();
  const { user, token, activeCompanyId, isAuthenticated, isLoading } = useAuth();
  const { openSuccess } = useFeedback();
  const [configuracoes, setConfiguracoes] = useState<NFeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState('ALL');
  const [filterAmbiente, setFilterAmbiente] = useState('ALL');

  // Função auxiliar para converter dados da API
  const convertApiDataToNFeConfig = (data: ConfiguracaoNfeResponse[]): NFeConfig[] => {
    return data.map(config => ({
      id: config.id,
      nome: config.descricaoModelo,
      descricao: `${config.tipoModelo} - Modelo ${config.modelo}`,
      tipoModelo: config.tipoModelo,
      modelo: config.modelo,
      serie: config.serie,
      numeroAtual: config.numeroAtual,
      ambiente: config.ambiente as 'homologacao' | 'producao',
      prefeitura: 'N/A', // Campo não disponível na API atual
      certificado: {
        nome: 'Certificado não configurado',
        validade: 'N/A',
        status: 'invalido' as const
      },
      empresa: 'Empresa Atual', // Usar dados do contexto de auth
      dataCriacao: config.createdAt,
      dataAtualizacao: config.updatedAt,
      ativo: config.ativo
    }));
  };

  // Carregar configurações da API
  useEffect(() => {
    const loadConfiguracoes = async () => {
      if (!token || !isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getConfiguracoesNfe(token, false);
        const configuracoesConvertidas = convertApiDataToNFeConfig(data);
        setConfiguracoes(configuracoesConvertidas);
      } catch (error: any) {
        console.error('Erro ao carregar configurações NFe:', error);
        setError('Erro ao carregar configurações de NFe. Tente novamente.');
        setConfiguracoes([]);
      } finally {
        setLoading(false);
      }
    };

    loadConfiguracoes();
  }, [token, isAuthenticated]);

  const filteredConfiguracoes = configuracoes.filter(config => {
    const matchesSearch = config.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         config.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         config.empresa.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTipo = filterTipo === 'ALL' || config.tipoModelo === filterTipo;
    const matchesAmbiente = filterAmbiente === 'ALL' || config.ambiente === filterAmbiente;
    
    return matchesSearch && matchesTipo && matchesAmbiente;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valido':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200">Válido</Badge>;
      case 'vencido':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border border-red-200">Vencido</Badge>;
      case 'invalido':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border border-gray-200">Inválido</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getAmbienteBadge = (ambiente: string) => {
    return ambiente === 'producao' 
      ? <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-200">Produção</Badge>
      : <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border border-yellow-200">Homologação</Badge>;
  };

  const handleNovaConfiguracao = () => {
    router.push('/settings/nfe/nova');
  };

  const handleEditar = (id: string) => {
    router.push(`/settings/nfe/nova?id=${id}`);
  };

  const handleDuplicar = async (id: string) => {
    try {
      if (!token) return;
      
      // Buscar configuração original
      const configOriginal = await apiService.getConfiguracaoNfe(id, token);
      
      // Criar nova configuração com dados similares
      const novaConfig = {
        ...configOriginal,
        descricaoModelo: `${configOriginal.descricaoModelo} (Cópia)`,
        serie: String(parseInt(configOriginal.serie) + 1),
        numeroAtual: 1
      };
      
      // Remover campos que não devem ser copiados
      delete (novaConfig as any).id;
      delete (novaConfig as any).companyId;
      delete (novaConfig as any).createdAt;
      delete (novaConfig as any).updatedAt;
      
      await apiService.createConfiguracaoNfe(novaConfig, token);
      
      // Recarregar lista
      const data = await apiService.getConfiguracoesNfe(token, false);
      const configuracoesConvertidas = convertApiDataToNFeConfig(data);
      setConfiguracoes(configuracoesConvertidas);
      
      openSuccess({
        title: 'Configuração duplicada!',
        message: 'A configuração foi duplicada com sucesso.'
      });
    } catch (error: any) {
      console.error('Erro ao duplicar configuração:', error);
      setError('Erro ao duplicar configuração. Tente novamente.');
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) {
      return;
    }

    try {
      if (!token) return;
      
      await apiService.deleteConfiguracaoNfe(id, token);
      
      // Recarregar lista
      const data = await apiService.getConfiguracoesNfe(token, false);
      const configuracoesConvertidas = convertApiDataToNFeConfig(data);
      setConfiguracoes(configuracoesConvertidas);
      
      openSuccess({
        title: 'Configuração excluída!',
        message: 'A configuração foi excluída com sucesso.'
      });
    } catch (error: any) {
      console.error('Erro ao excluir configuração:', error);
      setError('Erro ao excluir configuração. Tente novamente.');
    }
  };

  if (isLoading || (loading && configuracoes.length === 0)) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <p className="text-purple-600 font-medium">Carregando configurações...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header moderno */}
        <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 text-white shadow-lg rounded-2xl">
          <div className="px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
                    <Settings className="w-8 h-8 mr-3" />
                    Configurações de NFe
                  </h1>
                  <p className="text-purple-100 mt-1 text-sm sm:text-base">Gerencie as configurações de emissão de notas fiscais</p>
                </div>
              </div>
              <Button
                onClick={handleNovaConfiguracao}
                className="bg-white text-purple-700 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nova Configuração
              </Button>
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total</p>
                  <p className="text-3xl font-bold text-blue-900">{configuracoes.length}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Ativas</p>
                  <p className="text-3xl font-bold text-green-900">
                    {configuracoes.filter(c => c.ativo).length}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Certificados Vencidos</p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {configuracoes.filter(c => c.certificado.status === 'vencido').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500 rounded-xl shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Produção</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {configuracoes.filter(c => c.ambiente === 'producao').length}
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Buscar configurações..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-11 rounded-lg border-gray-300 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="flex h-11 px-4 rounded-lg border border-gray-300 bg-white text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
              >
                <option value="ALL">Todos os Tipos</option>
                <option value="nfe-produto">NF-e Produto</option>
                <option value="nfse-servico">NFS-e Serviço</option>
                <option value="nf-entrada">NF Entrada</option>
                <option value="nfce-consumidor">NFC-e Consumidor</option>
                <option value="mdfe">MDF-e</option>
              </select>

              <div className="flex gap-2">
                <select
                  value={filterAmbiente}
                  onChange={(e) => setFilterAmbiente(e.target.value)}
                  className="flex-1 h-11 px-4 rounded-lg border border-gray-300 bg-white text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                >
                  <option value="ALL">Todos os Ambientes</option>
                  <option value="producao">Produção</option>
                  <option value="homologacao">Homologação</option>
                </select>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setFilterTipo('ALL');
                    setFilterAmbiente('ALL');
                  }}
                  className="h-11 px-4 border-gray-300 hover:bg-gray-50 rounded-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabela de Configurações */}
        {filteredConfiguracoes.length === 0 && !loading ? (
          <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma configuração encontrada</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filterTipo !== 'ALL' || filterAmbiente !== 'ALL'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando sua primeira configuração de NFe para começar a emitir notas fiscais.'}
              </p>
              {(!searchQuery && filterTipo === 'ALL' && filterAmbiente === 'ALL') && (
                <Button
                  onClick={handleNovaConfiguracao}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeira Configuração
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Modelo/Série
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Ambiente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Certificado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Última Atualização
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredConfiguracoes.map((config) => (
                    <tr key={config.id} className="hover:bg-purple-50/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-semibold text-gray-900">{config.nome}</div>
                          <div className="text-sm text-gray-500">{config.descricao}</div>
                          <div className="text-xs text-gray-400">{config.empresa}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="px-3 py-1 rounded-full border-gray-300">
                          {config.tipoModelo}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm space-y-1">
                          <div className="font-medium text-gray-900">Modelo: {config.modelo}</div>
                          <div className="text-gray-600">Série: {config.serie}</div>
                          <div className="text-gray-500">Nº Atual: {config.numeroAtual}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getAmbienteBadge(config.ambiente)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm space-y-1">
                          <div className="font-medium text-gray-900">{config.certificado.nome}</div>
                          <div className="text-gray-500">Válido até: {config.certificado.validade}</div>
                          {getStatusBadge(config.certificado.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {config.ativo ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1 rounded-full border border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1 inline" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                            <Clock className="w-3 h-3 mr-1 inline" />
                            Inativo
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(config.dataAtualizacao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditar(config.id)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 border-blue-200"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicar(config.id)}
                            className="text-green-600 hover:text-green-900 hover:bg-green-50 border-green-200"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExcluir(config.id)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}


