'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  TrendingUp, 
  RefreshCw, 
  Filter,
  CheckCircle,
  Clock,
  Target,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  X,
  Eye,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { licitacoesService, Licitacao } from '@/services/tenders-service';
import { LicitacaoCard } from './components/LicitacaoCard';
import { FiltrosLicitacao } from './components/FiltrosLicitacao';
import { toast } from 'sonner';

export default function LicitacoesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, activeCompanyId } = useAuth();
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<any>({});
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    abertas: 0,
    encerrandoEmBreve: 0,
    matches: 0,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && activeCompanyId) {
      carregarLicitacoes();
      carregarEstatisticas();
    }
  }, [filtros, pagina, isAuthenticated, activeCompanyId]);

  const carregarLicitacoes = async () => {
    try {
      setLoading(true);
      console.log('📥 Carregando licitações...', { filtros, busca, pagina });
      
      const response = await licitacoesService.listar({
        ...filtros,
        busca: busca || undefined,
        pagina,
        limite: 20,
      });
      
      console.log('📊 Licitações recebidas:', {
        total: response.total,
        quantidade: response.data?.length || 0,
        primeira: response.data?.[0]?.titulo?.substring(0, 50),
      });
      
      setLicitacoes(response.data || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('❌ Erro ao carregar licitações:', error);
      console.error('❌ Detalhes:', error?.response?.data);
      toast.error(error?.response?.data?.error || 'Erro ao carregar licitações');
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const response = await licitacoesService.estatisticas();
      setStats(response);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleBuscar = () => {
    setPagina(1);
    carregarLicitacoes();
  };

  const handleSincronizar = async () => {
    console.log('🎯 INICIANDO SINCRONIZAÇÃO');
    console.log('📋 Token:', localStorage.getItem('fenix_token') ? '✅ Presente' : '❌ Ausente');
    console.log('🏢 CompanyId:', localStorage.getItem('activeCompanyId') || '❌ Não encontrado');
    console.log('📍 Estado selecionado:', filtros.estado || 'Todos');
    
    try {
      setSincronizando(true);
      
      const mensagem = filtros.estado 
        ? `🔄 Buscando licitações de ${filtros.estado}...`
        : '🔄 Buscando licitações de todos os estados...';
      toast.info(mensagem, { duration: 2000 });
      
      console.log('📡 Chamando serviço de sincronização com filtros:', filtros);
      const resultado = await licitacoesService.sincronizar('todas', filtros.estado);
      console.log('📊 Resultado da sincronização:', resultado);
      
      console.log('🔄 Recarregando lista e estatísticas...');
      await carregarLicitacoes();
      await carregarEstatisticas();
      console.log('✅ Lista e estatísticas recarregadas');
      
      if (resultado.novos > 0 || resultado.atualizados > 0) {
        const mensagemEstado = filtros.estado 
          ? ` no estado de ${filtros.estado}`
          : ' em todos os estados';
        
        toast.success(
          `✅ Sincronização concluída${mensagemEstado}!\n${resultado.novos} novas, ${resultado.atualizados} atualizadas`,
          { duration: 5000 }
        );
      } else {
        const mensagemEstado = filtros.estado 
          ? ` no estado de ${filtros.estado}`
          : '';
        
        if (filtros.estado) {
          toast.warning(
            `⚠️ Nenhuma licitação FEDERAL encontrada${mensagemEstado}\n\n💡 A API do governo tem dados limitados por estado.\n📌 Usando dados de exemplo do ${filtros.estado}...`,
            { duration: 6000 }
          );
        } else {
          toast.info(
            `ℹ️ Nenhuma licitação nova encontrada${mensagemEstado}\n\n💡 Dica: Tente outro estado ou remova os filtros`,
            { duration: 5000 }
          );
        }
      }
    } catch (error: any) {
      console.error('❌ ERRO COMPLETO:', error);
      console.error('❌ Mensagem:', error?.message);
      console.error('❌ Response:', error?.response?.data);
      toast.error(error?.response?.data?.error || error?.message || 'Erro ao sincronizar licitações');
    } finally {
      setSincronizando(false);
      console.log('🏁 Sincronização finalizada');
    }
  };

  const limparFiltros = () => {
    setFiltros({});
    setBusca('');
    setPagina(1);
  };

  const handleFiltrosChange = (novosFiltros: any) => {
    setFiltros(novosFiltros);
    setPagina(1); // Reset para página 1 quando filtros mudarem
  };

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-600" />
              Licitações Públicas
            </h1>
            <p className="text-gray-600 mt-2">
              Encontre oportunidades de vendas com o governo
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
            <Button
              onClick={handleSincronizar}
              disabled={sincronizando}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${sincronizando ? 'animate-spin' : ''}`} />
              {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total de Licitações
                </CardTitle>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Abertas
                </CardTitle>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.abertas}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Encerrando em 7 dias
                </CardTitle>
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{stats.encerrandoEmBreve}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Matches Automáticos
                </CardTitle>
                <Target className="w-5 h-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{stats.matches}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filtros Mobile/Desktop */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Filtros</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFilters(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <FiltrosLicitacao
                    filtros={filtros}
                    onChange={handleFiltrosChange}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filtros Laterais - Desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block w-64 flex-shrink-0"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <FiltrosLicitacao
                  filtros={filtros}
                  onChange={setFiltros}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de Licitações */}
          <div className="flex-1 space-y-4">
            {/* Barra de Busca */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Buscar licitações..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                        className="pl-10"
                      />
                    </div>
                    <Button onClick={handleBuscar} className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Buscar
                    </Button>
                    {(Object.keys(filtros).length > 0 || busca) && (
                      <Button
                        variant="outline"
                        onClick={limparFiltros}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Limpar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Resultados */}
            {loading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Carregando licitações...</p>
                  </div>
                </CardContent>
              </Card>
            ) : licitacoes.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Nenhuma licitação encontrada com os filtros selecionados.
                    </p>
                    <Button onClick={limparFiltros} variant="outline">
                      Limpar Filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pagina}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {licitacoes.map((licitacao, index) => (
                      <motion.div
                        key={licitacao.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <LicitacaoCard licitacao={licitacao} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Paginação */}
                {totalPages > 1 && (
                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Mostrando {((pagina - 1) * 20) + 1} a {Math.min(pagina * 20, total)} de {total} licitações
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagina(p => Math.max(1, p - 1))}
                            disabled={pagina === 1}
                            className="flex items-center gap-2"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Anterior
                          </Button>
                          <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-md font-medium">
                            Página {pagina} de {totalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagina(p => p + 1)}
                            disabled={pagina >= totalPages}
                            className="flex items-center gap-2"
                          >
                            Próxima
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
  );
}

