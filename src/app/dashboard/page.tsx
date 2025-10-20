'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  DollarSign,
  Users,
  Package,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  UserPlus,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const metrics = [
    {
      title: 'Total de Vendas',
      value: 'R$ 45.231',
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+12% vs mês anterior',
      trendUp: true
    },
    {
      title: 'Novos Clientes',
      value: '1.234',
      icon: Users,
      color: 'bg-blue-500',
      trend: '+8% vs mês anterior',
      trendUp: true
    },
    {
      title: 'Produtos Ativos',
      value: '567',
      icon: Package,
      color: 'bg-purple-500',
      trend: '+3% vs mês anterior',
      trendUp: true
    },
    {
      title: 'Taxa de Conversão',
      value: '3.2%',
      icon: BarChart3,
      color: 'bg-orange-500',
      trend: '-2% vs mês anterior',
      trendUp: false
    }
  ];

  const quickActions = [
    { label: 'Novo Cadastro', icon: UserPlus, color: 'text-blue-600', href: '/cadastros/novo' },
    { label: 'Novo Produto', icon: Package, color: 'text-green-600', href: '/produtos/novo' },
    { label: 'Nova Venda', icon: DollarSign, color: 'text-purple-600', href: '/vendas/novo' },
    { label: 'Relatórios', icon: BarChart3, color: 'text-orange-600', href: '/relatorios' }
  ];

  const recentActivities = [
    { action: 'Novo cadastro realizado', detail: 'Cliente: João Silva', time: '2 min atrás' },
    { action: 'Produto atualizado', detail: 'Produto: Notebook Dell', time: '15 min atrás' },
    { action: 'Venda realizada', detail: 'Valor: R$ 1.250', time: '1 hora atrás' },
    { action: 'Cadastro editado', detail: 'Cliente: Maria Santos', time: '2 horas atrás' },
    { action: 'Novo produto criado', detail: 'Produto: Mouse Gamer', time: '3 horas atrás' }
  ];

        return (
    <Layout>
          <div className="space-y-6">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 lg:p-8 text-white shadow-xl"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center">
                    <BarChart3 className="w-8 h-8 lg:w-10 lg:h-10 mr-3" />
                    Dashboard
                  </h1>
                  <p className="text-purple-100 text-sm lg:text-base">
                    Bem-vindo de volta! Aqui está um resumo do seu negócio.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/80 text-sm font-medium">Sistema ativo</span>
                </div>
              </div>
            </motion.div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 ${metric.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200`}>
                        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      {metric.trendUp ? (
                        <ArrowUpRight className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
                      )}
                    </div>
                    <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className="text-xs lg:text-sm text-gray-600 mb-2">{metric.title}</div>
                    <div className={`text-xs font-medium ${metric.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.trend}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Actions and Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
              {/* Quick Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(action.href)}
                        className="flex flex-col items-center p-3 lg:p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-2 group-hover:shadow-lg transition-all duration-200">
                          <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${action.color} group-hover:scale-110 transition-transform`} />
                        </div>
                        <span className="text-xs lg:text-sm font-medium text-gray-700 group-hover:text-purple-700 text-center">{action.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Recent Activities */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs lg:text-sm text-gray-600">{activity.detail}</p>
                      </div>
                      <div className="text-xs text-gray-500 flex-shrink-0">{activity.time}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6">
                  <button className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200">
                    Ver todas as atividades
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Sales Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Vendas dos Últimos 30 Dias</h3>
              </div>
              <div className="h-48 lg:h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="text-center">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 lg:w-10 lg:h-10 text-purple-500" />
                  </div>
                  <p className="text-sm lg:text-base text-gray-600 font-medium">Gráfico de vendas em desenvolvimento</p>
                  <p className="text-xs text-gray-500 mt-1">Em breve: visualizações interativas</p>
                </div>
              </div>
            </motion.div>
          </div>
    </Layout>
  );
}