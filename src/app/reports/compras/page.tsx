'use client';

import Layout from '@/components/Layout';
import RelatorioAreaBase from '@/components/reports/RelatorioAreaBase';
import { ShoppingCart, BarChart3, Building2, Package, Clock } from 'lucide-react';

const relatoriosCompras = [
  {
    id: 'compras-periodo',
    titulo: 'Compras por Período',
    descricao: 'Relatório detalhado de compras realizadas',
    icon: BarChart3,
    categoria: 'compras',
    cor: 'from-green-500 to-green-600',
    disponivel: true
  },
  {
    id: 'compras-fornecedores',
    titulo: 'Compras por Fornecedor',
    descricao: 'Análise de compras agrupadas por fornecedor',
    icon: Building2,
    categoria: 'compras',
    cor: 'from-teal-500 to-teal-600',
    disponivel: true
  },
  {
    id: 'compras-produtos',
    titulo: 'Produtos Mais Comprados',
    descricao: 'Ranking dos produtos com maior volume de compras',
    icon: Package,
    categoria: 'compras',
    cor: 'from-cyan-500 to-cyan-600',
    disponivel: true
  },
  {
    id: 'compras-pendentes',
    titulo: 'Pedidos Pendentes',
    descricao: 'Status e análise de pedidos de compra pendentes',
    icon: Clock,
    categoria: 'compras',
    cor: 'from-yellow-500 to-yellow-600',
    disponivel: true
  }
];

export default function RelatoriosComprasPage() {
  return (
    <Layout>
      <RelatorioAreaBase
        areaId="compras"
        areaNome="Compras"
        areaIcon={ShoppingCart}
        areaCor="from-green-500 to-emerald-500"
        relatorios={relatoriosCompras}
      />
    </Layout>
  );
}


