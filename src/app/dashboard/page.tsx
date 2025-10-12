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
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Bem-vindo de volta! Aqui está um resumo do seu negócio.</p>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <Card key={index} className="p-6 bg-white border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${metric.color} rounded-full flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {metric.trendUp ? (
                        <ArrowUpRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className="text-sm text-gray-600 mb-2">{metric.title}</div>
                    <div className={`text-xs font-medium ${metric.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.trend}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions and Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Ações Rápidas</h3>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                    onClick={() => router.push(action.href)}
                        className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                      >
                        <Icon className={`w-8 h-8 ${action.color} mb-2 group-hover:scale-110 transition-transform`} />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Recent Activities */}
              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Atividades Recentes</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.detail}</p>
                      </div>
                      <div className="text-xs text-gray-500 flex-shrink-0">{activity.time}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                    Ver todas as atividades
                  </button>
                </div>
              </Card>
            </div>

            {/* Sales Chart */}
            <Card className="p-6 bg-white border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Vendas dos Últimos 30 Dias</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">Gráfico de vendas em desenvolvimento</p>
                </div>
              </div>
            </Card>
          </div>
    </Layout>
  );
}