'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/auth-context';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Loader2,
  LogOut,
  DollarSign,
  Calculator,
  AlertCircle,
  CheckCircle,
  Printer,
  CreditCard,
  Receipt,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Movimentacao {
  id: string;
  tipo: 'sangria' | 'suprimento';
  valor: number;
  descricao: string;
  dataMovimentacao: string;
  usuarioNome: string;
}

interface Venda {
  id: string;
  numero?: string;
  clienteNome: string;
  valorTotal: number;
  meioPagamento: string;
  dataVenda: string;
  status: string;
}

interface ResumoCaixa {
  resumo: {
    saldoAtual: number;
    entradas: number;
    saidas: number;
    totalVendas: number;
    valorTotalVendas: number;
    totalVendasCanceladas: number;
    valorTotalCanceladas: number;
    totalSangrias: number;
    totalSuprimentos: number;
    quantidadeSangrias: number;
    quantidadeSuprimentos: number;
    totalPorFormaPagamento: Array<{
      formaPagamento: string;
      valor: number;
      quantidade: number;
    }>;
  };
  movimentacoes: Movimentacao[];
  vendas: Venda[];
  valorAbertura: number;
  valorEsperado: number;
}

export default function FecharCaixaPage() {
  const router = useRouter();
  const { token, activeCompanyId, user } = useAuth();
  const { success, error: showError, toasts } = useToast();
  const [valorFechamento, setValorFechamento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [resumoCaixa, setResumoCaixa] = useState<ResumoCaixa | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingResumo, setLoadingResumo] = useState(true);
  const [caixa, setCaixa] = useState<any>(null);

  useEffect(() => {
    if (token && activeCompanyId && user?.id) {
      verificarStatusCaixa();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeCompanyId, user?.id]);

  const verificarStatusCaixa = async () => {
    if (!token || !activeCompanyId || !user?.id) {
      console.error('❌ Verificação de caixa bloqueada:', {
        hasToken: !!token,
        hasCompanyId: !!activeCompanyId,
        hasUserId: !!user?.id
      });
      return;
    }

    try {
      console.log('🔍 Verificando status do caixa:', {
        company_id: activeCompanyId,
        usuario_id: user.id
      });

      const response = await fetch(
        `/api/caixa/status?company_id=${activeCompanyId}&usuario_id=${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 Status da resposta:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Dados recebidos:', data);
        
        if (data.success && data.data && data.data.caixaAberto && data.data.caixa) {
          const caixaEncontrado = data.data.caixa;
          setCaixa(caixaEncontrado);
          console.log('✅ Caixa aberto encontrado:', caixaEncontrado.id);
          
          // CRÍTICO: Carregar resumo COM o caixa_id
          await carregarResumoCaixa(caixaEncontrado.id);
        } else {
          console.warn('⚠️ Nenhum caixa aberto encontrado');
          showError('Erro', 'Nenhum caixa aberto encontrado. Abra um caixa antes de tentar fechar.');
          setTimeout(() => router.push('/frente-caixa'), 2000);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na verificação do caixa:', response.status, errorData);
        showError('Erro', errorData.error || 'Erro ao verificar status do caixa');
        setTimeout(() => router.push('/frente-caixa'), 2000);
      }
    } catch (err) {
      console.error('❌ Erro ao verificar caixa:', err);
      showError('Erro', 'Erro de conexão ao verificar o caixa');
    }
  };

  const carregarResumoCaixa = async (caixaIdParam?: string) => {
    const idCaixa = caixaIdParam || caixa?.id;
    
    if (!token || !activeCompanyId) {
      console.warn('⚠️ Token ou companyId ausente');
      return;
    }

    if (!idCaixa) {
      console.warn('⚠️ Caixa ID não disponível ainda, aguardando...');
      return;
    }

    try {
      setLoadingResumo(true);
      console.log('📡 Carregando resumo do caixa:', idCaixa);
      
      const response = await fetch(
        `/api/caixa/resumo?company_id=${activeCompanyId}&caixa_id=${idCaixa}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📊 Status resposta resumo:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Resumo recebido:', data);
        
        if (data.success && data.data) {
          setResumoCaixa(data.data);
          // NÃO preencher automaticamente - usuário deve contar e digitar
          console.log('💰 Saldo esperado:', data.data.resumo?.saldoAtual || 0);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro ao carregar resumo:', response.status, errorData);
        console.error('   Detalhes completos:', JSON.stringify(errorData, null, 2));
        showError(
          'Erro ao carregar resumo',
          errorData.error || `Erro ${response.status} ao buscar dados do caixa. Veja o console para detalhes.`
        );
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar resumo:', err);
      console.error('   Mensagem:', err.message);
      console.error('   Stack:', err.stack);
      showError('Erro', 'Erro de conexão ao carregar resumo do caixa');
    } finally {
      setLoadingResumo(false);
    }
  };

  const fecharCaixa = async () => {
    if (!token || !activeCompanyId || !user?.id) {
      showError('Erro', 'Usuário não autenticado');
      console.error('❌ Fechamento bloqueado: token, companyId ou userId ausente', {
        hasToken: !!token,
        hasCompanyId: !!activeCompanyId,
        hasUserId: !!user?.id
      });
      return;
    }

    if (!caixa?.id) {
      showError('Erro', 'Nenhum caixa aberto encontrado');
      console.error('❌ Fechamento bloqueado: caixa não encontrado');
      return;
    }

    const valor = parseFloat(valorFechamento.replace(',', '.'));
    if (isNaN(valor) || valor < 0) {
      showError('Erro', 'Informe um valor válido');
      console.error('❌ Fechamento bloqueado: valor inválido', { valorFechamento, valor });
      return;
    }

    console.log('🔄 Iniciando fechamento de caixa:', {
      company_id: activeCompanyId,
      caixa_id: caixa.id,
      valorReal: valor,
      hasObservacoes: !!observacoes
    });

    setLoading(true);
    try {
      let usuarioId = user.id;
      if (!usuarioId && token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1] || '{}'));
          usuarioId = payload.userId || payload.id || user.id;
        } catch (e) {
          console.warn('Não foi possível extrair userId do token');
        }
      }

      const requestBody = {
        company_id: activeCompanyId,
        caixa_id: caixa.id,
        valorReal: valor,
        observacoes: observacoes,
      };

      console.log('📤 Enviando requisição:', requestBody);

      const response = await fetch('/api/caixa/fechar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Resposta da API:', data);
        
        if (data.success) {
          const diferenca = data.data?.diferenca || 0;
          let mensagem = 'O caixa foi fechado com sucesso.';
          
          if (diferenca > 0) {
            mensagem += ` Sobra de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(diferenca)}`;
          } else if (diferenca < 0) {
            mensagem += ` Falta de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(diferenca))}`;
          }
          
          success('Caixa fechado!', mensagem);
          setTimeout(() => {
            router.push('/frente-caixa');
          }, 1500);
        } else {
          console.error('❌ Resposta de erro da API:', data);
          showError('Erro', data.error || 'Erro ao fechar caixa');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.error || 'Erro ao fechar caixa';
        
        // Mensagens mais amigáveis baseadas no status HTTP
        if (response.status === 401) {
          errorMessage = 'Sessão expirada. Faça login novamente.';
        } else if (response.status === 404) {
          errorMessage = 'Caixa não encontrado. Recarregue a página e tente novamente.';
        } else if (response.status === 400) {
          errorMessage = errorData.error || 'Dados inválidos para fechamento do caixa.';
        }
        
        showError('Erro ao Fechar Caixa', errorMessage);
        console.error('Erro ao fechar caixa:', response.status, errorData);
      }
    } catch (err: any) {
      console.error('Erro ao fechar caixa:', err);
      showError('Erro', err.message || 'Erro de conexão ao tentar fechar o caixa. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numeric = value.replace(/[^\d,]/g, '');
    return numeric;
  };

  const imprimirRelatorio = () => {
    if (!resumoCaixa || !caixa) return;

    const dataAtual = new Date().toLocaleString('pt-BR');
    const valorReal = parseFloat(valorFechamento.replace(',', '.')) || 0;
    const diferenca = valorReal - valorEsperado;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Fechamento de Caixa</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { text-align: center; margin-bottom: 5px; font-size: 20px; }
          h2 { text-align: center; margin-top: 0; font-size: 14px; color: #666; }
          .section { margin: 20px 0; border-top: 2px dashed #333; padding-top: 10px; }
          .row { display: flex; justify-between; padding: 5px 0; }
          .row.total { font-weight: bold; border-top: 1px solid #333; margin-top: 5px; padding-top: 10px; }
          .label { flex: 1; }
          .value { text-align: right; font-weight: bold; }
          .movimentacao { padding: 5px 0; font-size: 12px; }
          .sangria { color: #dc2626; }
          .suprimento { color: #16a34a; }
          @media print {
            body { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <h1>═══ RELATÓRIO DE FECHAMENTO ═══</h1>
        <h2>${dataAtual}</h2>
        
        <div class="section">
          <div class="row">
            <span class="label">Caixa:</span>
            <span class="value">${caixa.descricao || 'Caixa Principal'}</span>
          </div>
          <div class="row">
            <span class="label">Operador:</span>
            <span class="value">${user?.name || 'Não informado'}</span>
          </div>
          <div class="row">
            <span class="label">Data Abertura:</span>
            <span class="value">${new Date(caixa.dataAbertura).toLocaleString('pt-BR')}</span>
          </div>
        </div>

        <div class="section">
          <h3 style="margin: 10px 0;">💰 RESUMO FINANCEIRO</h3>
          <div class="row">
            <span class="label">Valor de Abertura:</span>
            <span class="value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumoCaixa.valorAbertura)}</span>
          </div>
          <div class="row">
            <span class="label">Total de Vendas (${resumoCaixa.resumo.totalVendas}):</span>
            <span class="value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumoCaixa.resumo.valorTotalVendas)}</span>
          </div>
          ${resumoCaixa.resumo.totalVendasCanceladas > 0 ? `
          <div class="row" style="color: #ca8a04;">
            <span class="label">Vendas Canceladas (${resumoCaixa.resumo.totalVendasCanceladas}):</span>
            <span class="value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumoCaixa.resumo.valorTotalCanceladas)}</span>
          </div>
          ` : ''}
          <div class="row">
            <span class="label">Sangrias (${resumoCaixa.resumo.quantidadeSangrias}):</span>
            <span class="value" style="color: #dc2626;">- ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumoCaixa.resumo.totalSangrias)}</span>
          </div>
          <div class="row">
            <span class="label">Suprimentos (${resumoCaixa.resumo.quantidadeSuprimentos}):</span>
            <span class="value" style="color: #16a34a;">+ ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumoCaixa.resumo.totalSuprimentos)}</span>
          </div>
          <div class="row total">
            <span class="label">SALDO ESPERADO:</span>
            <span class="value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorEsperado)}</span>
          </div>
          ${valorReal > 0 ? `
          <div class="row">
            <span class="label">Valor Real Contado:</span>
            <span class="value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorReal)}</span>
          </div>
          <div class="row" style="color: ${diferenca === 0 ? '#16a34a' : diferenca > 0 ? '#2563eb' : '#dc2626'};">
            <span class="label">DIFERENÇA:</span>
            <span class="value">${diferenca > 0 ? '+' : ''}${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(diferenca)}</span>
          </div>
          ` : ''}
        </div>

        ${resumoCaixa.resumo.totalPorFormaPagamento && resumoCaixa.resumo.totalPorFormaPagamento.length > 0 ? `
        <div class="section">
          <h3 style="margin: 10px 0;">💳 POR FORMA DE PAGAMENTO</h3>
          ${resumoCaixa.resumo.totalPorFormaPagamento.map(forma => `
          <div class="row">
            <span class="label">${forma.formaPagamento} (${forma.quantidade}):</span>
            <span class="value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(forma.valor)}</span>
          </div>
          `).join('')}
        </div>
        ` : ''}

        ${resumoCaixa.movimentacoes && resumoCaixa.movimentacoes.length > 0 ? `
        <div class="section">
          <h3 style="margin: 10px 0;">📝 MOVIMENTAÇÕES</h3>
          ${resumoCaixa.movimentacoes.map(mov => `
          <div class="movimentacao ${mov.tipo}">
            ${new Date(mov.dataMovimentacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - 
            ${mov.tipo.toUpperCase()}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mov.valor)} - 
            ${mov.descricao}
          </div>
          `).join('')}
        </div>
        ` : ''}

        ${observacoes ? `
        <div class="section">
          <h3 style="margin: 10px 0;">📋 OBSERVAÇÕES</h3>
          <p style="white-space: pre-wrap;">${observacoes}</p>
        </div>
        ` : ''}

        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
          <p>_________________________________</p>
          <p>Assinatura do Responsável</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const valorEsperado = resumoCaixa?.resumo?.saldoAtual || 0;
  const valorReal = parseFloat(valorFechamento.replace(',', '.')) || 0;
  const diferenca = valorReal - valorEsperado;

  if (loadingResumo) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando resumo do caixa...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/frente-caixa')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Frente de Caixa
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/frente-caixa/diagnostico')}
                    className="border-purple-500 text-purple-600 hover:bg-purple-50"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Diagnóstico
                  </Button>
                  {resumoCaixa && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={imprimirRelatorio}
                      className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir Relatório
                    </Button>
                  )}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <LogOut className="h-8 w-8 text-orange-600" />
                Fechar Caixa
              </h1>
              <p className="text-gray-600">
                Registre o valor real encontrado no caixa
              </p>
            </div>

            {/* Resumo do Caixa */}
            {resumoCaixa && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
                >
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Valor de Abertura</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(resumoCaixa.valorAbertura || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Total de Vendas</p>
                        <p className="text-2xl font-bold text-green-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(resumoCaixa.resumo?.valorTotalVendas || 0)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {resumoCaixa.resumo?.totalVendas || 0} vendas
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Sangrias</p>
                        <p className="text-2xl font-bold text-red-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(resumoCaixa.resumo?.totalSangrias || 0)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {resumoCaixa.resumo?.quantidadeSangrias || 0} retiradas
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Saldo Esperado</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(valorEsperado)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Detalhamento de Vendas - NOVO */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <Card className="border-2 border-indigo-200">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <CreditCard className="h-6 w-6 text-indigo-600" />
                        Vendas por Forma de Pagamento
                      </CardTitle>
                      <CardDescription className="text-sm mt-2">
                        Confira os valores por tipo de pagamento para validar a diferença de caixa
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {resumoCaixa.resumo?.totalPorFormaPagamento && resumoCaixa.resumo.totalPorFormaPagamento.length > 0 ? (
                        <div className="space-y-3">
                          {resumoCaixa.resumo.totalPorFormaPagamento.map((forma, index) => {
                            const isDinheiro = forma.formaPagamento === 'DINHEIRO';
                            return (
                              <div 
                                key={index} 
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  isDinheiro 
                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-md' 
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    {isDinheiro ? (
                                      <div className="p-2 bg-green-500 rounded-lg">
                                        <DollarSign className="h-5 w-5 text-white" />
                                      </div>
                                    ) : (
                                      <div className="p-2 bg-indigo-500 rounded-lg">
                                        <CreditCard className="h-5 w-5 text-white" />
                                      </div>
                                    )}
                                    <div>
                                      <p className={`font-bold text-base ${isDinheiro ? 'text-green-900' : 'text-gray-900'}`}>
                                        {forma.formaPagamento}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-0.5">
                                        {forma.quantidade} venda{forma.quantidade !== 1 ? 's' : ''}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-2xl font-bold ${isDinheiro ? 'text-green-700' : 'text-gray-900'}`}>
                                      {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                      }).format(forma.valor)}
                                    </p>
                                    {isDinheiro && (
                                      <p className="text-xs text-green-700 font-semibold mt-1">
                                        💵 Deve estar no caixa
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* Resumo de Dinheiro Físico */}
                          {resumoCaixa.resumo.totalPorFormaPagamento.some(f => f.formaPagamento === 'DINHEIRO') && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl">
                              <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="font-bold text-amber-900 mb-1">💡 Dica para Contagem:</p>
                                  <p className="text-sm text-amber-800">
                                    O dinheiro físico no caixa deve ser:{' '}
                                    <span className="font-bold">
                                      {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                      }).format(
                                        resumoCaixa.valorAbertura + 
                                        (resumoCaixa.resumo.totalPorFormaPagamento.find(f => f.formaPagamento === 'DINHEIRO')?.valor || 0) -
                                        (resumoCaixa.resumo?.totalSangrias || 0) +
                                        (resumoCaixa.resumo?.totalSuprimentos || 0)
                                      )}
                                    </span>
                                  </p>
                                  <p className="text-xs text-amber-700 mt-2">
                                    ℹ️ Valores em cartão/PIX não devem estar no caixa físico
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-4">Nenhuma venda registrada</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Cards Adicionais - Detalhes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                >

                  {/* Movimentações */}
                  {resumoCaixa.movimentacoes && resumoCaixa.movimentacoes.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">📝 Movimentações do Caixa</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          {resumoCaixa.movimentacoes.map((mov) => (
                            <div 
                              key={mov.id} 
                              className={`p-2 rounded ${
                                mov.tipo === 'sangria' 
                                  ? 'bg-red-50 border-l-4 border-red-300' 
                                  : 'bg-green-50 border-l-4 border-green-300'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold uppercase ${
                                      mov.tipo === 'sangria' ? 'text-red-700' : 'text-green-700'
                                    }`}>
                                      {mov.tipo}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(mov.dataMovimentacao).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">{mov.descricao}</p>
                                  <p className="text-xs text-gray-500">{mov.usuarioNome}</p>
                                </div>
                                <span className={`font-bold ${
                                  mov.tipo === 'sangria' ? 'text-red-700' : 'text-green-700'
                                }`}>
                                  {mov.tipo === 'sangria' ? '-' : '+'}
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  }).format(mov.valor)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Vendas Canceladas */}
                  {resumoCaixa.resumo?.totalVendasCanceladas > 0 && (
                    <Card className="md:col-span-2 bg-yellow-50 border-yellow-200">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-700">⚠️ Vendas Canceladas</p>
                            <p className="text-xs text-gray-500">
                              {resumoCaixa.resumo.totalVendasCanceladas} vendas foram canceladas
                            </p>
                          </div>
                          <span className="text-xl font-bold text-yellow-700">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(resumoCaixa.resumo.valorTotalCanceladas)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>

                {/* Lista de Vendas Realizadas - NOVO */}
                {resumoCaixa.vendas && resumoCaixa.vendas.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <Card className="border-2 border-blue-200">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Receipt className="h-5 w-5 text-blue-600" />
                          Vendas Realizadas ({resumoCaixa.vendas.length})
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          Últimas vendas do caixa
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                          {resumoCaixa.vendas.slice(0, 20).map((venda: any, index: number) => (
                            <div 
                              key={venda.id || index}
                              className="p-3 bg-gradient-to-r from-white to-blue-50/30 rounded-lg border border-blue-100 hover:shadow-md transition-all"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono font-bold text-indigo-600">
                                      #{venda.numero || venda.id.substring(0, 8).toUpperCase()}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(venda.dataVenda).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 truncate">
                                    {venda.clienteNome || 'Cliente Avulso'}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      venda.meioPagamento === 'DINHEIRO' 
                                        ? 'bg-green-100 text-green-700'
                                        : venda.meioPagamento === 'PIX'
                                        ? 'bg-blue-100 text-blue-700'
                                        : venda.meioPagamento === 'CARTAO_CREDITO'
                                        ? 'bg-purple-100 text-purple-700'
                                        : venda.meioPagamento === 'CARTAO_DEBITO'
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {venda.meioPagamento === 'DINHEIRO' && '💵'}
                                      {venda.meioPagamento === 'PIX' && '📱'}
                                      {venda.meioPagamento === 'CARTAO_CREDITO' && '💳'}
                                      {venda.meioPagamento === 'CARTAO_DEBITO' && '💳'}
                                      {' '}
                                      {venda.meioPagamento?.replace('_', ' ') || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right ml-3">
                                  <p className="text-lg font-bold text-green-600">
                                    {new Intl.NumberFormat('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL'
                                    }).format(venda.valorTotal)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {resumoCaixa.vendas.length > 20 && (
                            <p className="text-center text-sm text-gray-500 pt-2">
                              + {resumoCaixa.vendas.length - 20} vendas mais antigas
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </>
            )}

            {/* Quadro de Validação - Dinheiro Físico Esperado */}
            {resumoCaixa && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                className="mb-6"
              >
                <Card className="border-4 border-green-300 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 shadow-xl">
                  <CardHeader className="border-b-2 border-green-200">
                    <CardTitle className="text-2xl flex items-center gap-2 text-green-900">
                      <div className="p-2 bg-green-500 rounded-xl shadow-lg">
                        <DollarSign className="h-7 w-7 text-white" />
                      </div>
                      💰 Dinheiro Físico Esperado no Caixa
                    </CardTitle>
                    <CardDescription className="text-base text-green-800 mt-2">
                      Este é o valor em dinheiro que deve estar fisicamente no caixa
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {/* Cálculo Visual */}
                    <div className="bg-white/80 rounded-xl p-5 border-2 border-green-200 space-y-3">
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-700 font-medium">💵 Abertura em Dinheiro:</span>
                        <span className="font-bold text-green-700">
                          + {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(resumoCaixa.valorAbertura || 0)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-700 font-medium">💵 Vendas em Dinheiro:</span>
                        <span className="font-bold text-green-700">
                          + {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(
                            resumoCaixa.resumo?.totalPorFormaPagamento?.find(f => f.formaPagamento === 'DINHEIRO')?.valor || 0
                          )}
                        </span>
                      </div>

                      {resumoCaixa.resumo?.totalSuprimentos > 0 && (
                        <div className="flex justify-between items-center text-lg">
                          <span className="text-gray-700 font-medium">➕ Suprimentos:</span>
                          <span className="font-bold text-green-700">
                            + {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(resumoCaixa.resumo.totalSuprimentos || 0)}
                          </span>
                        </div>
                      )}

                      {resumoCaixa.resumo?.totalSangrias > 0 && (
                        <div className="flex justify-between items-center text-lg">
                          <span className="text-gray-700 font-medium">➖ Sangrias (Retiradas):</span>
                          <span className="font-bold text-red-600">
                            - {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(resumoCaixa.resumo.totalSangrias || 0)}
                          </span>
                        </div>
                      )}

                      <div className="border-t-4 border-green-300 pt-4 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-green-900">
                            💵 DINHEIRO NO CAIXA:
                          </span>
                          <span className="text-3xl font-bold text-green-700">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(
                              (resumoCaixa.valorAbertura || 0) + 
                              (resumoCaixa.resumo?.totalPorFormaPagamento?.find(f => f.formaPagamento === 'DINHEIRO')?.valor || 0) -
                              (resumoCaixa.resumo?.totalSangrias || 0) +
                              (resumoCaixa.resumo?.totalSuprimentos || 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Outras Formas de Pagamento (Não Físico) */}
                    {resumoCaixa.resumo?.totalPorFormaPagamento?.filter(f => f.formaPagamento !== 'DINHEIRO').length > 0 && (
                      <div className="bg-blue-50/50 rounded-xl p-4 border-2 border-blue-200">
                        <p className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          ℹ️ Valores NÃO físicos (não estarão no caixa):
                        </p>
                        <div className="space-y-2">
                          {resumoCaixa.resumo.totalPorFormaPagamento
                            .filter(f => f.formaPagamento !== 'DINHEIRO')
                            .map((forma, index) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <span className="text-blue-800">
                                  {forma.formaPagamento === 'PIX' && '📱'}
                                  {forma.formaPagamento === 'CARTAO_CREDITO' && '💳'}
                                  {forma.formaPagamento === 'CARTAO_DEBITO' && '💳'}
                                  {' '}
                                  {forma.formaPagamento.replace('_', ' ')}
                                  {' '}({forma.quantidade})
                                </span>
                                <span className="font-semibold text-blue-900">
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  }).format(forma.valor)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Card Principal */}
            <Card className="shadow-lg border-2 border-orange-100">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-orange-600" />
                  Conferência de Caixa
                </CardTitle>
                <CardDescription>
                  Conte o dinheiro físico (notas e moedas) e informe o valor real encontrado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Valor Real */}
                <div className="space-y-2">
                  <Label htmlFor="valorFechamento" className="text-base font-medium">
                    Valor Real no Caixa (R$)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="valorFechamento"
                      type="text"
                      value={valorFechamento}
                      onChange={(e) => {
                        const formatted = formatCurrency(e.target.value);
                        setValorFechamento(formatted);
                      }}
                      placeholder="0,00"
                      className="pl-10 text-2xl font-semibold h-16 text-center"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Diferença */}
                {valorReal > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-5 rounded-xl border-3 shadow-lg ${
                      diferenca === 0
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                        : diferenca > 0
                        ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300'
                        : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {diferenca === 0 ? (
                          <div className="p-2 bg-green-500 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-white" />
                          </div>
                        ) : diferenca > 0 ? (
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-white" />
                          </div>
                        ) : (
                          <div className="p-2 bg-red-500 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div>
                          <p className={`font-bold text-lg ${
                            diferenca === 0
                              ? 'text-green-800'
                              : diferenca > 0
                              ? 'text-blue-800'
                              : 'text-red-800'
                          }`}>
                            {diferenca === 0
                              ? '✅ Caixa Correto!'
                              : diferenca > 0
                              ? '🔵 Sobra de Caixa'
                              : '🔴 Falta no Caixa'}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {diferenca === 0
                              ? 'Valor contado está correto'
                              : diferenca > 0
                              ? 'Há mais dinheiro que o esperado'
                              : 'Há menos dinheiro que o esperado'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-3xl font-bold ${
                          diferenca === 0
                            ? 'text-green-600'
                            : diferenca > 0
                            ? 'text-blue-600'
                            : 'text-red-600'
                        }`}
                      >
                        {diferenca > 0 ? '+' : ''}
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(diferenca)}
                      </span>
                    </div>
                    
                    {/* Explicação da diferença */}
                    <div className={`text-xs p-3 rounded-lg ${
                      diferenca === 0
                        ? 'bg-green-100/50 text-green-800'
                        : diferenca > 0
                        ? 'bg-blue-100/50 text-blue-800'
                        : 'bg-red-100/50 text-red-800'
                    }`}>
                      <p className="font-semibold mb-1">
                        📊 Cálculo: Valor Real ({new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(valorReal)}) - Esperado ({new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(valorEsperado)}) = {diferenca > 0 ? '+' : ''}{new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(diferenca)}
                      </p>
                      {diferenca !== 0 && (
                        <p className="text-xs mt-1">
                          {diferenca > 0 
                            ? '💡 Verifique se não ficou dinheiro de troco ou se houve algum recebimento não registrado.'
                            : '💡 Verifique sangrias não registradas, trocos dados ou possível erro de contagem.'}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="observacoes" className="text-base font-medium">
                    Observações (opcional)
                  </Label>
                  <Textarea
                    id="observacoes"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Anote qualquer observação sobre o fechamento do caixa..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/frente-caixa')}
                    className="flex-1 h-12"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={fecharCaixa}
                    disabled={loading || !valorFechamento}
                    className="flex-1 h-12 bg-orange-600 hover:bg-orange-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Fechando...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2" />
                        Fechar Caixa
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <ToastContainer toasts={toasts} />
        </div>
      </div>
    </Layout>
  );
}




