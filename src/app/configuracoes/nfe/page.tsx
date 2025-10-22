'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, Search, Settings, FileText, Shield, Edit, Trash2, 
  Copy, Eye, MoreHorizontal, Calendar, Building2, CheckCircle, 
  AlertCircle, Clock, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
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
  const [configuracoes, setConfiguracoes] = useState<NFeConfig[]>([]);
  const [loading, setLoading] = useState(true);
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
        const data = await apiService.getConfiguracoesNfe(token, false);
        const configuracoesConvertidas = convertApiDataToNFeConfig(data);
        setConfiguracoes(configuracoesConvertidas);
      } catch (error) {
        console.error('Erro ao carregar configurações NFe:', error);
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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Válido</Badge>;
      case 'vencido':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vencido</Badge>;
      case 'invalido':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inválido</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getAmbienteBadge = (ambiente: string) => {
    return ambiente === 'producao' 
      ? <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Produção</Badge>
      : <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Homologação</Badge>;
  };

  const handleNovaConfiguracao = () => {
    router.push('/configuracoes/nfe/nova');
  };

  const handleEditar = (id: string) => {
    router.push(`/configuracoes/nfe/nova?id=${id}`);
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
    } catch (error) {
      console.error('Erro ao duplicar configuração:', error);
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
    } catch (error) {
      console.error('Erro ao excluir configuração:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="space-y-8 p-6">
          {/* Header Moderno */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 rounded-2xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Configurações de NFe
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">Gerencie as configurações de emissão de notas fiscais</p>
                  </div>
                </div>
                <Button 
                  onClick={handleNovaConfiguracao} 
                  className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nova Configuração
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards Modernos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total</p>
                      <p className="text-3xl font-bold text-blue-900">{configuracoes.length}</p>
                    </div>
                    <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filtros Modernos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Filtros e Busca</CardTitle>
                <CardDescription>Encontre rapidamente as configurações que você precisa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Buscar configurações..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                    />
                  </div>
                  
                  <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  >
                    <option value="ALL">Todos os Tipos</option>
                    <option value="nfe-produto">NF-e Produto</option>
                    <option value="nfse-servico">NFS-e Serviço</option>
                    <option value="nf-entrada">NF Entrada</option>
                    <option value="nfce-consumidor">NFC-e Consumidor</option>
                    <option value="mdfe">MDF-e</option>
                  </select>

                  <select
                    value={filterAmbiente}
                    onChange={(e) => setFilterAmbiente(e.target.value)}
                    className="h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
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
                    className="h-12 border-gray-200 hover:bg-gray-50 rounded-xl font-medium"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabela de Configurações Moderna */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-800">Configurações de NFe</CardTitle>
                    <CardDescription className="text-gray-600">
                      {filteredConfiguracoes.length} configuração(ões) encontrada(s)
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="px-3 py-1">
                      <FileText className="w-4 h-4 mr-1" />
                      {configuracoes.length} Total
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Carregando configurações...</p>
                    </div>
                  </div>
                ) : filteredConfiguracoes.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma configuração encontrada</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      {searchQuery || filterTipo !== 'ALL' || filterAmbiente !== 'ALL'
                        ? 'Tente ajustar os filtros de busca para encontrar o que você procura.'
                        : 'Comece criando sua primeira configuração de NFe para começar a emitir notas fiscais.'}
                    </p>
                    <Button 
                      onClick={handleNovaConfiguracao} 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl font-semibold px-8 py-3"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Nova Configuração
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200">
                          <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                          <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                          <TableHead className="font-semibold text-gray-700">Modelo/Série</TableHead>
                          <TableHead className="font-semibold text-gray-700">Ambiente</TableHead>
                          <TableHead className="font-semibold text-gray-700">Certificado</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                          <TableHead className="font-semibold text-gray-700">Última Atualização</TableHead>
                          <TableHead className="text-right font-semibold text-gray-700">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredConfiguracoes.map((config, index) => (
                          <motion.tr
                            key={config.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-gray-100 hover:bg-gray-50/50 transition-colors duration-200"
                          >
                            <TableCell className="py-4">
                              <div>
                                <div className="font-semibold text-gray-900">{config.nome}</div>
                                <div className="text-sm text-gray-500">{config.descricao}</div>
                                <div className="text-xs text-gray-400">{config.empresa}</div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge variant="outline" className="px-3 py-1 rounded-full">
                                {config.tipoModelo}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Modelo: {config.modelo}</div>
                                <div>Série: {config.serie}</div>
                                <div>Nº Atual: {config.numeroAtual}</div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              {getAmbienteBadge(config.ambiente)}
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-sm">
                                <div className="font-medium">{config.certificado.nome}</div>
                                <div className="text-gray-500">Válido até: {config.certificado.validade}</div>
                                {getStatusBadge(config.certificado.status)}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center">
                                {config.ativo ? (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1 rounded-full">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Ativo
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 px-3 py-1 rounded-full">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Inativo
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-sm text-gray-500">
                                {new Date(config.dataAtualizacao).toLocaleDateString('pt-BR')}
                              </div>
                            </TableCell>
                            <TableCell className="text-right py-4">
                              <div className="flex items-center justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditar(config.id)}
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDuplicar(config.id)}
                                  className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 rounded-lg"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleExcluir(config.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}


