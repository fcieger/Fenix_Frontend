'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { listarMinhasSolicitacoes, buscarMeuCapitalGiro } from '@/services/credito';
import { SolicitacaoCredito, CapitalGiro } from '@/types/credito';

export default function CreditoPage() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCredito[]>([]);
  const [capitalGiro, setCapitalGiro] = useState<CapitalGiro | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [solicitacoesData] = await Promise.all([
        listarMinhasSolicitacoes(),
      ]);
      setSolicitacoes(solicitacoesData);

      // Tentar buscar capital de giro (pode não existir)
      try {
        const capitalData = await buscarMeuCapitalGiro();
        setCapitalGiro(capitalData);
      } catch (error) {
        // Capital de giro não disponível
        setCapitalGiro(null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const temSolicitacaoAtiva = solicitacoes.some(
    s => ['em_analise', 'aguardando_documentos', 'documentacao_completa', 'proposta_enviada'].includes(s.status)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Crédito Empresarial</h1>
        <p className="text-gray-600 mt-2">Gerencie suas solicitações de crédito e linhas ativas</p>
      </div>

      {/* Cards de Status */}
      {solicitacoes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Solicitações</p>
                <p className="text-2xl font-bold text-gray-900">{solicitacoes.length}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {solicitacoes.filter(s => s.status === 'aprovado').length}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Análise</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {solicitacoes.filter(s => s.status === 'em_analise').length}
                </p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* Menu de Navegação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Solicitar Crédito */}
        {!temSolicitacaoAtiva && (
          <Link href="/credito/solicitar" className="block">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-white">
              <CreditCard className="h-12 w-12 mb-4" />
              <h2 className="text-xl font-bold mb-2">Solicitar Crédito</h2>
              <p className="text-blue-100">Inicie uma nova solicitação de crédito para sua empresa</p>
            </div>
          </Link>
        )}

        {/* Minhas Solicitações */}
        <Link href="/credito/minhas-solicitacoes" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-gray-200">
            <FileText className="h-12 w-12 mb-4 text-gray-700" />
            <h2 className="text-xl font-bold mb-2 text-gray-900">Minhas Solicitações</h2>
            <p className="text-gray-600">Acompanhe o status das suas solicitações de crédito</p>
            {solicitacoes.length > 0 && (
              <div className="mt-3 text-sm text-gray-500">
                {solicitacoes.length} {solicitacoes.length === 1 ? 'solicitação' : 'solicitações'}
              </div>
            )}
          </div>
        </Link>

        {/* Propostas */}
        <Link href="/credito/propostas" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-gray-200">
            <TrendingUp className="h-12 w-12 mb-4 text-gray-700" />
            <h2 className="text-xl font-bold mb-2 text-gray-900">Minhas Propostas</h2>
            <p className="text-gray-600">Visualize e responda às propostas de crédito recebidas</p>
          </div>
        </Link>

        {/* Capital de Giro */}
        {capitalGiro && (
          <Link href="/credito/capital-giro" className="block">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-white">
              <DollarSign className="h-12 w-12 mb-4" />
              <h2 className="text-xl font-bold mb-2">Capital de Giro</h2>
              <p className="text-green-100 mb-3">Utilize seu limite disponível</p>
              <div className="bg-white/20 rounded p-2 text-sm">
                <div>Disponível: <span className="font-bold">R$ {capitalGiro.limiteDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              </div>
            </div>
          </Link>
        )}

        {/* Antecipação de Recebíveis */}
        {capitalGiro && (
          <Link href="/credito/antecipacao" className="block">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-gray-200">
              <Clock className="h-12 w-12 mb-4 text-gray-700" />
              <h2 className="text-xl font-bold mb-2 text-gray-900">Antecipação de Recebíveis</h2>
              <p className="text-gray-600">Antecipe seus títulos a receber</p>
            </div>
          </Link>
        )}
      </div>

      {/* Mensagem se não tem nada */}
      {solicitacoes.length === 0 && !capitalGiro && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bem-vindo ao Módulo de Crédito</h3>
          <p className="text-gray-600 mb-4">
            Você ainda não possui solicitações de crédito. Comece solicitando crédito para sua empresa.
          </p>
          <Link
            href="/credito/solicitar"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Solicitar Crédito Agora
          </Link>
        </div>
      )}
    </div>
  );
}




