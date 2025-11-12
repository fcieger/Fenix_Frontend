'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Search, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DiagnosticoCaixaPage() {
  const router = useRouter();
  const { token, activeCompanyId, user } = useAuth();
  const [diagnostico, setDiagnostico] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [caixaId, setCaixaId] = useState<string | null>(null);

  useEffect(() => {
    if (token && activeCompanyId && user?.id) {
      buscarCaixaEDiagnostico();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeCompanyId, user?.id]);

  const buscarCaixaEDiagnostico = async () => {
    if (!token || !activeCompanyId || !user?.id) return;

    try {
      setLoading(true);

      // Buscar caixa aberto
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
        
        if (caixaData.success && caixaData.data?.caixaAberto && caixaData.data?.caixa) {
          const idCaixa = caixaData.data.caixa.id;
          setCaixaId(idCaixa);
          await carregarDiagnostico(idCaixa);
        } else {
          await carregarDiagnostico(null);
        }
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const carregarDiagnostico = async (idCaixa: string | null) => {
    if (!token || !activeCompanyId) return;

    try {
      const url = idCaixa
        ? `/api/caixa/diagnostico?company_id=${activeCompanyId}&caixa_id=${idCaixa}`
        : `/api/caixa/diagnostico?company_id=${activeCompanyId}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDiagnostico(data.data);
        }
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/frente-caixa')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Search className="h-8 w-8 text-indigo-600" />
                Diagnóstico do Caixa
              </h1>
              <p className="text-gray-600">
                Informações técnicas para debug
              </p>
            </div>

            {!diagnostico ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum dado disponível</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Info Geral */}
                <Card>
                  <CardHeader>
                    <CardTitle>📋 Informações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs font-mono">
                      {JSON.stringify({
                        timestamp: diagnostico.timestamp,
                        company_id: diagnostico.company_id,
                        caixa_id: diagnostico.caixa_id
                      }, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                {/* Dados do Caixa */}
                {diagnostico.caixa && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🏦 Dados do Caixa</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-900 text-cyan-400 p-4 rounded-lg overflow-auto text-xs font-mono">
                        {JSON.stringify(diagnostico.caixa, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Últimos Caixas */}
                {diagnostico.ultimos_caixas && (
                  <Card>
                    <CardHeader>
                      <CardTitle>📦 Últimos Caixas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-900 text-yellow-400 p-4 rounded-lg overflow-auto text-xs font-mono">
                        {JSON.stringify(diagnostico.ultimos_caixas, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Vendas */}
                {diagnostico.vendas && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🛒 Vendas ({diagnostico.vendas.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs font-mono max-h-96">
                        {JSON.stringify(diagnostico.vendas, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Vendas por Status */}
                {diagnostico.vendas_por_status && (
                  <Card>
                    <CardHeader>
                      <CardTitle>📊 Vendas por Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg overflow-auto text-xs font-mono">
                        {JSON.stringify(diagnostico.vendas_por_status, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Vendas por Forma */}
                {diagnostico.vendas_por_forma && (
                  <Card>
                    <CardHeader>
                      <CardTitle>💳 Vendas por Forma de Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg overflow-auto text-xs font-mono">
                        {JSON.stringify(diagnostico.vendas_por_forma, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Movimentações */}
                {diagnostico.movimentacoes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🔄 Movimentações ({diagnostico.movimentacoes.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-900 text-orange-400 p-4 rounded-lg overflow-auto text-xs font-mono max-h-96">
                        {JSON.stringify(diagnostico.movimentacoes, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Cálculo do Saldo */}
                {diagnostico.calculo_saldo && (
                  <Card className="border-4 border-green-500">
                    <CardHeader className="bg-green-50">
                      <CardTitle className="text-2xl text-green-900">💰 Cálculo do Saldo</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="bg-gray-900 text-green-400 p-6 rounded-lg text-base font-mono space-y-2">
                        <div>Valor Abertura: R$ {diagnostico.calculo_saldo.valorAbertura.toFixed(2)}</div>
                        <div>Valor Vendas:   R$ {diagnostico.calculo_saldo.valorVendas.toFixed(2)}</div>
                        <div>Sangrias:       R$ {diagnostico.calculo_saldo.totalSangrias.toFixed(2)}</div>
                        <div>Suprimentos:    R$ {diagnostico.calculo_saldo.totalSuprimentos.toFixed(2)}</div>
                        <div className="border-t border-green-600 pt-2 mt-2">
                          Fórmula: {diagnostico.calculo_saldo.formula}
                        </div>
                        <div className="text-2xl font-bold text-yellow-400 pt-2">
                          SALDO: R$ {diagnostico.calculo_saldo.saldoCalculado.toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Botão Atualizar */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={buscarCaixaEDiagnostico}
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Atualizar Diagnóstico
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}



