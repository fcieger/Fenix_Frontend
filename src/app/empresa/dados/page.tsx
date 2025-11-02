'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useFeedback } from '@/contexts/feedback-context';
import { apiService } from '@/lib/api';
import { consultarCep, formatCep } from '@/lib/viacep-api';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  CheckCircle,
  Search,
  Loader2
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

// Funções de formatação
const formatCNPJ = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 14) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return value;
};

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length <= 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return value;
};

export default function EmpresaDadosPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, token } = useAuth();
  const { openSuccess } = useFeedback();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
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

  // Função para buscar CEP
  const handleCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return;
    }

    try {
      setSearchingCep(true);
      const cepData = await consultarCep(cleanCep);
      
      if (cepData) {
        setFormData(prev => ({
          ...prev,
          zipCode: formatCep(cepData.cep),
          address: cepData.logradouro || prev.address,
          city: cepData.localidade || prev.city,
          state: cepData.uf || prev.state
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setSearchingCep(false);
    }
  };

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
        const companyData = await apiService.getCompany(companyId, token);
        console.log('✅ Dados da empresa carregados:', companyData);
        
        // Parsear campos JSON se necessário (podem vir como string do banco)
        const parsedCompany = {
          ...companyData,
          address: typeof companyData.address === 'string' 
            ? JSON.parse(companyData.address) 
            : companyData.address || {},
          phones: typeof companyData.phones === 'string' 
            ? JSON.parse(companyData.phones) 
            : companyData.phones || [],
          emails: typeof companyData.emails === 'string' 
            ? JSON.parse(companyData.emails) 
            : companyData.emails || []
        };
        
        setCompany(parsedCompany);
        
        // Mapear os dados da empresa para o formulário
        const phone = parsedCompany.phones?.[0];
        const phoneFormatted = phone 
          ? formatPhone(`${phone.area || ''}${phone.number || ''}`)
          : '';
        
        const mappedData = {
          name: parsedCompany.name || '',
          cnpj: parsedCompany.cnpj ? formatCNPJ(parsedCompany.cnpj) : '',
          email: parsedCompany.emails?.[0]?.address || '',
          phone: phoneFormatted,
          address: parsedCompany.address?.street || '',
          city: parsedCompany.address?.city || '',
          state: parsedCompany.address?.state || '',
          zipCode: parsedCompany.address?.zip ? formatCep(parsedCompany.address.zip) : '',
          description: parsedCompany.mainActivity || ''
        };
        
        console.log('📝 Dados mapeados para o formulário:', mappedData);
        setFormData(mappedData);
      } catch (error: any) {
        console.error('❌ Erro ao carregar dados da empresa:', error);
        
        // Tratamento específico para diferentes tipos de erro
        if (error.status === 404 || error.message?.includes('não encontrado') || error.message?.includes('Cadastro não encontrado')) {
          setError('Empresa não encontrada. Por favor, verifique se você tem uma empresa cadastrada.');
        } else if (error.status === 401) {
          setError('Não autorizado. Por favor, faça login novamente.');
        } else {
          setError(`Erro ao carregar dados da empresa: ${error.message || 'Erro desconhecido'}`);
        }
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
      setError(null);
      
      // Preparar dados para envio
      const phoneClean = formData.phone.replace(/\D/g, '');
      const areaCode = phoneClean.substring(0, 2);
      const phoneNumber = phoneClean.substring(2);
      
      const updateData = {
        name: formData.name,
        cnpj: formData.cnpj.replace(/\D/g, ''),
        emails: formData.email ? [{ ownership: 'CORPORATE', address: formData.email }] : [],
        phones: formData.phone && phoneClean.length >= 10 ? [{ 
          type: 'LANDLINE', 
          area: areaCode, 
          number: phoneNumber 
        }] : [],
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zipCode.replace(/\D/g, '')
        },
        mainActivity: formData.description
      };

      console.log('🔄 Salvando dados da empresa:', updateData);

      // Atualizar dados da empresa via API usando apiService
      const updatedCompany = await apiService.updateCompany(company.id, updateData as any, token);
      console.log('✅ Dados salvos com sucesso:', updatedCompany);
      
      // Atualizar estado local
      setCompany(updatedCompany);
      setIsEditing(false);
      
      // Mostrar feedback de sucesso
      openSuccess({
        title: 'Dados salvos com sucesso!',
        message: 'As informações da empresa foram atualizadas.'
      });
    } catch (error: any) {
      console.error('Erro ao salvar dados da empresa:', error);
      setError(`Erro ao salvar dados: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Restaurar dados originais
    if (company) {
      // Parsear campos JSON se necessário
      const parsedCompany = {
        ...company,
        address: typeof company.address === 'string' 
          ? JSON.parse(company.address) 
          : company.address || {},
        phones: typeof company.phones === 'string' 
          ? JSON.parse(company.phones) 
          : company.phones || [],
        emails: typeof company.emails === 'string' 
          ? JSON.parse(company.emails) 
          : company.emails || []
      };
      
      const phone = parsedCompany.phones?.[0];
      const phoneFormatted = phone 
        ? formatPhone(`${phone.area || ''}${phone.number || ''}`)
        : '';
      
      setFormData({
        name: parsedCompany.name || '',
        cnpj: parsedCompany.cnpj ? formatCNPJ(parsedCompany.cnpj) : '',
        email: parsedCompany.emails?.[0]?.address || '',
        phone: phoneFormatted,
        address: parsedCompany.address?.street || '',
        city: parsedCompany.address?.city || '',
        state: parsedCompany.address?.state || '',
        zipCode: parsedCompany.address?.zip ? formatCep(parsedCompany.address.zip) : '',
        description: parsedCompany.mainActivity || ''
      });
    }
    setIsEditing(false);
    setError(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header moderno */}
        <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 text-white shadow-lg">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
                  <h1 className="text-2xl sm:text-3xl font-bold">Dados da Empresa</h1>
                  <p className="text-purple-100 mt-1 text-sm sm:text-base">Gerencie as informações da sua empresa</p>
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
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <X className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-6 sm:p-8">

                {/* Seção: Dados Gerais */}
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Dados Gerais</h2>
                      <p className="text-gray-600 text-sm">Informações básicas da empresa</p>
                    </div>
                  </div>
              
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-purple-500" />
                        Razão Social
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-11 rounded-lg border-gray-300 focus:ring-purple-500"
                          placeholder="Digite a razão social"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">{formData.name || 'Não informado'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnpj" className="text-gray-700 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-purple-500" />
                        CNPJ
                      </Label>
                      {isEditing ? (
                        <Input
                          id="cnpj"
                          type="text"
                          value={formData.cnpj}
                          onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                          className="h-11 rounded-lg border-gray-300 focus:ring-purple-500"
                          placeholder="00.000.000/0000-00"
                          maxLength={18}
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900 font-mono">{formData.cnpj || 'Não informado'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-purple-500" />
                        Email
                      </Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-11 rounded-lg border-gray-300 focus:ring-purple-500"
                          placeholder="contato@empresa.com"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">{formData.email || 'Não informado'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-purple-500" />
                        Telefone
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                          className="h-11 rounded-lg border-gray-300 focus:ring-purple-500"
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">{formData.phone || 'Não informado'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="text-gray-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                        CEP
                      </Label>
                      {isEditing ? (
                        <div className="relative">
                          <Input
                            id="zipCode"
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => {
                              const formatted = formatCep(e.target.value);
                              setFormData({ ...formData, zipCode: formatted });
                              if (formatted.replace(/\D/g, '').length === 8) {
                                handleCepSearch(formatted);
                              }
                            }}
                            className="h-11 rounded-lg border-gray-300 focus:ring-purple-500 pr-10"
                            placeholder="00000-000"
                            maxLength={9}
                          />
                          {searchingCep && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 animate-spin" />
                          )}
                          {!searchingCep && formData.zipCode && (
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900 font-mono">{formData.zipCode || 'Não informado'}</p>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address" className="text-gray-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                        Endereço
                      </Label>
                      {isEditing ? (
                        <Input
                          id="address"
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="h-11 rounded-lg border-gray-300 focus:ring-purple-500"
                          placeholder="Rua, Avenida, etc."
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">{formData.address || 'Não informado'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-gray-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                        Cidade
                      </Label>
                      {isEditing ? (
                        <Input
                          id="city"
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="h-11 rounded-lg border-gray-300 focus:ring-purple-500"
                          placeholder="Nome da cidade"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">{formData.city || 'Não informado'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-gray-700 flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-purple-500" />
                        Estado
                      </Label>
                      {isEditing ? (
                        <select
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                        >
                          <option value="">Selecione um estado</option>
                          {ESTADOS_BRASILEIROS.map((estado) => (
                            <option key={estado.value} value={estado.value}>
                              {estado.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">{formData.state || 'Não informado'}</p>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="description" className="text-gray-700 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-purple-500" />
                        Descrição da Empresa
                      </Label>
                      {isEditing ? (
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          className="rounded-lg border-gray-300 focus:ring-purple-500"
                          placeholder="Descreva sua empresa..."
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900 whitespace-pre-wrap">{formData.description || 'Não informado'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seção: Informações Adicionais */}
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Informações Adicionais</h2>
                      <p className="text-gray-600 text-sm">Detalhes complementares da empresa</p>
                    </div>
                  </div>
              
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-blue-500" />
                        Natureza Jurídica
                      </Label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900">{company?.nature || 'Não informado'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                        Porte da Empresa
                      </Label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900">{company?.size || 'Não informado'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                        Status
                      </Label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900">{company?.status || 'Não informado'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        Data de Fundação
                      </Label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900">
                          {company?.founded ? new Date(company.founded).toLocaleDateString('pt-BR') : 'Não informado'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-blue-500" />
                        Token da Empresa
                      </Label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900 font-mono text-sm break-all">{company?.token || 'Não informado'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        Última Atualização
                      </Label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900">
                          {company?.updatedAt ? new Date(company.updatedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Não informado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </Card>

            {/* Botões de ação fixos */}
            {isEditing && (
              <div className="fixed bottom-6 right-6 flex flex-col sm:flex-row gap-3 z-50">
                <Button
                  onClick={handleCancel}
                  disabled={saving}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Cancelar</span>
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
