'use client';

import Layout from '@/components/Layout';
import RelatorioAreaBase from '@/components/reports/RelatorioAreaBase';
import { Store, ShoppingCart, Users, Banknote, CreditCard } from 'lucide-react';

const relatoriosCaixa = [
  {
    id: 'caixa-vendas',
    titulo: 'Vendas do Caixa',
    descricao: 'Relatório de vendas realizadas no PDV',
    icon: ShoppingCart,
    categoria: 'frente-caixa',
    cor: 'from-cyan-500 to-cyan-600',
    disponivel: true
  },
  {
    id: 'caixa-operadores',
    titulo: 'Performance de Operadores',
    descricao: 'Desempenho dos operadores de caixa',
    icon: Users,
    categoria: 'frente-caixa',
    cor: 'from-blue-500 to-blue-600',
    disponivel: true
  },
  {
    id: 'caixa-sangrias',
    titulo: 'Sangrias e Suprimentos',
    descricao: 'Histórico de sangrias e suprimentos de caixa',
    icon: Banknote,
    categoria: 'frente-caixa',
    cor: 'from-green-500 to-green-600',
    disponivel: true
  },
  {
    id: 'caixa-formas-pagamento',
    titulo: 'Formas de Pagamento',
    descricao: 'Análise de vendas por forma de pagamento',
    icon: CreditCard,
    categoria: 'frente-caixa',
    cor: 'from-purple-500 to-purple-600',
    disponivel: true
  }
];

export default function RelatoriosCaixaPage() {
  return (
    <Layout>
      <RelatorioAreaBase
        areaId="frente-caixa"
        areaNome="Frente de Caixa"
        areaIcon={Store}
        areaCor="from-cyan-500 to-blue-500"
        relatorios={relatoriosCaixa}
      />
    </Layout>
  );
}


