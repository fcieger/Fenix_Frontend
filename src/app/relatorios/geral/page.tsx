'use client';

import Layout from '@/components/Layout';
import RelatorioAreaBase from '@/components/relatorios/RelatorioAreaBase';
import { BarChart3, Users, Building2, Package, PieChart } from 'lucide-react';

const relatoriosGeral = [
  {
    id: 'clientes',
    titulo: 'Relatório de Clientes',
    descricao: 'Análise completa de clientes e histórico',
    icon: Users,
    categoria: 'geral',
    cor: 'from-pink-500 to-pink-600',
    disponivel: true
  },
  {
    id: 'fornecedores',
    titulo: 'Relatório de Fornecedores',
    descricao: 'Análise de fornecedores e compras',
    icon: Building2,
    categoria: 'geral',
    cor: 'from-teal-500 to-teal-600',
    disponivel: true
  },
  {
    id: 'produtos',
    titulo: 'Catálogo de Produtos',
    descricao: 'Relatório completo do catálogo',
    icon: Package,
    categoria: 'geral',
    cor: 'from-indigo-500 to-indigo-600',
    disponivel: true
  },
  {
    id: 'dashboard-consolidado',
    titulo: 'Dashboard Consolidado',
    descricao: 'Visão geral de todas as áreas do sistema',
    icon: PieChart,
    categoria: 'geral',
    cor: 'from-purple-500 to-purple-600',
    disponivel: true
  }
];

export default function RelatoriosGeralPage() {
  return (
    <Layout>
      <RelatorioAreaBase
        areaId="geral"
        areaNome="Geral"
        areaIcon={BarChart3}
        areaCor="from-gray-500 to-slate-500"
        relatorios={relatoriosGeral}
      />
    </Layout>
  );
}



