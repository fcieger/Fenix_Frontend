'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Target, 
  TrendingUp, 
  AlertCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw,
  Filter,
  Search,
  Star,
  Zap,
  Award,
  BarChart3,
  ArrowRight,
  Eye,
  ExternalLink
} from 'lucide-react';
import { licitacoesService, Licitacao } from '@/services/tenders-service';
import { LicitacaoCard } from '../components/LicitacaoCard';
import { toast } from 'sonner';

interface Match {
  licitacao: Licitacao;
  score: number;
  motivos: string[];
  produtosRelacionados: string[];
  recomendacao: 'alta' | 'media' | 'baixa';
}

export default function MatchesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, activeCompanyId } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRecomendacao, setFilterRecomendacao] = useState<'all' | 'alta' | 'media' | 'baixa'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && activeCompanyId) {
      carregarMatches();
    }
  }, [isAuthenticated, activeCompanyId]);

  const carregarMatches = async () => {
    try {
      setLoading(true);
      
      if (!activeCompanyId) {
        toast.error('CompanyId não encontrado. Faça login novamente.');
        return;
      }

      const data = await licitacoesService.buscarMatches(activeCompanyId);
      
      // Mock de scores (em produção virá do backend)
      const matchesComScore: Match[] = data.map((lic: Licitacao, index: number) => ({
        licitacao: lic,
        score: 90 - index * 5, // Mock
        motivos: [
          'CNAE compatível',
          'Produtos relacionados',
          'Mesmo estado',
          'Histórico de participação',
          'Valor compatível',
        ].slice(0, Math.floor(Math.random() * 3) + 2),
        produtosRelacionados: [],
        recomendacao: index < 3 ? 'alta' : index < 7 ? 'media' : 'baixa',
      }));
      
      setMatches(matchesComScore);
    } catch (error: any) {
      console.error('Erro ao carregar matches:', error);
      toast.error(error?.response?.data?.error || 'Erro ao carregar matches');
    } finally {
      setLoading(false);
    }
  };

  const getRecomendacaoColor = (recomendacao: string) => {
    switch (recomendacao) {
      case 'alta':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'media':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'baixa':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  const matchesFiltrados = matches.filter(match => {
    const matchSearch = searchTerm.toLowerCase();
    const matchTitulo = match.licitacao.titulo?.toLowerCase().includes(matchSearch);
    const matchOrgao = match.licitacao.orgao?.toLowerCase().includes(matchSearch);
    const matchProcesso = match.licitacao.numeroProcesso?.toLowerCase().includes(matchSearch);
    
    const matchBusca = !searchTerm || matchTitulo || matchOrgao || matchProcesso;
    const matchRecomendacao = filterRecomendacao === 'all' || match.recomendacao === filterRecomendacao;
    
    return matchBusca && matchRecomendacao;
  });

  const stats = {
    total: matches.length,
    alta: matches.filter(m => m.recomendacao === 'alta').length,
    media: matches.filter(m => m.recomendacao === 'media').length,
    baixa: matches.filter(m => m.recomendacao === 'baixa').length,
    mediaScore: matches.length > 0 
      ? Math.round(matches.reduce((acc, m) => acc + m.score, 0) / matches.length)
      : 0,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Matches Automáticos
                </h1>
                <p className="text-gray-600 mt-1">
                  Licitações selecionadas especialmente para sua empresa com base em IA
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button
              variant="outline"
              onClick={carregarMatches}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Alta Compatibilidade</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.alta}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.total > 0 ? Math.round((stats.alta / stats.total) * 100) : 0}% do total
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Média Compatibilidade</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.media}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.total > 0 ? Math.round((stats.media / stats.total) * 100) : 0}% do total
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Score Médio</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.mediaScore}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Compatibilidade geral
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Analisadas</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Licitações avaliadas
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    Como funciona o Match Automático?
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Nossa IA analisa automaticamente todas as licitações abertas e compara com:{' '}
                    <strong className="text-gray-900">CNAE da sua empresa</strong>,{' '}
                    <strong className="text-gray-900">produtos cadastrados</strong>,{' '}
                    <strong className="text-gray-900">localização</strong> e{' '}
                    <strong className="text-gray-900">histórico de vendas</strong> para
                    encontrar as melhores oportunidades para você.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-white/70 rounded text-xs font-medium text-gray-700">
                      🎯 Score de compatibilidade
                    </span>
                    <span className="px-2 py-1 bg-white/70 rounded text-xs font-medium text-gray-700">
                      📊 Análise inteligente
                    </span>
                    <span className="px-2 py-1 bg-white/70 rounded text-xs font-medium text-gray-700">
                      ⚡ Atualização automática
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Buscar
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Buscar por título, órgão ou processo..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Recomendação
                      </label>
                      <div className="flex gap-2">
                        <Button
                          variant={filterRecomendacao === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilterRecomendacao('all')}
                        >
                          Todas
                        </Button>
                        <Button
                          variant={filterRecomendacao === 'alta' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilterRecomendacao('alta')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Alta
                        </Button>
                        <Button
                          variant={filterRecomendacao === 'media' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilterRecomendacao('media')}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          Média
                        </Button>
                        <Button
                          variant={filterRecomendacao === 'baixa' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilterRecomendacao('baixa')}
                        >
                          Baixa
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de Matches */}
        {loading ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                  <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
                <p className="text-gray-600 font-medium">Analisando licitações...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Nossa IA está encontrando as melhores oportunidades para você
                </p>
              </div>
            </CardContent>
          </Card>
        ) : matchesFiltrados.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum match encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterRecomendacao !== 'all'
                    ? 'Tente ajustar os filtros para encontrar mais resultados.'
                    : 'Continue cadastrando produtos e informações da sua empresa para melhorar os resultados!'}
                </p>
                {searchTerm || filterRecomendacao !== 'all' ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterRecomendacao('all');
                    }}
                  >
                    Limpar Filtros
                  </Button>
                ) : (
                  <Button onClick={() => router.push('/tenders')}>
                    Ver Todas as Licitações
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {matchesFiltrados.map((match, index) => (
                <motion.div
                  key={match.licitacao.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  {/* Score Badge */}
                  <div className="absolute -left-6 top-6 z-10 hidden md:block">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.2, type: 'spring' }}
                      className="relative"
                    >
                      <div className={`bg-gradient-to-br ${getScoreGradient(match.score)} rounded-full p-4 shadow-lg border-4 border-white`}>
                        <div className="text-center">
                          <div className={`text-2xl font-bold text-white`}>
                            {match.score}
                          </div>
                          <div className="text-xs text-white/90 font-medium">Score</div>
                        </div>
                      </div>
                      {match.recomendacao === 'alta' && (
                        <div className="absolute -top-1 -right-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Card de Licitação */}
                  <div className="md:ml-16">
                    <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 relative overflow-hidden">
                      {/* Badge de Recomendação no Mobile */}
                      <div className="md:hidden absolute top-4 right-4 z-10">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${
                          match.recomendacao === 'alta' ? 'bg-green-500' :
                          match.recomendacao === 'media' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}>
                          {match.score}%
                        </div>
                      </div>

                      <CardContent className="pt-6">
                        {/* Informações do Match */}
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getRecomendacaoColor(match.recomendacao)}`}>
                            {match.recomendacao === 'alta' && (
                              <>
                                <Zap className="w-3 h-3 mr-1" />
                                Alta Recomendação
                              </>
                            )}
                            {match.recomendacao === 'media' && (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Recomendação Média
                              </>
                            )}
                            {match.recomendacao === 'baixa' && (
                              <>
                                <Info className="w-3 h-3 mr-1" />
                                Baixa Recomendação
                              </>
                            )}
                          </span>

                          {/* Motivos */}
                          <div className="flex flex-wrap gap-2 flex-1">
                            {match.motivos.map((motivo, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-200 font-medium"
                              >
                                {motivo}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Card da Licitação */}
                        <div className="border-t pt-4">
                          <LicitacaoCard licitacao={match.licitacao} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
}
