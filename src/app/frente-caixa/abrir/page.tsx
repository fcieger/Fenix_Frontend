'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/auth-context';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Loader2,
  Wallet,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AbrirCaixaPage() {
  const router = useRouter();
  const { token, activeCompanyId, user } = useAuth();
  const { success, error: showError, toasts } = useToast();
  const [valorAbertura, setValorAbertura] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);

  const abrirCaixa = async () => {
    if (!token || !activeCompanyId || !user?.id) {
      showError('Erro', 'Usuário não autenticado');
      return;
    }

    const valor = parseFloat(valorAbertura.replace(',', '.'));
    if (isNaN(valor) || valor < 0) {
      showError('Erro', 'Informe um valor válido');
      return;
    }

    setLoading(true);
    try {
      // Extrair user ID do token se necessário
      let usuarioId = user.id;
      if (!usuarioId && token) {
        // Tentar extrair do token JWT ou mock
        try {
          const payload = JSON.parse(atob(token.split('.')[1] || '{}'));
          usuarioId = payload.userId || payload.id || user.id;
        } catch (e) {
          console.warn('Não foi possível extrair userId do token');
        }
      }

      const response = await fetch('/api/caixa/abrir', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: activeCompanyId,
          usuario_id: usuarioId,
          descricao: descricao || `Caixa do dia ${new Date().toLocaleDateString('pt-BR')}`,
          valorAbertura: valor,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          success('Caixa aberto!', 'O caixa foi aberto com sucesso.');
          setTimeout(() => {
            router.push('/frente-caixa');
          }, 1000);
        } else {
          showError('Erro', data.error || 'Erro ao abrir caixa');
        }
      } else {
        const error = await response.json();
        showError('Erro', error.error || 'Erro ao abrir caixa');
      }
    } catch (err: any) {
      showError('Erro', err.message || 'Erro ao abrir caixa');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numeric = value.replace(/[^\d,]/g, '');
    return numeric;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Wallet className="h-8 w-8 text-purple-600" />
                Abrir Caixa
              </h1>
              <p className="text-gray-600">
                Informe o valor inicial para abertura do caixa
              </p>
            </div>

            {/* Card Principal */}
            <Card className="shadow-lg border-2 border-purple-100">
              <CardHeader>
                <CardTitle className="text-xl">Valor de Abertura</CardTitle>
                <CardDescription>
                  Digite o valor em dinheiro que estará no caixa ao abrir
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Valor de Abertura */}
                <div className="space-y-2">
                  <Label htmlFor="valorAbertura" className="text-base font-medium">
                    Valor Inicial (R$)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="valorAbertura"
                      type="text"
                      value={valorAbertura}
                      onChange={(e) => {
                        const formatted = formatCurrency(e.target.value);
                        setValorAbertura(formatted);
                      }}
                      placeholder="0,00"
                      className="pl-10 text-2xl font-semibold h-16 text-center"
                      autoFocus
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Exemplo: 150,00 para R$ 150,00
                  </p>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="descricao" className="text-base font-medium">
                    Descrição (opcional)
                  </Label>
                  <Input
                    id="descricao"
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder={`Caixa do dia ${new Date().toLocaleDateString('pt-BR')}`}
                    className="h-12"
                  />
                </div>

                {/* Resumo */}
                {valorAbertura && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Valor a abrir:
                      </span>
                      <span className="text-2xl font-bold text-purple-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(parseFloat(valorAbertura.replace(',', '.')) || 0)}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 h-12"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={abrirCaixa}
                    disabled={loading || !valorAbertura}
                    className="flex-1 h-12 bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Abrindo...
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4 mr-2" />
                        Abrir Caixa
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Como funciona a abertura de caixa?
                    </h3>
                    <p className="text-sm text-gray-600">
                      O valor informado será o saldo inicial do caixa. Todas as vendas e movimentações 
                      serão registradas com base neste valor inicial.
                    </p>
                  </div>
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






