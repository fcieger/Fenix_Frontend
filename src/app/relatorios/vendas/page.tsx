'use client';

import Layout from '@/components/Layout';
import RelatorioAreaBase from '@/components/relatorios/RelatorioAreaBase';
import { ShoppingCart, BarChart3, TrendingUp, Users, Target, FileText } from 'lucide-react';

const relatoriosVendas = [
  {
    id: 'vendas-periodo',
    titulo: 'Vendas por Período',
    descricao: 'Análise completa de vendas com gráficos e métricas',
    icon: BarChart3,
    categoria: 'vendas',
    cor: 'from-blue-500 to-blue-600',
    disponivel: true
  },
  {
    id: 'vendas-produtos',
    titulo: 'Produtos Mais Vendidos',
    descricao: 'Ranking dos produtos com maior volume de vendas',
    icon: TrendingUp,
    categoria: 'vendas',
    cor: 'from-green-500 to-emerald-500',
    disponivel: true
  },
  {
    id: 'vendas-clientes',
    titulo: 'Vendas por Cliente',
    descricao: 'Análise de vendas agrupadas por cliente',
    icon: Users,
    categoria: 'vendas',
    cor: 'from-purple-500 to-purple-600',
    disponivel: true
  },
  {
    id: 'vendas-vendedores',
    titulo: 'Performance de Vendedores',
    descricao: 'Desempenho individual de cada vendedor',
    icon: Target,
    categoria: 'vendas',
    cor: 'from-orange-500 to-orange-600',
    disponivel: true
  },
  {
    id: 'orcamentos',
    titulo: 'Análise de Orçamentos',
    descricao: 'Taxa de conversão e análise de orçamentos',
    icon: FileText,
    categoria: 'vendas',
    cor: 'from-indigo-500 to-indigo-600',
    disponivel: true
  }
];

export default function RelatoriosVendasPage() {
  return (
    <Layout>
      <RelatorioAreaBase
        areaId="vendas"
        areaNome="Vendas"
        areaIcon={ShoppingCart}
        areaCor="from-blue-500 to-cyan-500"
        relatorios={relatoriosVendas}
      />
    </Layout>
  );
}

