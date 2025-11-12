'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { 
  ShoppingCart,
  DollarSign,
  Package,
  FileText,
  Store,
  BarChart3,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const areasRelatorios = [
  {
    id: 'vendas',
    nome: 'Vendas',
    descricao: 'Análise de vendas, clientes e performance de vendedores',
    icon: ShoppingCart,
    cor: 'from-blue-500 to-cyan-500',
    href: '/relatorios/vendas',
    quantidade: 5
  },
  {
    id: 'compras',
    nome: 'Compras',
    descricao: 'Relatórios de compras, fornecedores e pedidos',
    icon: ShoppingCart,
    cor: 'from-green-500 to-emerald-500',
    href: '/relatorios/compras',
    quantidade: 4
  },
  {
    id: 'financeiro',
    nome: 'Financeiro',
    descricao: 'Fluxo de caixa, DRE e análises financeiras',
    icon: DollarSign,
    cor: 'from-purple-500 to-pink-500',
    href: '/relatorios/financeiro',
    quantidade: 6
  },
  {
    id: 'estoque',
    nome: 'Estoque',
    descricao: 'Saldos, movimentações e inventários',
    icon: Package,
    cor: 'from-indigo-500 to-purple-500',
    href: '/relatorios/estoque',
    quantidade: 6
  },
  {
    id: 'fiscal',
    nome: 'Fiscal',
    descricao: 'NFes emitidas, impostos e SPED',
    icon: FileText,
    cor: 'from-red-500 to-orange-500',
    href: '/relatorios/fiscal',
    quantidade: 4
  },
  {
    id: 'caixa',
    nome: 'Frente de Caixa',
    descricao: 'Vendas do PDV e performance de operadores',
    icon: Store,
    cor: 'from-cyan-500 to-blue-500',
    href: '/relatorios/caixa',
    quantidade: 4
  },
  {
    id: 'geral',
    nome: 'Geral',
    descricao: 'Clientes, fornecedores e catálogo de produtos',
    icon: BarChart3,
    cor: 'from-gray-500 to-slate-500',
    href: '/relatorios/geral',
    quantidade: 4
  }
];

export default function RelatoriosPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg">
                <BarChart3 className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  Central de Relatórios
                </h1>
                <p className="text-gray-600 text-lg">
                  Escolha uma área para visualizar relatórios detalhados
                </p>
              </div>
            </div>
          </motion.div>

          {/* Grid de Áreas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areasRelatorios.map((area, index) => {
              const Icon = area.icon;
              
              return (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="group relative overflow-hidden p-8 hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-purple-300 cursor-pointer"
                    onClick={() => router.push(area.href)}
                  >
                    {/* Background Gradient ao Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${area.cor} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                    
                    {/* Badge de Quantidade */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 text-xs font-bold bg-purple-100 text-purple-800 rounded-full">
                        {area.quantidade} relatórios
                      </span>
                    </div>

                    {/* Ícone */}
                    <div className={`mb-6 p-5 rounded-2xl bg-gradient-to-r ${area.cor} text-white w-fit shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    
                    {/* Conteúdo */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                      {area.nome}
                    </h3>
                    <p className="text-gray-600 mb-6 min-h-[48px]">
                      {area.descricao}
                    </p>
                    
                    {/* Botão */}
                    <div className="flex items-center justify-between text-purple-600 font-semibold group-hover:text-purple-700">
                      <span>Ver Relatórios</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Info adicional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
              <p className="text-gray-700">
                💡 <strong>Dica:</strong> Cada área possui filtros específicos para análises mais detalhadas e exportação em PDF.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
