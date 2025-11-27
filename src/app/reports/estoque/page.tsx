'use client';

import Layout from '@/components/Layout';
import RelatorioAreaBase from '@/components/reports/RelatorioAreaBase';
import { Package, Activity, FileSpreadsheet, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';

const relatoriosEstoque = [
  {
    id: 'estoque-saldos',
    titulo: 'Saldos de Estoque',
    descricao: 'Saldo atual de todos os produtos',
    icon: Package,
    categoria: 'estoque',
    cor: 'from-indigo-500 to-indigo-600',
    disponivel: true
  },
  {
    id: 'estoque-movimentacoes',
    titulo: 'Movimentações de Estoque',
    descricao: 'Histórico completo de entradas e saídas',
    icon: Activity,
    categoria: 'estoque',
    cor: 'from-teal-500 to-teal-600',
    disponivel: true
  },
  {
    id: 'estoque-kardex',
    titulo: 'Kardex de Produtos',
    descricao: 'Movimentação detalhada por produto',
    icon: FileSpreadsheet,
    categoria: 'estoque',
    cor: 'from-blue-500 to-blue-600',
    disponivel: true
  },
  {
    id: 'estoque-valorizado',
    titulo: 'Estoque Valorizado',
    descricao: 'Valor total do estoque por produto',
    icon: DollarSign,
    categoria: 'estoque',
    cor: 'from-green-500 to-green-600',
    disponivel: true
  },
  {
    id: 'estoque-minimo',
    titulo: 'Produtos Abaixo do Mínimo',
    descricao: 'Alertas de produtos com estoque baixo',
    icon: AlertCircle,
    categoria: 'estoque',
    cor: 'from-red-500 to-red-600',
    disponivel: true,
    badge: 'Alerta'
  },
  {
    id: 'estoque-inventario',
    titulo: 'Inventários Realizados',
    descricao: 'Histórico de inventários e contagens',
    icon: CheckCircle2,
    categoria: 'estoque',
    cor: 'from-purple-500 to-purple-600',
    disponivel: true
  }
];

export default function RelatoriosEstoquePage() {
  return (
    <Layout>
      <RelatorioAreaBase
        areaId="estoque"
        areaNome="Estoque"
        areaIcon={Package}
        areaCor="from-indigo-500 to-purple-500"
        relatorios={relatoriosEstoque}
      />
    </Layout>
  );
}


