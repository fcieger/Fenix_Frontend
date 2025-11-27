'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Loader2,
  History,
  Search,
  RefreshCw,
  Receipt,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  Printer,
  Trash2,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalCancelarVenda } from '@/components/point-of-sale/ModalCancelarVenda';
import { useToast, ToastContainer } from '@/components/ui/toast';

interface Venda {
  id: string;
  clienteNome?: string;
  valorTotal: number;
  meioPagamento?: string;
  dataVenda: string;
  status?: string;
  motivoCancelamento?: string;
  dataCancelamento?: string;
}

export default function HistoricoVendasPage() {
  const router = useRouter();
  const { token, activeCompanyId, user } = useAuth();
  const { success, error: showError, toasts } = useToast();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mostrarCanceladas, setMostrarCanceladas] = useState(true);
  const [vendaParaCancelar, setVendaParaCancelar] = useState<Venda | null>(null);
  const [showModalCancelar, setShowModalCancelar] = useState(false);
  const [caixaId, setCaixaId] = useState<string | null>(null);

  useEffect(() => {
    if (token && activeCompanyId && user?.id) {
      buscarCaixaECarregarHistorico();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeCompanyId, user?.id]);

  const buscarCaixaECarregarHistorico = async () => {
    if (!token || !activeCompanyId || !user?.id) return;

    try {
      setLoading(true);
      console.log('🔍 Buscando caixa aberto...');

      // Primeiro, buscar o caixa aberto
      const caixaResponse = await fetch(
        `/api/caixa/status?company_id=${activeCompanyId}&usuario_id=${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (caixaResponse.ok) {
        const caixaData = await caixaResponse.json();
        console.log('📦 Dados do caixa:', caixaData);

        if (caixaData.success && caixaData.data && caixaData.data.caixaAberto && caixaData.data.caixa) {
          const caixaId = caixaData.data.caixa.id;
          setCaixaId(caixaId);
          console.log('✅ Caixa encontrado:', caixaId);
          
          // Agora buscar as vendas deste caixa
          await carregarHistorico(caixaId);
        } else {
          console.warn('⚠️ Nenhum caixa aberto encontrado');
          showError('Aviso', 'Nenhum caixa aberto encontrado. Abra um caixa para ver o histórico.');
          setVendas([]);
          setLoading(false);
        }
      } else {
        const errorData = await caixaResponse.json().catch(() => ({}));
        console.error('❌ Erro ao buscar caixa:', caixaResponse.status, errorData);
        showError('Erro', 'Erro ao buscar caixa aberto');
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      showError('Erro', 'Erro ao carregar dados');
      setLoading(false);
    }
  };

  const carregarHistorico = async (caixaIdParam?: string) => {
    const idCaixa = caixaIdParam || caixaId;
    if (!token || !activeCompanyId || !idCaixa) {
      console.warn('⚠️ Parâmetros ausentes:', { token: !!token, activeCompanyId, idCaixa });
      return;
    }

    try {
      console.log('📡 Carregando vendas do caixa:', idCaixa);
      
      const response = await fetch(
        `/api/caixa/sales?company_id=${activeCompanyId}&caixa_id=${idCaixa}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📊 Status da resposta:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Vendas recebidas:', data);
        
        if (data.success && Array.isArray(data.data)) {
          setVendas(data.data);
          console.log(`✅ ${data.data.length} vendas carregadas`);
        } else {
          console.warn('⚠️ Formato de dados inesperado:', data);
          setVendas([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro ao carregar vendas:', response.status, errorData);
        showError('Erro', errorData.error || 'Erro ao carregar histórico de vendas');
        setVendas([]);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar histórico:', err);
      showError('Erro', 'Erro ao carregar histórico');
      setVendas([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const vendasFiltradas = vendas.filter(venda => {
    // Filtrar canceladas
    if (!mostrarCanceladas && venda.status === 'cancelada') {
      return false;
    }

    // Filtrar por termo de busca
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      venda.id.toLowerCase().includes(term) ||
      (venda.clienteNome?.toLowerCase().includes(term) ?? false) ||
      venda.meioPagamento?.toLowerCase().includes(term)
    );
  });

  const totalVendas = vendasFiltradas
    .filter(v => v.status !== 'cancelada')
    .reduce((sum, v) => sum + v.valorTotal, 0);
  
  const vendasCanceladas = vendas.filter(v => v.status === 'cancelada').length;
  const totalCancelado = vendas
    .filter(v => v.status === 'cancelada')
    .reduce((sum, v) => sum + v.valorTotal, 0);

  const handleCancelarVenda = (venda: Venda) => {
    setVendaParaCancelar(venda);
    setShowModalCancelar(true);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/point-of-sale')}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Frente de Caixa
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <History className="h-8 w-8 text-indigo-600" />
                  Histórico de Vendas
                </h1>
                <p className="text-gray-600">
                  Visualize todas as vendas realizadas no caixa atual
                </p>
              </div>
              <Button
                onClick={buscarCaixaECarregarHistorico}
                disabled={loading}
                variant="outline"
                className="h-10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {/* Estatísticas */}
            {vendas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
              >
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total de Vendas</p>
                        <p className="text-2xl font-bold text-blue-600">{vendasFiltradas.filter(v => v.status !== 'cancelada').length}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalVendas)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Canceladas</p>
                        <p className="text-2xl font-bold text-red-600">{vendasCanceladas}</p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Ticket Médio</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {vendasFiltradas.length > 0
                            ? formatCurrency(totalVendas / vendasFiltradas.length)
                            : formatCurrency(0)}
                        </p>
                      </div>
                      <CreditCard className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Busca e Filtros */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar por ID da venda, cliente ou forma de pagamento..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                  
                  {/* Toggle Mostrar Canceladas */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mostrarCanceladas}
                        onChange={(e) => setMostrarCanceladas(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Mostrar vendas canceladas
                      </span>
                    </label>
                    {vendasCanceladas > 0 && (
                      <span className="text-sm text-red-600 font-semibold">
                        {vendasCanceladas} cancelada{vendasCanceladas !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Vendas */}
            {loading ? (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Carregando histórico...</p>
                  </div>
                </CardContent>
              </Card>
            ) : vendasFiltradas.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <History className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 font-medium mb-2">
                      {searchTerm ? 'Nenhuma venda encontrada' : 'Nenhuma venda registrada'}
                    </p>
                    {searchTerm && (
                      <p className="text-sm text-gray-500">
                        Tente ajustar os termos de busca
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {vendasFiltradas.map((venda, index) => (
                    <motion.div
                      key={venda.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`hover:shadow-md transition-shadow cursor-pointer border-l-4 ${
                        venda.status === 'cancelada' ? 'border-l-red-500 bg-red-50/30' : 'border-l-indigo-500'
                      }`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <Receipt className={`h-5 w-5 ${venda.status === 'cancelada' ? 'text-red-600' : 'text-indigo-600'}`} />
                                <h3 className="font-bold text-lg">
                                  Venda #{venda.id.substring(0, 8).toUpperCase()}
                                </h3>
                                {venda.status === 'cancelada' && (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-300">
                                    <XCircle className="h-3 w-3" />
                                    CANCELADA
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>{venda.clienteNome || 'Cliente Avulso'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(venda.dataVenda)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  <span className="capitalize">{venda.meioPagamento || 'Não informado'}</span>
                                </div>
                              </div>
                              {venda.status === 'cancelada' && venda.motivoCancelamento && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-xs text-red-700 font-semibold mb-1">Motivo do Cancelamento:</p>
                                  <p className="text-sm text-red-900">{venda.motivoCancelamento}</p>
                                  {venda.dataCancelamento && (
                                    <p className="text-xs text-red-600 mt-1">
                                      Cancelada em: {formatDate(venda.dataCancelamento)}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-4 flex flex-col gap-2">
                              <p className={`text-2xl font-bold mb-1 ${
                                venda.status === 'cancelada' ? 'text-red-600 line-through' : 'text-green-600'
                              }`}>
                                {formatCurrency(venda.valorTotal)}
                              </p>
                              <div className="flex flex-col gap-2">
                                {venda.status !== 'cancelada' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      // TODO: Implementar impressão
                                      console.log('Imprimir venda:', venda.id);
                                    }}
                                  >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Imprimir
                                  </Button>
                                )}
                                {venda.status !== 'cancelada' && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleCancelarVenda(venda)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Cancelar
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal Cancelar Venda */}
      {vendaParaCancelar && activeCompanyId && token && user?.id && (
        <ModalCancelarVenda
          open={showModalCancelar}
          onOpenChange={setShowModalCancelar}
          venda={vendaParaCancelar}
          companyId={activeCompanyId}
          token={token}
          usuarioId={user.id}
          onSuccess={() => {
            if (caixaId) {
              carregarHistorico(caixaId);
            }
          }}
        />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
    </Layout>
  );
}




