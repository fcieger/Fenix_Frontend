'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Plus, 
  Edit2, 
  Trash2, 
  Power,
  PowerOff,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Smartphone,
  Clock,
  MapPin,
  DollarSign,
  Tag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings,
  Sparkles,
  Zap,
  Calendar,
  TrendingUp,
  FileText
} from 'lucide-react';
import { licitacoesService, AlertaLicitacao } from '@/services/licitacoes-service';
import { AlertaForm } from '../components/AlertaForm';
import { toast } from 'sonner';

export default function AlertasPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, activeCompanyId } = useAuth();
  const [alertas, setAlertas] = useState<AlertaLicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlerta, setEditingAlerta] = useState<AlertaLicitacao | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAtivo, setFilterAtivo] = useState<'all' | 'ativo' | 'inativo'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && activeCompanyId) {
      carregarAlertas();
    }
  }, [isAuthenticated, activeCompanyId]);

  const carregarAlertas = async () => {
    try {
      setLoading(true);
      
      if (!activeCompanyId) {
        toast.error('CompanyId não encontrado. Faça login novamente.');
        return;
      }

      // TODO: Atualizar para usar activeCompanyId quando o backend suportar
      const data = await licitacoesService.listarAlertas(activeCompanyId);
      setAlertas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar alertas:', error);
      toast.error(error?.response?.data?.error || 'Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (alerta: AlertaLicitacao) => {
    try {
      if (!activeCompanyId) {
        toast.error('CompanyId não encontrado.');
        return;
      }

      if (editingAlerta) {
        await licitacoesService.atualizarAlerta(editingAlerta.id!, alerta);
        toast.success('Alerta atualizado com sucesso!');
      } else {
        await licitacoesService.criarAlerta(alerta, activeCompanyId);
        toast.success('Alerta criado com sucesso!');
      }
      await carregarAlertas();
      setShowForm(false);
      setEditingAlerta(null);
    } catch (error: any) {
      console.error('Erro ao salvar alerta:', error);
      toast.error(error?.response?.data?.error || 'Erro ao salvar alerta');
    }
  };

  const handleEditar = (alerta: AlertaLicitacao) => {
    setEditingAlerta(alerta);
    setShowForm(true);
  };

  const handleExcluir = async (id: string) => {
    try {
      await licitacoesService.deletarAlerta(id);
      toast.success('Alerta excluído com sucesso!');
      await carregarAlertas();
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error('Erro ao excluir alerta:', error);
      toast.error(error?.response?.data?.error || 'Erro ao excluir alerta');
    }
  };

  const handleToggleAtivo = async (alerta: AlertaLicitacao) => {
    try {
      await licitacoesService.atualizarAlerta(alerta.id!, {
        ...alerta,
        ativo: !alerta.ativo,
      });
      toast.success(`Alerta ${!alerta.ativo ? 'ativado' : 'desativado'} com sucesso!`);
      await carregarAlertas();
    } catch (error: any) {
      console.error('Erro ao atualizar alerta:', error);
      toast.error(error?.response?.data?.error || 'Erro ao atualizar alerta');
    }
  };

  const handleNovo = () => {
    setEditingAlerta(null);
    setShowForm(true);
  };

  const handleCancelar = () => {
    setShowForm(false);
    setEditingAlerta(null);
  };

  const alertasFiltrados = alertas.filter(alerta => {
    const matchSearch = !searchTerm || 
      alerta.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alerta.palavrasChave?.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchAtivo = filterAtivo === 'all' || 
      (filterAtivo === 'ativo' && alerta.ativo) ||
      (filterAtivo === 'inativo' && !alerta.ativo);
    
    return matchSearch && matchAtivo;
  });

  const stats = {
    total: alertas.length,
    ativos: alertas.filter(a => a.ativo).length,
    inativos: alertas.filter(a => !a.ativo).length,
    tempoReal: alertas.filter(a => a.frequencia === 'tempo_real' && a.ativo).length,
  };

  if (showForm) {
    return (
      <Layout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {editingAlerta ? 'Editar Alerta' : 'Novo Alerta'}
              </h1>
              <p className="text-gray-600 mt-1">
                Configure critérios para receber notificações de licitações
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleCancelar}
            >
              Cancelar
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AlertaForm
              alerta={editingAlerta}
              onSalvar={handleSalvar}
              onCancelar={handleCancelar}
            />
          </motion.div>
        </div>
      </Layout>
    );
  }

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
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Alertas de Licitações
                </h1>
                <p className="text-gray-600 mt-1">
                  Receba notificações quando novas licitações corresponderem aos seus critérios
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
              onClick={carregarAlertas}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={handleNovo}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Alerta
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
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Alertas</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Alertas Ativos</p>
                  <p className="text-3xl font-bold text-green-600">{stats.ativos}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.total > 0 ? Math.round((stats.ativos / stats.total) * 100) : 0}% do total
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Alertas Inativos</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.inativos}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <XCircle className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tempo Real</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.tempoReal}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Notificações instantâneas
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Zap className="w-6 h-6 text-purple-600" />
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
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Como funcionam os Alertas?
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Configure alertas personalizados com critérios específicos (estados, modalidades, valores, palavras-chave).
                    Quando novas licitações corresponderem aos seus critérios, você receberá notificações por email ou push.
                  </p>
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
                      <Label className="mb-2">Buscar</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Buscar por nome ou palavras-chave..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2">Status</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={filterAtivo === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilterAtivo('all')}
                        >
                          Todos
                        </Button>
                        <Button
                          variant={filterAtivo === 'ativo' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilterAtivo('ativo')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Ativos
                        </Button>
                        <Button
                          variant={filterAtivo === 'inativo' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilterAtivo('inativo')}
                        >
                          Inativos
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de Alertas */}
        {loading ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                  <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
                </div>
                <p className="text-gray-600 font-medium">Carregando alertas...</p>
              </div>
            </CardContent>
          </Card>
        ) : alertasFiltrados.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {alertas.length === 0 
                    ? 'Você ainda não tem alertas configurados'
                    : 'Nenhum alerta encontrado'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {alertas.length === 0
                    ? 'Crie seu primeiro alerta para receber notificações de licitações relevantes.'
                    : 'Tente ajustar os filtros para encontrar mais resultados.'}
                </p>
                {alertas.length === 0 ? (
                  <Button onClick={handleNovo}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Alerta
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterAtivo('all');
                    }}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {alertasFiltrados.map((alerta, index) => (
                <motion.div
                  key={alerta.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${
                    alerta.ativo 
                      ? 'border-l-green-500' 
                      : 'border-l-gray-300 opacity-75'
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="text-lg font-bold text-gray-900">
                                  {alerta.nome}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  alerta.ativo
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}>
                                  {alerta.ativo ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                      Ativo
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3 inline mr-1" />
                                      Inativo
                                    </>
                                  )}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                  {alerta.frequencia === 'tempo_real' && (
                                    <>
                                      <Zap className="w-3 h-3 inline mr-1" />
                                      Tempo Real
                                    </>
                                  )}
                                  {alerta.frequencia === 'diaria' && (
                                    <>
                                      <Calendar className="w-3 h-3 inline mr-1" />
                                      Diária
                                    </>
                                  )}
                                  {alerta.frequencia === 'semanal' && (
                                    <>
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      Semanal
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Critérios */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {alerta.estados && alerta.estados.length > 0 && (
                              <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                                <MapPin className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs text-gray-500 font-medium">Estados</p>
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {alerta.estados.join(', ')}
                                  </p>
                                </div>
                              </div>
                            )}
                            {alerta.modalidades && alerta.modalidades.length > 0 && (
                              <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                                <FileText className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs text-gray-500 font-medium">Modalidades</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {alerta.modalidades.length} selecionada{alerta.modalidades.length > 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                            )}
                            {(alerta.valorMinimo || alerta.valorMaximo) && (
                              <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                                <DollarSign className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs text-gray-500 font-medium">Valor</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {alerta.valorMinimo && `Min: R$ ${alerta.valorMinimo.toLocaleString('pt-BR')}`}
                                    {alerta.valorMinimo && alerta.valorMaximo && ' • '}
                                    {alerta.valorMaximo && `Max: R$ ${alerta.valorMaximo.toLocaleString('pt-BR')}`}
                                  </p>
                                </div>
                              </div>
                            )}
                            {alerta.palavrasChave && alerta.palavrasChave.length > 0 && (
                              <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                                <Tag className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs text-gray-500 font-medium">Palavras-chave</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {alerta.palavrasChave.slice(0, 3).map((palavra, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                                        {palavra}
                                      </span>
                                    ))}
                                    {alerta.palavrasChave.length > 3 && (
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                        +{alerta.palavrasChave.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Notificações */}
                          <div className="flex items-center gap-4 pt-4 border-t">
                            <span className="text-sm text-gray-600 font-medium">Notificar por:</span>
                            <div className="flex gap-2">
                              {alerta.notificarEmail && (
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  Email
                                </span>
                              )}
                              {alerta.notificarPush && (
                                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-200 flex items-center gap-1">
                                  <Smartphone className="w-3 h-3" />
                                  Push
                                </span>
                              )}
                              {!alerta.notificarEmail && !alerta.notificarPush && (
                                <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-200">
                                  Nenhuma notificação configurada
                                </span>
                              )}
                            </div>
                            {alerta.frequencia !== 'tempo_real' && alerta.horarioNotificacao && (
                              <span className="text-xs text-gray-500 ml-auto">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {alerta.horarioNotificacao}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAtivo(alerta)}
                            className={alerta.ativo ? 'text-green-600 hover:text-green-700' : 'text-gray-600'}
                          >
                            {alerta.ativo ? (
                              <>
                                <PowerOff className="w-4 h-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Power className="w-4 h-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditar(alerta)}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(alerta.id!)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirmar Exclusão
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Tem certeza que deseja excluir este alerta? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleExcluir(deleteConfirm)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
