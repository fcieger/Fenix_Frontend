'use client';

import Layout from '@/components/Layout';
import RelatorioAreaBase from '@/components/relatorios/RelatorioAreaBase';
import { FileText, X, Percent, FileSpreadsheet } from 'lucide-react';

const relatoriosFiscal = [
  {
    id: 'nfe-emitidas',
    titulo: 'NFes Emitidas',
    descricao: 'Relatório completo de notas fiscais emitidas',
    icon: FileText,
    categoria: 'fiscal',
    cor: 'from-red-500 to-red-600',
    disponivel: true
  },
  {
    id: 'nfe-canceladas',
    titulo: 'NFes Canceladas',
    descricao: 'Histórico de notas fiscais canceladas',
    icon: X,
    categoria: 'fiscal',
    cor: 'from-gray-500 to-gray-600',
    disponivel: true
  },
  {
    id: 'impostos-recolhidos',
    titulo: 'Impostos Recolhidos',
    descricao: 'Total de impostos por tipo e período',
    icon: Percent,
    categoria: 'fiscal',
    cor: 'from-orange-500 to-orange-600',
    disponivel: true
  },
  {
    id: 'sped-fiscal',
    titulo: 'SPED Fiscal',
    descricao: 'Arquivos SPED para entrega à Receita',
    icon: FileSpreadsheet,
    categoria: 'fiscal',
    cor: 'from-blue-500 to-blue-600',
    disponivel: false,
    badge: 'Em breve'
  }
];

export default function RelatoriosFiscalPage() {
  return (
    <Layout>
      <RelatorioAreaBase
        areaId="fiscal"
        areaNome="Fiscal"
        areaIcon={FileText}
        areaCor="from-red-500 to-orange-500"
        relatorios={relatoriosFiscal}
      />
    </Layout>
  );
}

