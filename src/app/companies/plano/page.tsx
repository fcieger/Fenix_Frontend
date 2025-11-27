'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Users,
  Building2,
  Shield,
  FileText,
  TrendingUp,
  AlertCircle,
  Loader2,
  Crown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  limits: {
    users: number | 'unlimited';
    companies: number | 'unlimited';
    storage: string;
    support: string;
  };
  popular?: boolean;
  color: string;
}

const availablePlans: Plan[] = [
  {
    id: 'basico',
    name: 'Básico',
    description: 'Perfeito para pequenas empresas',
    price: 29,
    period: '/mês',
    color: 'from-gray-500 to-gray-600',
    features: [
      'Gestão de produtos',
      'Controle de vendas',
      'Relatórios básicos',
      'Suporte por email',
      'API básica'
    ],
    limits: {
      users: 5,
      companies: 1,
      storage: '2GB',
      support: 'Email'
    }
  },
  {
    id: 'profissional',
    name: 'Profissional',
    description: 'Ideal para empresas em crescimento',
    price: 79,
    period: '/mês',
    color: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      'Todas as funcionalidades do Básico',
      'IA integrada',
      'Relatórios avançados',
      'API completa',
      'Integrações',
      'Suporte prioritário',
      'Backup automático'
    ],
    limits: {
      users: 20,
      companies: 3,
      storage: '10GB',
      support: 'Prioritário'
    }
  },
  {
    id: 'empresarial',
    name: 'Empresarial',
    description: 'Para grandes operações',
    price: 149,
    period: '/mês',
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Todas as funcionalidades do Profissional',
      'IA avançada',
      'Integrações customizadas',
      'Suporte dedicado',
      'Treinamento incluído',
      'Consultoria especializada'
    ],
    limits: {
      users: 'unlimited',
      companies: 'unlimited',
      storage: 'Ilimitado',
      support: 'Dedicado'
    }
  }
];

export default function EmpresaPlanoPage() {
  const router = useRouter();
  const { user, activeCompanyId, isLoading } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [renewalDate, setRenewalDate] = useState<string | null>(null);
  const [planStatus, setPlanStatus] = useState<'active' | 'expired' | 'trial'>('active');

  useEffect(() => {
    // Simular carregamento do plano atual
    // Em produção, isso viria da API
    const loadPlan = async () => {
      setLoading(true);
      try {
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Por enquanto, vamos usar o plano profissional como padrão
        // Em produção, buscar da API baseado no activeCompanyId
        setCurrentPlan(availablePlans.find(p => p.id === 'profissional') || null);
        setRenewalDate('2024-12-31');
        setPlanStatus('active');
      } catch (error) {
        console.error('Erro ao carregar plano:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      loadPlan();
    }
  }, [isLoading, activeCompanyId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = () => {
    switch (planStatus) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full">
            <CheckCircle className="w-3 h-3 mr-1 inline" />
            Ativo
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full">
            <XCircle className="w-3 h-3 mr-1 inline" />
            Expirado
          </Badge>
        );
      case 'trial':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1 rounded-full">
            <AlertCircle className="w-3 h-3 mr-1 inline" />
            Período de Teste
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <p className="text-purple-600 font-medium">Carregando informações do plano...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header moderno */}
        <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 text-white shadow-lg rounded-2xl">
          <div className="px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
                    <CreditCard className="w-8 h-8 mr-3" />
                    Plano e Assinatura
                  </h1>
                  <p className="text-purple-100 mt-1 text-sm sm:text-base">Gerencie seu plano e recursos disponíveis</p>
                </div>
              </div>
              {getStatusBadge()}
            </div>
          </div>
        </div>

        {/* Plano Atual */}
        {currentPlan && (
          <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className={`bg-gradient-to-r ${currentPlan.color} text-white p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Plano Atual</h2>
                    <p className="text-white/90 text-sm mt-1">{currentPlan.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    R$ {currentPlan.price.toFixed(2)}
                  </div>
                  <div className="text-white/80 text-sm">{currentPlan.period}</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Usuários</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentPlan.limits.users === 'unlimited' ? 'Ilimitado' : currentPlan.limits.users}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Empresas</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentPlan.limits.companies === 'unlimited' ? 'Ilimitado' : currentPlan.limits.companies}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Armazenamento</p>
                    <p className="text-lg font-semibold text-gray-900">{currentPlan.limits.storage}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Shield className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Suporte</p>
                    <p className="text-lg font-semibold text-gray-900">{currentPlan.limits.support}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                  Recursos Incluídos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {renewalDate && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm">Próxima renovação:</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatDate(renewalDate)}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Outros Planos Disponíveis */}
        <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
              Outros Planos Disponíveis
            </h2>
            <p className="text-gray-600 text-sm mt-1">Escolha o plano ideal para suas necessidades</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePlans.map((plan) => {
                const isCurrentPlan = currentPlan?.id === plan.id;
                return (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden transition-all duration-300 ${
                      plan.popular
                        ? 'border-2 border-purple-500 shadow-xl scale-105'
                        : 'border border-gray-200 hover:shadow-lg'
                    } ${isCurrentPlan ? 'ring-2 ring-purple-300' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600" />
                    )}
                    {isCurrentPlan && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-purple-600 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Atual
                        </Badge>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                        <div className="flex items-baseline justify-center">
                          <span className="text-2xl font-bold text-gray-900">R$</span>
                          <span className={`text-4xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                            {plan.price}
                          </span>
                          <span className="text-gray-600 ml-1">{plan.period}</span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Usuários</span>
                          <span className="font-semibold text-gray-900">
                            {plan.limits.users === 'unlimited' ? 'Ilimitado' : plan.limits.users}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Empresas</span>
                          <span className="font-semibold text-gray-900">
                            {plan.limits.companies === 'unlimited' ? 'Ilimitado' : plan.limits.companies}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Armazenamento</span>
                          <span className="font-semibold text-gray-900">{plan.limits.storage}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Suporte</span>
                          <span className="font-semibold text-gray-900">{plan.limits.support}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        className={`w-full ${
                          isCurrentPlan
                            ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                            : plan.popular
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                        disabled={isCurrentPlan}
                      >
                        {isCurrentPlan ? 'Plano Atual' : 'Trocar para este plano'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Informações de Billing */}
        <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <CreditCard className="w-6 h-6 mr-2 text-purple-600" />
              Informações de Pagamento
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Forma de Pagamento</p>
                  <p className="font-semibold text-gray-900 mt-1">Cartão de Crédito</p>
                </div>
                <Button variant="outline" size="sm">
                  Alterar
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Próximo Pagamento</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {renewalDate ? formatDate(renewalDate) : 'Não disponível'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

