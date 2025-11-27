'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Loader2,
  XCircle,
  Eye,
  ArrowLeft,
  Printer,
  Save,
  FileCheck,
  Clock,
  X,
  AlertTriangle,
  CheckCircle2,
  User,
  Landmark
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ParcelaTitulo {
  id: string;
  tipo: 'receber' | 'pagar';
  conta_id: string;
  titulo: string;
  titulo_parcela: string;
  nome: string;
  numero_pedido?: string;
  nota_fiscal?: string;
  data_vencimento: string;
  data_pagamento?: string;
  data_compensacao?: string;
  valor_parcela: number;
  diferenca: number;
  valor_total: number;
  status: 'pendente' | 'pago';
  tipo_pagamento?: string;
  conta_corrente?: string;
  forma_pagamento?: string;
  conta_corrente_id?: string;
  forma_pagamento_id?: string;
}

export default function TitulosEmAbertoPage() {
  const router = useRouter();
  const { token, activeCompanyId, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [titulos, setTitulos] = useState<ParcelaTitulo[]>([]);
  const [selectedTitulos, setSelectedTitulos] = useState<Set<string>>(new Set());
  const [filtroDataInicial, setFiltroDataInicial] = useState<string>('');
  const [filtroDataFinal, setFiltroDataFinal] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receber' | 'pagar'>('todos');
  
  // Estados para quitação de parcela
  const [quitarModalOpen, setQuitarModalOpen] = useState(false);
  const [parcelasParaQuitar, setParcelasParaQuitar] = useState<ParcelaTitulo[]>([]);
  const [contasBancarias, setContasBancarias] = useState<Array<{ id: string; descricao: string; banco_nome?: string }>>([]);
  const [contaCorrenteSelecionada, setContaCorrenteSelecionada] = useState<string>('');
  const [dataPagamento, setDataPagamento] = useState<string>(new Date().toISOString().split('T')[0]);
  const [quitarLoading, setQuitarLoading] = useState(false);
  
  // Estados para edição inline
  const [formasPagamento, setFormasPagamento] = useState<Array<{ id: string; nome: string }>>([]);
  const [edicoesParcelas, setEdicoesParcelas] = useState<Record<string, {
    data_pagamento?: string;
    data_compensacao?: string;
    conta_corrente_id?: string;
    forma_pagamento_id?: string;
  }>>({});

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Carregar contas bancárias
  const loadContasBancarias = useCallback(async () => {
    if (!token || !activeCompanyId || authLoading) return;
    
    try {
      const response = await fetch(`/api/contas?company_id=${activeCompanyId}&status=ativo`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const contas = data.data.map((conta: any) => ({
            id: conta.id,
            descricao: conta.descricao || conta.banco_nome || 'Conta',
            banco_nome: conta.banco_nome
          })).sort((a: any, b: any) => a.descricao.localeCompare(b.descricao));
          setContasBancarias(contas);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar contas bancárias:', error);
    }
  }, [token, activeCompanyId, authLoading]);

  // Carregar formas de pagamento
  const loadFormasPagamento = useCallback(async () => {
    if (!token || !activeCompanyId || authLoading) return;
    
    try {
      const response = await fetch(`/api/formas-pagamento?company_id=${activeCompanyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const formas = data.data
            .filter((f: any) => f.ativo !== false)
            .map((forma: any) => ({
              id: forma.id,
              nome: forma.nome
            }))
            .sort((a: any, b: any) => a.nome.localeCompare(b.nome));
          setFormasPagamento(formas);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
    }
  }, [token, activeCompanyId, authLoading]);

  // Carregar títulos em aberto
  const loadTitulos = useCallback(async () => {
    if (!token || !activeCompanyId || authLoading) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar TODAS as contas a receber (sem limite) para processar parcelas pendentes
      const responseCR = await fetch(`/api/contas-receber?company_id=${activeCompanyId}&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Buscar TODAS as contas a pagar (sem limite) para processar parcelas pendentes
      const responseCP = await fetch(`/api/contas-pagar?company_id=${activeCompanyId}&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!responseCR.ok || !responseCP.ok) {
        throw new Error('Erro ao carregar títulos');
      }

      const dataCR = await responseCR.json();
      const dataCP = await responseCP.json();

      if (!dataCR.success || !dataCP.success) {
        throw new Error(dataCR.error || dataCP.error || 'Erro ao carregar dados');
      }

      const contasReceber = Array.isArray(dataCR.data) ? dataCR.data : [];
      const contasPagar = Array.isArray(dataCP.data) ? dataCP.data : [];

      console.log('📋 Dados recebidos:', {
        contasReceber: contasReceber.length,
        contasPagar: contasPagar.length,
        primeiraContaReceber: contasReceber[0]?.parcelas?.length || 0,
        primeiraContaPagar: contasPagar[0]?.parcelas?.length || 0
      });

      // Processar parcelas de contas a receber
      const titulosReceber: ParcelaTitulo[] = [];
      contasReceber.forEach((conta: any) => {
        if (conta.parcelas && Array.isArray(conta.parcelas)) {
          conta.parcelas.forEach((parcela: any) => {
            // Verificar status (pode vir como 'pendente', 'Pendente', 'PENDENTE', etc.)
            const statusNormalizado = (parcela.status || '').toLowerCase();
            if (statusNormalizado === 'pendente' || !parcela.data_pagamento) {
              titulosReceber.push({
                id: parcela.id,
                tipo: 'receber',
                conta_id: conta.id,
                titulo: conta.titulo || String(conta.id).substring(0, 8),
                titulo_parcela: parcela.titulo_parcela || `${conta.titulo || conta.id}-${parcela.numero || '1'}`,
                nome: conta.cliente_nome || conta.cliente_fantasia || conta.cliente || '-',
                numero_pedido: conta.numero_pedido || conta.origem || '-',
                nota_fiscal: conta.nota_fiscal || '-',
                data_vencimento: parcela.data_vencimento,
                data_pagamento: parcela.data_pagamento || undefined,
                data_compensacao: parcela.data_compensacao || undefined,
                valor_parcela: parseFloat(parcela.valor_parcela || 0),
                diferenca: parseFloat(parcela.diferenca || 0),
                valor_total: parseFloat(parcela.valor_total || parcela.valor_parcela || 0),
                status: statusNormalizado === 'pago' ? 'pago' : 'pendente',
                tipo_pagamento: parcela.forma_pagamento_nome || parcela.forma_pagamento || '-',
                conta_corrente: parcela.conta_corrente_nome || parcela.banco_nome || parcela.conta_corrente || '-',
                forma_pagamento: parcela.forma_pagamento_nome || parcela.forma_pagamento || '-',
                conta_corrente_id: parcela.conta_corrente_id || undefined,
                forma_pagamento_id: parcela.forma_pagamento_id || undefined
              });
            }
          });
        }
      });

      // Processar parcelas de contas a pagar
      const titulosPagar: ParcelaTitulo[] = [];
      contasPagar.forEach((conta: any) => {
        if (conta.parcelas && Array.isArray(conta.parcelas)) {
          conta.parcelas.forEach((parcela: any) => {
            // Verificar status (pode vir como 'pendente', 'Pendente', 'PENDENTE', etc.)
            const statusNormalizado = (parcela.status || '').toLowerCase();
            if (statusNormalizado === 'pendente' || !parcela.data_pagamento) {
              titulosPagar.push({
                id: parcela.id,
                tipo: 'pagar',
                conta_id: conta.id,
                titulo: conta.titulo || String(conta.id).substring(0, 8),
                titulo_parcela: parcela.titulo_parcela || `${conta.titulo || conta.id}-${parcela.numero || '1'}`,
                nome: conta.fornecedor_nome || conta.fornecedor_fantasia || conta.fornecedor || '-',
                numero_pedido: conta.numero_pedido || conta.origem || '-',
                nota_fiscal: conta.nota_fiscal || '-',
                data_vencimento: parcela.data_vencimento,
                data_pagamento: parcela.data_pagamento || undefined,
                data_compensacao: parcela.data_compensacao || undefined,
                valor_parcela: parseFloat(parcela.valor_parcela || 0),
                diferenca: parseFloat(parcela.diferenca || 0),
                valor_total: parseFloat(parcela.valor_total || parcela.valor_parcela || 0),
                status: statusNormalizado === 'pago' ? 'pago' : 'pendente',
                tipo_pagamento: parcela.forma_pagamento_nome || parcela.forma_pagamento || '-',
                conta_corrente: parcela.conta_corrente_nome || parcela.banco_nome || parcela.conta_corrente || '-',
                forma_pagamento: parcela.forma_pagamento_nome || parcela.forma_pagamento || '-',
                conta_corrente_id: parcela.conta_corrente_id || undefined,
                forma_pagamento_id: parcela.forma_pagamento_id || undefined
              });
            }
          });
        }
      });

      console.log('📊 Parcelas processadas:', {
        contasReceber: contasReceber.length,
        contasPagar: contasPagar.length,
        titulosReceber: titulosReceber.length,
        titulosPagar: titulosPagar.length,
        total: titulosReceber.length + titulosPagar.length
      });

      // Unificar e ordenar por data de vencimento
      const todosTitulos = [...titulosReceber, ...titulosPagar].sort((a, b) => {
        const dataA = new Date(a.data_vencimento);
        const dataB = new Date(b.data_vencimento);
        return dataA.getTime() - dataB.getTime();
      });

      console.log('✅ Total de títulos carregados:', todosTitulos.length);
      setTitulos(todosTitulos);
      setLastUpdated(format(new Date(), 'HH:mm:ss'));
    } catch (error: any) {
      console.error('Erro ao carregar títulos:', error);
      setError(error.message || 'Erro ao carregar títulos em aberto');
    } finally {
      setLoading(false);
    }
  }, [token, activeCompanyId, authLoading]);

  useEffect(() => {
    loadTitulos();
    loadContasBancarias();
    loadFormasPagamento();
  }, [loadTitulos, loadContasBancarias, loadFormasPagamento]);

  // Fechar modal de quitação
  const handleFecharQuitarModal = () => {
    setQuitarModalOpen(false);
    setParcelasParaQuitar([]);
    setContaCorrenteSelecionada('');
    setDataPagamento(new Date().toISOString().split('T')[0]);
  };

  // Quitar parcelas (suporta múltiplas)
  const handleQuitarParcelas = async () => {
    if (parcelasParaQuitar.length === 0 || !token) {
      alert('Selecione pelo menos uma parcela para quitar.');
      return;
    }

    // Verificar se todas as parcelas têm conta selecionada
    const parcelasSemConta = parcelasParaQuitar.filter(p => {
      const edicao = edicoesParcelas[p.id];
      return !edicao?.conta_corrente_id;
    });

    if (parcelasSemConta.length > 0) {
      alert(`${parcelasSemConta.length} parcela(s) não têm conta bancária selecionada.`);
      return;
    }

    setQuitarLoading(true);
    try {
      const resultados: Array<{ sucesso: boolean; parcela: ParcelaTitulo; erro?: string }> = [];
      
      // Processar cada parcela
      for (const parcela of parcelasParaQuitar) {
        try {
          const endpoint = parcela.tipo === 'receber'
            ? `/api/contas-receber/parcelas/${parcela.id}/receber`
            : `/api/contas-pagar/parcelas/${parcela.id}/pagar`;

          const edicao = edicoesParcelas[parcela.id];
          if (!edicao?.conta_corrente_id || !edicao?.data_compensacao) {
            resultados.push({ sucesso: false, parcela, erro: 'Campos obrigatórios não preenchidos' });
            continue;
          }

          const body = {
            conta_corrente_id: edicao.conta_corrente_id,
            data_pagamento: edicao.data_compensacao,
            valor_recebido: parcela.tipo === 'receber' ? parcela.valor_total : undefined,
            valor_pago: parcela.tipo === 'pagar' ? parcela.valor_total : undefined,
            descricao: `Quitação da parcela ${parcela.titulo_parcela} - ${parcela.nome}`
          };

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            resultados.push({ sucesso: false, parcela, erro: data.error || 'Erro ao quitar parcela' });
          } else {
            resultados.push({ sucesso: true, parcela });
          }
        } catch (error: any) {
          resultados.push({ sucesso: false, parcela, erro: error?.message || 'Erro desconhecido' });
        }
      }

      const sucessos = resultados.filter(r => r.sucesso).length;
      const falhas = resultados.filter(r => !r.sucesso);

      if (falhas.length > 0) {
        console.error('Erros ao quitar parcelas:', falhas);
        alert(`${sucessos} parcela(s) quitada(s) com sucesso. ${falhas.length} falha(ram).`);
      } else {
        alert(`${sucessos} parcela(s) quitada(s) com sucesso!`);
      }

      handleFecharQuitarModal();
      
      // Limpar seleções e edições das parcelas quitadas
      const novasSelecoes = new Set(selectedTitulos);
      const novasEdicoes = { ...edicoesParcelas };
      parcelasParaQuitar.forEach(p => {
        novasSelecoes.delete(p.id);
        delete novasEdicoes[p.id];
      });
      setSelectedTitulos(novasSelecoes);
      setEdicoesParcelas(novasEdicoes);
      
      await loadTitulos();
    } catch (error: any) {
      console.error('Erro ao quitar parcelas:', error);
      alert(error?.message || 'Erro ao quitar parcelas. Tente novamente.');
    } finally {
      setQuitarLoading(false);
    }
  };

  // Filtrar títulos
  const titulosFiltrados = titulos.filter(titulo => {
    // Filtro por tipo
    if (filtroTipo !== 'todos' && titulo.tipo !== filtroTipo) return false;

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !titulo.nome.toLowerCase().includes(term) &&
        !titulo.titulo.toLowerCase().includes(term) &&
        !titulo.titulo_parcela.toLowerCase().includes(term) &&
        !(titulo.numero_pedido || '').toLowerCase().includes(term) &&
        !(titulo.nota_fiscal || '').toLowerCase().includes(term)
      ) {
        return false;
      }
    }

    // Filtro por data
    if (filtroDataInicial || filtroDataFinal) {
      const dataVencimento = new Date(titulo.data_vencimento);
      if (filtroDataInicial) {
        const dataInicio = new Date(filtroDataInicial);
        if (dataVencimento < dataInicio) return false;
      }
      if (filtroDataFinal) {
        const dataFim = new Date(filtroDataFinal);
        dataFim.setHours(23, 59, 59, 999);
        if (dataVencimento > dataFim) return false;
      }
    }

    return true;
  });

  // Ordenar parcelas por data de vencimento
  const parcelasOrdenadas = [...titulosFiltrados].sort((a, b) => {
    const dataA = new Date(a.data_vencimento).getTime();
    const dataB = new Date(b.data_vencimento).getTime();
    return dataA - dataB;
  });

  // Calcular totais separados por tipo
  const parcelasReceber = titulosFiltrados.filter(t => t.tipo === 'receber');
  const parcelasPagar = titulosFiltrados.filter(t => t.tipo === 'pagar');
  
  const totalReceber = parcelasReceber.reduce((sum, t) => sum + t.valor_parcela, 0);
  const totalAtrasoReceber = parcelasReceber
    .filter(t => new Date(t.data_vencimento) < new Date())
    .reduce((sum, t) => sum + t.valor_parcela, 0);
  const totalReceberSelecionado = parcelasReceber
    .filter(t => selectedTitulos.has(t.id))
    .reduce((sum, t) => sum + t.valor_parcela, 0);
  
  const totalPagar = parcelasPagar.reduce((sum, t) => sum + t.valor_parcela, 0);
  const totalAtrasoPagar = parcelasPagar
    .filter(t => new Date(t.data_vencimento) < new Date())
    .reduce((sum, t) => sum + t.valor_parcela, 0);
  const totalPagarSelecionado = parcelasPagar
    .filter(t => selectedTitulos.has(t.id))
    .reduce((sum, t) => sum + t.valor_parcela, 0);
  
  const totalGeral = totalReceber + totalPagar;
  const totalAtraso = totalAtrasoReceber + totalAtrasoPagar;
  const totalSelecionado = totalReceberSelecionado + totalPagarSelecionado;
  const totalAtrasoSelecionado = titulosFiltrados
    .filter(t => selectedTitulos.has(t.id) && new Date(t.data_vencimento) < new Date())
    .reduce((sum, t) => sum + t.valor_parcela, 0);

  const toggleSelectTitulo = (id: string) => {
    const newSelected = new Set(selectedTitulos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      // Remover edições quando desmarcar
      const novasEdicoes = { ...edicoesParcelas };
      delete novasEdicoes[id];
      setEdicoesParcelas(novasEdicoes);
    } else {
      newSelected.add(id);
      // Inicializar edições quando marcar
      const parcela = titulos.find(t => t.id === id);
      if (parcela) {
        setEdicoesParcelas(prev => ({
          ...prev,
          [id]: {
            data_pagamento: parcela.data_pagamento ? new Date(parcela.data_pagamento).toISOString().split('T')[0] : '',
            data_compensacao: parcela.data_compensacao ? new Date(parcela.data_compensacao).toISOString().split('T')[0] : '',
            conta_corrente_id: parcela.conta_corrente_id || '',
            forma_pagamento_id: parcela.forma_pagamento_id || ''
          }
        }));
      }
    }
    setSelectedTitulos(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedTitulos.size === titulosFiltrados.length) {
      setSelectedTitulos(new Set());
      setEdicoesParcelas({});
    } else {
      const novosSelecionados = new Set(titulosFiltrados.map(t => t.id));
      setSelectedTitulos(novosSelecionados);
      // Inicializar edições para todas as parcelas
      const novasEdicoes: Record<string, any> = {};
      titulosFiltrados.forEach(parcela => {
        novasEdicoes[parcela.id] = {
          data_pagamento: parcela.data_pagamento ? new Date(parcela.data_pagamento).toISOString().split('T')[0] : '',
          data_compensacao: parcela.data_compensacao ? new Date(parcela.data_compensacao).toISOString().split('T')[0] : '',
          conta_corrente_id: parcela.conta_corrente_id || '',
          forma_pagamento_id: parcela.forma_pagamento_id || ''
        };
      });
      setEdicoesParcelas(novasEdicoes);
    }
  };

  // Atualizar campo de edição
  const atualizarCampoEdicao = (parcelaId: string, campo: string, valor: string) => {
    setEdicoesParcelas(prev => {
      const novoEstado = {
        ...prev,
        [parcelaId]: {
          ...prev[parcelaId],
          [campo]: valor
        }
      };
      
      // Após atualizar, verificar se todos os campos estão preenchidos
      setTimeout(() => verificarCamposQuitacao(parcelaId), 100);
      
      return novoEstado;
    });
  };

  // Verificar se todos os campos necessários foram preenchidos e abrir modal
  const verificarCamposQuitacao = (parcelaId: string) => {
    const edicao = edicoesParcelas[parcelaId];
    if (!edicao) return;

    // Verificar se os 3 campos obrigatórios estão preenchidos
    if (edicao.data_compensacao && edicao.forma_pagamento_id && edicao.conta_corrente_id) {
      const parcela = titulos.find(t => t.id === parcelaId);
      if (parcela) {
        // Preencher o modal com os dados já informados
        setContaCorrenteSelecionada(edicao.conta_corrente_id);
        setDataPagamento(edicao.data_compensacao);
        setParcelasParaQuitar([parcela]);
        setQuitarModalOpen(true);
      }
    }
  };

  // Abrir modal para quitar múltiplas parcelas
  const handleQuitarMultiplasParcelas = () => {
    const parcelasSelecionadas = titulosFiltrados.filter(t => selectedTitulos.has(t.id));
    
    if (parcelasSelecionadas.length === 0) {
      alert('Selecione pelo menos uma parcela para quitar.');
      return;
    }

    // Verificar se todas têm os campos necessários preenchidos
    const parcelasCompletas = parcelasSelecionadas.filter(p => {
      const edicao = edicoesParcelas[p.id];
      return edicao?.data_compensacao && edicao?.forma_pagamento_id && edicao?.conta_corrente_id;
    });

    if (parcelasCompletas.length === 0) {
      alert('Preencha os campos de compensação, tipo de pagamento e conta para todas as parcelas selecionadas.');
      return;
    }

    if (parcelasCompletas.length !== parcelasSelecionadas.length) {
      alert(`${parcelasCompletas.length} de ${parcelasSelecionadas.length} parcelas têm todos os campos preenchidos. Deseja quitar apenas estas?`);
    }

    setParcelasParaQuitar(parcelasCompletas);
    if (parcelasCompletas.length > 0) {
      setContaCorrenteSelecionada(edicoesParcelas[parcelasCompletas[0].id].conta_corrente_id || '');
      setDataPagamento(edicoesParcelas[parcelasCompletas[0].id].data_compensacao || new Date().toISOString().split('T')[0]);
      setQuitarModalOpen(true);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <p className="text-purple-600 font-medium">Carregando títulos em aberto...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 space-y-3">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Voltar"
                >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
                </button>
                <div>
                <h1 className="text-xl font-bold text-gray-900">Títulos em Aberto</h1>
                <p className="text-sm text-gray-600">
                  {parcelasOrdenadas.length} parcela{parcelasOrdenadas.length !== 1 ? 's' : ''} encontrada{parcelasOrdenadas.length !== 1 ? 's' : ''}
                    {totalAtraso > 0 && (
                      <span className="ml-2 text-red-600 font-semibold">
                        • {formatCurrency(totalAtraso)} em atraso
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => loadTitulos()}
                disabled={loading}
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
                </Button>
              </div>
            </div>
        </motion.div>

        {/* Mensagem de erro */}
        <AnimatePresence>
        {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm"
            >
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards de Estatísticas - Separados por Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contas a Receber */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow-sm border-2 border-green-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-sm font-bold text-green-900 uppercase tracking-wide">Contas a Receber</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-green-700 mb-1">Total</p>
                <h3 className="text-xl font-bold text-green-600">{formatCurrency(totalReceber)}</h3>
              </div>
              <div>
                <p className="text-xs text-red-700 mb-1">Em Atraso</p>
                <h3 className="text-lg font-bold text-red-600">{formatCurrency(totalAtrasoReceber)}</h3>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-700">Selecionado:</span>
                <span className="text-sm font-semibold text-green-900">{formatCurrency(totalReceberSelecionado)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-green-700">Parcelas:</span>
                <span className="text-sm font-semibold text-green-900">{parcelasReceber.length}</span>
              </div>
            </div>
          </motion.div>

          {/* Contas a Pagar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 shadow-sm border-2 border-red-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide">Contas a Pagar</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-red-700 mb-1">Total</p>
                <h3 className="text-xl font-bold text-red-600">{formatCurrency(totalPagar)}</h3>
              </div>
              <div>
                <p className="text-xs text-red-700 mb-1">Em Atraso</p>
                <h3 className="text-lg font-bold text-red-700">{formatCurrency(totalAtrasoPagar)}</h3>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-red-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-700">Selecionado:</span>
                <span className="text-sm font-semibold text-red-900">{formatCurrency(totalPagarSelecionado)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-red-700">Parcelas:</span>
                <span className="text-sm font-semibold text-red-900">{parcelasPagar.length}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Busca/Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome, título, pedido, nota fiscal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  />
              </div>

              {/* Filtro por tipo */}
              <div className="flex gap-1 bg-gray-100 rounded-md p-1 border border-gray-200">
                <Button
                  variant={filtroTipo === 'todos' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFiltroTipo('todos')}
                  className={`h-9 px-4 text-xs font-medium transition-all ${
                    filtroTipo === 'todos' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Todos
                </Button>
                <Button
                  variant={filtroTipo === 'receber' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFiltroTipo('receber')}
                  className={`h-9 px-4 text-xs font-medium transition-all flex items-center gap-1 ${
                    filtroTipo === 'receber' 
                      ? 'bg-green-500 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TrendingUp className="w-3 h-3" />
                  A Receber
                </Button>
                <Button
                  variant={filtroTipo === 'pagar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFiltroTipo('pagar')}
                  className={`h-9 px-4 text-xs font-medium transition-all flex items-center gap-1 ${
                    filtroTipo === 'pagar' 
                      ? 'bg-red-500 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TrendingDown className="w-3 h-3" />
                  A Pagar
                </Button>
              </div>

              {/* Filtro por data */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-md px-3 py-2 border border-gray-200">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    placeholder="Data inicial"
                    value={filtroDataInicial}
                    onChange={(e) => setFiltroDataInicial(e.target.value)}
                    className="h-9 w-36 border-gray-300 focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <span className="text-gray-500 text-sm">até</span>
                  <Input
                    type="date"
                    placeholder="Data final"
                    value={filtroDataFinal}
                    onChange={(e) => setFiltroDataFinal(e.target.value)}
                    className="h-9 w-36 border-gray-300 focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
              </div>

              {/* Limpar filtros */}
              {(searchTerm || filtroDataInicial || filtroDataFinal || filtroTipo !== 'todos') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFiltroDataInicial('');
                    setFiltroDataFinal('');
                    setFiltroTipo('todos');
                  }}
                  className="h-9 border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabela de títulos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col"
          style={{ maxHeight: 'calc(100vh - 500px)', minHeight: '400px' }}
        >
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <FileCheck className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Títulos em Aberto</h3>
                  <p className="text-xs text-gray-600">{parcelasOrdenadas.length} parcela{parcelasOrdenadas.length !== 1 ? 's' : ''} encontrada{parcelasOrdenadas.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {lastUpdated && (
                <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                  <Calendar className="h-3 w-3 mr-1" />
                  {lastUpdated}
                </Badge>
              )}
            </div>
          </div>
          <div className="overflow-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left sticky left-0 bg-gray-50 z-10">
                    <Checkbox
                      checked={selectedTitulos.size === titulosFiltrados.length && titulosFiltrados.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">
                    Cliente/Fornecedor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Parcela
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Compensação
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tipo Pagamento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Conta
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parcelasOrdenadas.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhuma parcela encontrada</p>
                    </td>
                  </tr>
                ) : (
                  parcelasOrdenadas.map((parcela) => (
                    <tr 
                      key={parcela.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        new Date(parcela.data_vencimento) < new Date() ? 'bg-red-50 border-l-4 border-red-500' : ''
                      } ${selectedTitulos.has(parcela.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-4 py-3 sticky left-0 bg-white z-10">
                        <Checkbox
                          checked={selectedTitulos.has(parcela.id)}
                          onCheckedChange={() => toggleSelectTitulo(parcela.id)}
                        />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={parcela.tipo === 'receber' ? 'default' : 'secondary'} className={
                          parcela.tipo === 'receber' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-red-100 text-red-800 border-red-200'
                          }>
                          {parcela.tipo === 'receber' ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                          {parcela.tipo === 'receber' ? 'Receber' : 'Pagar'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">{parcela.nome}</div>
                            {(parcela.numero_pedido || parcela.nota_fiscal) && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {parcela.numero_pedido && `Pedido: ${parcela.numero_pedido}`}
                                {parcela.numero_pedido && parcela.nota_fiscal && ' • '}
                                {parcela.nota_fiscal && `NF: ${parcela.nota_fiscal}`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{parcela.titulo_parcela}</span>
                            <span className="text-xs text-gray-500">{parcela.titulo}</span>
                          </div>
                          </td>
                          <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                            new Date(parcela.data_vencimento) < new Date() ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            <div className="flex items-center gap-2">
                              {formatDate(parcela.data_vencimento)}
                              {new Date(parcela.data_vencimento) < new Date() && (
                                <Badge variant="destructive" className="text-xs border-red-300">
                                  Vencido
                                </Badge>
                              )}
                            </div>
                          </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {selectedTitulos.has(parcela.id) ? (
                            <Input
                              type="date"
                              value={edicoesParcelas[parcela.id]?.data_compensacao || ''}
                              onChange={(e) => atualizarCampoEdicao(parcela.id, 'data_compensacao', e.target.value)}
                              className="h-8 w-36 text-xs border-gray-300"
                              placeholder="Selecione"
                            />
                          ) : (
                            <span className="text-sm text-gray-500">{formatDate(parcela.data_compensacao) || '-'}</span>
                          )}
                          </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {selectedTitulos.has(parcela.id) ? (
                            <Select
                              value={edicoesParcelas[parcela.id]?.forma_pagamento_id || undefined}
                              onValueChange={(value) => {
                                atualizarCampoEdicao(parcela.id, 'forma_pagamento_id', value);
                              }}
                            >
                              <SelectTrigger className="h-8 w-44 text-xs">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {formasPagamento.map((forma) => (
                                  <SelectItem key={forma.id} value={forma.id}>
                                    {forma.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-sm text-gray-500">{parcela.forma_pagamento || '-'}</span>
                          )}
                          </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {selectedTitulos.has(parcela.id) ? (
                            <Select
                              value={edicoesParcelas[parcela.id]?.conta_corrente_id || undefined}
                              onValueChange={(value) => {
                                atualizarCampoEdicao(parcela.id, 'conta_corrente_id', value);
                              }}
                            >
                              <SelectTrigger className="h-8 w-44 text-xs">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {contasBancarias.map((conta) => (
                                  <SelectItem key={conta.id} value={conta.id}>
                                    {conta.descricao} {conta.banco_nome ? `- ${conta.banco_nome}` : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-sm text-gray-500">{parcela.conta_corrente || '-'}</span>
                          )}
                          </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(parcela.valor_total)}</span>
                            {parcela.diferenca !== 0 && (
                              <span className={`text-xs ${parcela.diferenca > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {parcela.diferenca > 0 ? '+' : ''}{formatCurrency(parcela.diferenca)}
                              </span>
                            )}
                          </div>
                          </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  if (parcela.tipo === 'receber') {
                                    window.location.href = `/financial/contas-receber/${parcela.conta_id}`;
                                  } else {
                                    window.location.href = `/financial/contas-pagar/${parcela.conta_id}`;
                                  }
                                }}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                          </td>
                        </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Footer com Totais e Ações */}
        {selectedTitulos.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 sticky bottom-0 z-20"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-xs text-gray-600">Parcelas Selecionadas:</span>
                  <span className="ml-2 text-sm font-bold text-purple-900">{selectedTitulos.size}</span>
          </div>
                <div>
                  <span className="text-xs text-gray-600">Total Selecionado:</span>
                  <span className="ml-2 text-lg font-bold text-purple-900">{formatCurrency(totalSelecionado)}</span>
                  </div>
                {totalAtrasoSelecionado > 0 && (
                  <div>
                    <span className="text-xs text-red-600">Em Atraso:</span>
                    <span className="ml-2 text-sm font-bold text-red-600">{formatCurrency(totalAtrasoSelecionado)}</span>
                  </div>
                )}
                </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTitulos(new Set());
                    setEdicoesParcelas({});
                  }}
                  className="h-9"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar Seleção
                </Button>
                <Button
                  size="sm"
                  onClick={handleQuitarMultiplasParcelas}
                  disabled={selectedTitulos.size === 0}
                  className="h-9 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Quitar {selectedTitulos.size > 1 ? `${selectedTitulos.size} Parcelas` : 'Parcela'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Modal de Quitação - Suporta Múltiplas Parcelas */}
        <Dialog open={quitarModalOpen} onOpenChange={setQuitarModalOpen}>
          <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header com gradiente */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
              <DialogTitle className="flex items-center gap-3 text-white text-xl">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                Confirmar Quitação {parcelasParaQuitar.length > 1 ? `(${parcelasParaQuitar.length} parcelas)` : ''}
              </DialogTitle>
            </div>

            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
              {/* Resumo Geral */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total a Quitar</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(parcelasParaQuitar.reduce((sum, p) => sum + p.valor_total, 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Parcelas</p>
                    <p className="text-xl font-bold text-gray-700">{parcelasParaQuitar.length}</p>
                  </div>
                </div>
              </div>

              {/* Lista de Parcelas */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {parcelasParaQuitar.map((parcela) => {
                  const edicao = edicoesParcelas[parcela.id];
                  return (
                    <div key={parcela.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant={parcela.tipo === 'receber' ? 'default' : 'secondary'}
                              className={`${
                                parcela.tipo === 'receber' 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-red-100 text-red-800 border-red-200'
                              }`}
                            >
                              {parcela.tipo === 'receber' ? 'Receber' : 'Pagar'}
                    </Badge>
                            <span className="text-xs text-gray-500">{parcela.titulo_parcela}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{parcela.nome}</p>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span>Vencimento: {formatDate(parcela.data_vencimento)}</span>
                            {new Date(parcela.data_vencimento) < new Date() && (
                              <Badge variant="destructive" className="text-xs">Vencido</Badge>
                            )}
                          </div>
                  </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{formatCurrency(parcela.valor_total)}</p>
                  </div>
                </div>
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
                        <div className="text-xs">
                          <span className="text-gray-600">Compensação:</span>
                          <p className="font-medium text-gray-900">{formatDate(edicao?.data_compensacao)}</p>
              </div>
                        <div className="text-xs">
                          <span className="text-gray-600">Pagamento:</span>
                          <p className="font-medium text-gray-900">{formasPagamento.find(f => f.id === edicao?.forma_pagamento_id)?.nome || '-'}</p>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-600">Conta:</span>
                          <p className="font-medium text-gray-900 truncate">
                            {contasBancarias.find(c => c.id === edicao?.conta_corrente_id)?.descricao || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

              {/* Aviso Importante */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-300 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-amber-400 rounded-full">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-amber-900 mb-1">
                      Atenção!
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Ao confirmar, serão criadas <strong>{parcelasParaQuitar.length} movimentação(ões) financeira(s)</strong> 
                      e {parcelasParaQuitar.length > 1 ? 'as parcelas serão marcadas' : 'a parcela será marcada'} como 
                      <strong> {parcelasParaQuitar[0]?.tipo === 'receber' ? 'recebida(s)' : 'paga(s)'}</strong>. 
                      Esta ação <strong>não pode ser desfeita</strong> automaticamente.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer com ações */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
              <Button 
                variant="outline" 
                onClick={handleFecharQuitarModal}
                disabled={quitarLoading}
                className="px-6"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleQuitarParcelas}
                disabled={parcelasParaQuitar.length === 0 || quitarLoading || parcelasParaQuitar.some(p => {
                  const edicao = edicoesParcelas[p.id];
                  return !edicao?.conta_corrente_id || !edicao?.data_compensacao || !edicao?.forma_pagamento_id;
                })}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 shadow-lg"
              >
                {quitarLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirmar Quitação {parcelasParaQuitar.length > 1 ? `(${parcelasParaQuitar.length})` : ''}
                  </>
                )}
                </Button>
              </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

