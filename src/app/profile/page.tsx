'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  Building2,
  Clock,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Activity,
  TrendingUp,
  Users,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  companies: Array<{
    id: string;
    name: string;
    cnpj: string;
    isActive: boolean;
  }>;
}

// Interface para os usuários da empresa
interface CompanyUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  lastLogin: string | null;
}

interface UsersResponse {
  users: CompanyUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function PerfilPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Estados para a tabela de usuários
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearchTerm, setUsersSearchTerm] = useState('');
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 4, // Mostrar apenas 4 usuários na página de perfil
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    console.log('🔍 PerfilPage useEffect - isAuthenticated:', isAuthenticated, 'token:', token);

    if (!isAuthenticated) {
      console.log('❌ Usuário não autenticado, redirecionando para login');
      router.push('/login');
      return;
    }

    if (token) {
      console.log('✅ Token encontrado, carregando perfil...');
      loadUserProfile();
      loadCompanyUsers(); // Carregar usuários da empresa
    }
  }, [isAuthenticated, token, router]);

  const loadUserProfile = async () => {
    try {
      console.log('🔍 Carregando perfil com token:', token ? token.substring(0, 20) + '...' : 'null');
      setIsLoading(true);

      // Try using SDK service first
      try {
        const { getUserProfile } = await import('@/services/companies-users-service');
        const data = await getUserProfile();
        console.log('✅ Dados do perfil carregados:', data);
        setUser(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
        });
        return;
      } catch (sdkError) {
        console.warn('SDK service failed, falling back to API route:', sdkError);
      }

      // Fallback to API route
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Resposta da API:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dados do perfil carregados:', data);
        setUser(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
        });
      } else {
        console.error('❌ Erro ao carregar perfil:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
    } finally {
      console.log('🏁 Finalizando carregamento do perfil');
      setIsLoading(false);
    }
  };

  // Função para carregar usuários da empresa
  const loadCompanyUsers = async () => {
    try {
      setUsersLoading(true);

      // Try using SDK service first
      try {
        const { listCompanyUsers } = await import('@/services/companies-users-service');
        const response = await listCompanyUsers({
          page: usersCurrentPage,
          limit: 4,
          ...(usersSearchTerm && { search: usersSearchTerm })
        });

        const usersData = response.data || response;
        const users = Array.isArray(usersData) ? usersData : usersData?.users || [];
        const pagination = response.meta || response.pagination || { total: users.length, page: usersCurrentPage, limit: 4 };

        setCompanyUsers(users);
        setUsersPagination(pagination);
        return;
      } catch (sdkError) {
        console.warn('SDK service failed, falling back to API route:', sdkError);
      }

      // Fallback to API route
      const params = new URLSearchParams({
        page: usersCurrentPage.toString(),
        limit: '4', // Apenas 4 usuários na página de perfil
        ...(usersSearchTerm && { search: usersSearchTerm })
      });

      const response = await fetch(`/api/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: UsersResponse = await response.json();
        setCompanyUsers(data.users);
        setUsersPagination(data.pagination);
      } else {
        console.error('Erro ao carregar usuários da empresa');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários da empresa:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Recarregar usuários quando a busca ou página mudar
  useEffect(() => {
    if (token) {
      loadCompanyUsers();
    }
  }, [usersCurrentPage, usersSearchTerm, token]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUser(updatedProfile);
        setIsEditing(false);
        // Atualizar contexto de autenticação
        window.location.reload();
      } else {
        console.error('Erro ao salvar perfil');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrador':
        return 'bg-purple-100 text-purple-800';
      case 'Usuário':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando perfil...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <p className="text-gray-600">Erro ao carregar perfil</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header compacto */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Meu Perfil</h1>
            <p className="text-gray-600 text-sm">Gerencie suas informações pessoais e da empresa</p>
          </div>

          {/* Layout principal em 2 colunas */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Coluna esquerda - Informações Pessoais */}
            <div className="xl:col-span-2">
              <Card className="p-5 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="w-4 h-4 mr-2 text-purple-600" />
                    Informações Pessoais
                  </h2>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-xs font-medium text-gray-700">
                        Nome Completo
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1 text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 text-sm">{user.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-xs font-medium text-gray-700">
                        Email
                      </Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="mt-1 text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 flex items-center text-sm">
                          <Mail className="w-3 h-3 mr-2 text-gray-400" />
                          {user.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-xs font-medium text-gray-700">
                        Telefone
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="mt-1 text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 flex items-center text-sm">
                          <Phone className="w-3 h-3 mr-2 text-gray-400" />
                          {user.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-gray-700">
                        Status
                      </Label>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-2 pt-3 border-t">
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        disabled={saving}
                        size="sm"
                        className="text-xs"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-xs"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3 mr-1" />
                            Salvar
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Coluna direita - Avatar e Estatísticas */}
            <div className="xl:col-span-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Avatar e Informações Básicas */}
                <Card className="p-4 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </span>
                  </div>
                </Card>

                {/* Estatísticas */}
                <Card className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-purple-600" />
                    Estatísticas
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">Membro desde</span>
                      <span className="font-medium text-xs">{formatDate(user.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">Último acesso</span>
                      <span className="font-medium text-xs">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Primeiro acesso'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">Status</span>
                      <span className={`text-xs font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Segunda linha - Usuários da Empresa e Empresas */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
            {/* Usuários da Empresa */}
            <div className="xl:col-span-2">
              <Card className="p-5 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-purple-600" />
                    Usuários da Empresa
                  </h2>
                  <Button
                    onClick={() => router.push('/companies/usuarios')}
                    variant="outline"
                    size="sm"
                    className="flex items-center text-xs"
                  >
                    Ver todos
                  </Button>
                </div>

                {/* Busca compacta */}
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={usersSearchTerm}
                      onChange={(e) => setUsersSearchTerm(e.target.value)}
                      className="pl-8 text-sm h-8"
                    />
                  </div>
                </div>

                {/* Tabela compacta */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Função
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {usersLoading ? (
                        <tr>
                          <td colSpan={3} className="px-3 py-6 text-center">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                              <span className="text-gray-600 text-xs">Carregando...</span>
                            </div>
                          </td>
                        </tr>
                      ) : companyUsers.length > 0 ? (
                        companyUsers.slice(0, 4).map((companyUser) => (
                          <tr key={companyUser.id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-6 w-6">
                                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                                    <User className="h-3 w-3 text-purple-600" />
                                  </div>
                                </div>
                                <div className="ml-2">
                                  <div className="text-xs font-medium text-gray-900">
                                    {companyUser.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {companyUser.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(companyUser.role)}`}>
                                <Shield className="w-2 h-2 mr-1" />
                                {companyUser.role}
                              </span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                companyUser.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {companyUser.isActive ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-3 py-6 text-center text-gray-500 text-xs">
                            Nenhum usuário encontrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginação compacta */}
                {usersPagination.totalPages > 1 && (
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-gray-700">
                      {usersPagination.total} usuários
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        onClick={() => setUsersCurrentPage(usersCurrentPage - 1)}
                        disabled={!usersPagination.hasPrev}
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => setUsersCurrentPage(usersCurrentPage + 1)}
                        disabled={!usersPagination.hasNext}
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Empresas */}
            <div className="xl:col-span-1">
              <Card className="p-5 h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                  Empresas
                </h3>
                {user.companies && user.companies.length > 0 ? (
                  <div className="space-y-3">
                    {user.companies.map((company) => (
                      <div key={company.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{company.name}</p>
                            <p className="text-gray-500 text-xs">{company.cnpj}</p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            company.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {company.isActive ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhuma empresa associada</p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}