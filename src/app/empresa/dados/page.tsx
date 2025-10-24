'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiService } from '@/lib/api';
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
  User,
  Globe,
  Calendar,
  Users,
  CheckCircle
} from 'lucide-react';

// Lista completa de estados brasileiros
const ESTADOS_BRASILEIROS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

export default function EmpresaDadosPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    description: ''
  });

  useEffect(() => {
    // Remover redirecionamento automático por enquanto
    console.log('🔐 Estado de autenticação:', { authLoading, isAuthenticated, user: !!user });
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const loadCompanyData = async () => {
      console.log('🔄 loadCompanyData iniciado - carregando dados da API...');
      
      try {
        setLoading(true);
        
        if (!token || !user?.companies?.[0]?.id) {
          console.error('❌ Token ou company ID não encontrado');
          setError('Dados de autenticação não encontrados');
          return;
        }

        const companyId = user.companies[0].id;
        console.log('🔍 Buscando dados da empresa ID:', companyId);
        
        // Buscar dados da empresa via API usando apiService
        const companyData = await apiService.getCadastro(companyId, token);
        console.log('✅ Dados da empresa carregados:', companyData);
        
        setCompany(companyData);
        
        // Mapear os dados da empresa para o formulário
        const mappedData = {
          name: companyData.name || '',
          cnpj: companyData.cnpj || '',
          email: companyData.emails?.[0]?.address || '',
          phone: companyData.phones?.[0] ? `${companyData.phones[0].area} ${companyData.phones[0].number}` : '',
          address: companyData.address?.street || '',
          city: companyData.address?.city || '',
          state: companyData.address?.state || '',
          zipCode: companyData.address?.zip || '',
          description: companyData.mainActivity || ''
        };
        
        console.log('📝 Dados mapeados para o formulário:', mappedData);
        setFormData(mappedData);
      } catch (error) {
        console.error('❌ Erro ao carregar dados da empresa:', error);
        setError(`Erro ao carregar dados da empresa: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Carregar dados apenas se estiver autenticado
    if (isAuthenticated && !authLoading) {
      loadCompanyData();
    }
  }, [isAuthenticated, authLoading, token, user]);

  // Debug: Mostrar informações de estado
  console.log('🔍 Estado atual da página:', {
    authLoading,
    loading,
    isAuthenticated,
    user: !!user,
    token: !!token,
    company: !!company
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">Carregando dados da empresa...</p>
          <p className="text-gray-500 mt-2 text-sm">
            loading: {loading.toString()}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Usuário não autenticado</p>
          <p className="text-gray-500 mt-2">
            isAuthenticated: {isAuthenticated.toString()}, user: {user ? 'presente' : 'ausente'}
          </p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!company || !token) return;

    try {
      setSaving(true);
      
      // Preparar dados para envio
      const updateData = {
        name: formData.name,
        cnpj: formData.cnpj,
        emails: formData.email ? [{ ownership: 'CORPORATE', address: formData.email }] : [],
        phones: formData.phone ? [{ type: 'LANDLINE', area: formData.phone.split(' ')[0] || '', number: formData.phone.split(' ').slice(1).join(' ') || formData.phone }] : [],
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zipCode
        },
        mainActivity: formData.description
      };

      console.log('🔄 Salvando dados da empresa:', updateData);

      // Atualizar dados da empresa via API usando apiService
      const updatedCompany = await apiService.updateCadastro(company.id, updateData as any, token);
      console.log('✅ Dados salvos com sucesso:', updatedCompany);
      
      // Atualizar estado local
      setCompany(updatedCompany);
      setIsEditing(false);
      
      console.log('Dados da empresa salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar dados da empresa:', error);
      setError(`Erro ao salvar dados: ${error.message}`);
    } finally {
      setSaving(false);
    }
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
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        />
                      ) : (
                        <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{formData.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Fantasia
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                          placeholder="Nome fantasia da empresa"
                        />
                      ) : (
                        <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{formData.name || 'Não informado'}</p>
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
                          <option value="">Selecione um estado</option>
                          {ESTADOS_BRASILEIROS.map((estado) => (
                            <option key={estado.value} value={estado.value}>
                              {estado.label}
                            </option>
                          ))}
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

                {/* Seção: Informações Adicionais */}
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Informações Adicionais</h2>
                      <p className="text-gray-600 text-sm">Detalhes complementares da empresa</p>
                    </div>
                  </div>
              
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Natureza Jurídica
                      </label>
                      <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{company?.nature || 'Não informado'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Porte da Empresa
                      </label>
                      <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{company?.size || 'Não informado'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">{company?.status || 'Não informado'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Fundação
                      </label>
                      <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">
                        {company?.founded ? new Date(company.founded).toLocaleDateString('pt-BR') : 'Não informado'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Token da Empresa
                      </label>
                      <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl font-mono text-sm">{company?.token || 'Não informado'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Última Atualização
                      </label>
                      <p className="text-gray-900 py-3 px-4 bg-gray-50 rounded-xl">
                        {company?.updatedAt ? new Date(company.updatedAt).toLocaleDateString('pt-BR') : 'Não informado'}
                      </p>
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
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
