'use client';

import Layout from '@/components/Layout';
import RelatorioAreaBase from '@/components/relatorios/RelatorioAreaBase';
import { DollarSign, Activity, Receipt, PieChart, Wallet, CreditCard, Target } from 'lucide-react';

const relatoriosFinanceiro = [
  {
    id: 'financeiro-fluxo',
    titulo: 'Fluxo de Caixa',
    descricao: 'Entradas e saídas de caixa detalhadas',
    icon: Activity,
    categoria: 'financeiro',
    cor: 'from-purple-500 to-purple-600',
    disponivel: true
  },
  {
    id: 'financeiro-contas',
    titulo: 'Contas a Pagar/Receber',
    descricao: 'Relatório completo de títulos em aberto',
    icon: Receipt,
    categoria: 'financeiro',
    cor: 'from-orange-500 to-orange-600',
    disponivel: true
  },
  {
    id: 'financeiro-dre',
    titulo: 'DRE - Demonstração de Resultados',
    descricao: 'Demonstração do resultado do exercício',
    icon: PieChart,
    categoria: 'financeiro',
    cor: 'from-blue-500 to-blue-600',
    disponivel: true
  },
  {
    id: 'financeiro-bancos',
    titulo: 'Movimentações Bancárias',
    descricao: 'Extrato e movimentações por conta bancária',
    icon: Wallet,
    categoria: 'financeiro',
    cor: 'from-green-500 to-green-600',
    disponivel: true
  },
  {
    id: 'financeiro-formas-pagamento',
    titulo: 'Análise por Forma de Pagamento',
    descricao: 'Recebimentos e pagamentos por forma de pagamento',
    icon: CreditCard,
    categoria: 'financeiro',
    cor: 'from-indigo-500 to-indigo-600',
    disponivel: true
  },
  {
    id: 'financeiro-centro-custo',
    titulo: 'Análise por Centro de Custo',
    descricao: 'Despesas e receitas por centro de custo',
    icon: Target,
    categoria: 'financeiro',
    cor: 'from-pink-500 to-pink-600',
    disponivel: true
  }
];

export default function RelatoriosFinanceiroPage() {
  return (
    <Layout>
      <RelatorioAreaBase
        areaId="financeiro"
        areaNome="Financeiro"
        areaIcon={DollarSign}
        areaCor="from-purple-500 to-pink-500"
        relatorios={relatoriosFinanceiro}
      />
    </Layout>
  );
}



