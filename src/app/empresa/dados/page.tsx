'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Edit,
  Save,
  X,
  Shield,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  User,
  Globe,
  Calendar,
  Users,
  CheckCircle
} from 'lucide-react';

export default function EmpresaDadosPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: 'Fenix Consultoria',
    fantasyName: 'Fenix',
    cnpj: '12.345.678/0001-90',
    email: 'contato@fenix.com.br',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    description: 'Sistema de gestão empresarial completo'
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
          <p className="text-purple-600 mt-4 font-medium">Carregando dados da empresa...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleSave = () => {
    console.log('Salvando dados da empresa:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
          <div className="px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold">Dados da Empresa</h1>
                  <p className="text-purple-100 mt-1">Gerencie as informações da sua empresa</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setIsAIAssistantOpen(true)}
                  className="bg-white text-purple-700 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  IA - Assistente
                </Button>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-purple-700 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-8">

                {/* Seção: Dados Gerais */}
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Dados Gerais</h2>
                      <p className="text-gray-600 text-sm">Informações básicas da empresa</p>
                    </div>
                  </div>
              
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Razão Social
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        />
                      ) : (
                        <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{formData.companyName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Fantasia
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.fantasyName}
                          onChange={(e) => setFormData({ ...formData, fantasyName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        />
                      ) : (
                        <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{formData.fantasyName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNPJ
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.cnpj}
                          onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        />
                      ) : (
                        <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{formData.cnpj}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        />
                      ) : (
                        <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{formData.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        />
                      ) : (
                        <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{formData.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CEP
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        />
                      ) : (
                        <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{formData.zipCode}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        />
                      ) : (
                        <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{formData.address}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        />
                      ) : (
                        <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{formData.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        >
                          <option value="SP">São Paulo</option>
                          <option value="RJ">Rio de Janeiro</option>
                          <option value="MG">Minas Gerais</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{formData.state}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição da Empresa
                      </label>
                      {isEditing ? (
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                          placeholder="Descreva sua empresa..."
                        />
                      ) : (
                        <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{formData.description}</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </Card>

            {/* Botões flutuantes */}
            {isEditing && (
              <div className="fixed bottom-8 right-8 flex flex-col space-y-3 z-50">
                <Button
                  onClick={handleCancel}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Cancelar</span>
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Salvar Alterações</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
