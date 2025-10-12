'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette,
  Database,
  Download,
  Upload,
  FileText,
  Key,
  Globe,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('geral');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profilePublic: false,
      showEmail: false,
      showPhone: false
    },
    appearance: {
      theme: 'light',
      language: 'pt-BR'
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30
    }
  });

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
          <p className="text-purple-600 mt-4 font-medium">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Settings },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'privacidade', label: 'Privacidade', icon: Shield },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'seguranca', label: 'Segurança', icon: Lock },
    { id: 'dados', label: 'Dados', icon: Database }
  ];

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da empresa
            </label>
            <input
              type="text"
              defaultValue="Fenix Consultoria"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuso horário
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
              <option value="America/New_York">Nova York (GMT-5)</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrações</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">API Externa</p>
                <p className="text-sm text-gray-500">Conectar com serviços externos</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Configurar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferências de Notificação</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Notificações por email</p>
              <p className="text-sm text-gray-500">Receber notificações importantes por email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Notificações push</p>
              <p className="text-sm text-gray-500">Receber notificações no navegador</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Notificações por SMS</p>
              <p className="text-sm text-gray-500">Receber alertas críticos por SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.sms}
                onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar Dados</h3>
        <p className="text-gray-600 mb-4">
          Baixe uma cópia dos seus dados em formato JSON ou CSV.
        </p>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar JSON</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Exportar CSV</span>
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Importar Dados</h3>
        <p className="text-gray-600 mb-4">
          Importe dados de outros sistemas para o Fenix.
        </p>
        <Button variant="outline" className="flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Selecionar arquivo</span>
        </Button>
      </Card>

      <Card className="p-6 border-red-200 bg-red-50">
        <h3 className="text-lg font-semibold text-red-900 mb-4">Zona de Perigo</h3>
        <p className="text-red-700 mb-4">
          Ações irreversíveis que podem afetar permanentemente seus dados.
        </p>
        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
          Excluir todos os dados
        </Button>
      </Card>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de navegação */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-100 text-purple-900'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            {activeTab === 'geral' && renderGeneralSettings()}
            {activeTab === 'notificacoes' && renderNotificationSettings()}
            {activeTab === 'dados' && renderDataSettings()}
            
            {activeTab === 'privacidade' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Privacidade</h3>
                <p className="text-gray-600">Configurações de privacidade em desenvolvimento...</p>
              </Card>
            )}
            
            {activeTab === 'aparencia' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Aparência</h3>
                <p className="text-gray-600">Configurações de aparência em desenvolvimento...</p>
              </Card>
            )}
            
            {activeTab === 'seguranca' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Segurança</h3>
                <p className="text-gray-600">Configurações de segurança em desenvolvimento...</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
