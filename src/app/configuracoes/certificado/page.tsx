'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { CertificadoService, CertificadoInfo } from '@/lib/api-certificado';
import { CertificadoUtils, CertificadoValidationResult } from '@/lib/certificado-utils';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Download,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Calendar,
  User,
  FileCheck,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';

export default function CertificadoDigitalPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [certificado, setCertificado] = useState<CertificadoInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Carregar certificado existente
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCertificado();
    }
  }, [isAuthenticated, user]);

  const loadCertificado = async () => {
    try {
      const response = await CertificadoService.getCertificado();
      setCertificado(response);
    } catch (error) {
      console.error('Erro ao carregar certificado:', error);
      setCertificado(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Primeiro: validar apenas o arquivo (sem senha)
    setIsUploading(true);
    setError('');

    try {
      console.log('🔍 Debug - Iniciando validação do arquivo:', { 
        fileName: file.name, 
        fileSize: file.size
      });

      // Validar apenas o arquivo (sem senha)
      const fileValidation = CertificadoUtils.validateFile(file);
      
      if (!fileValidation.isValid) {
        console.log('❌ Debug - Validação do arquivo falhou:', fileValidation.error);
        setError(fileValidation.error || 'Erro ao validar arquivo');
        return;
      }

      console.log('✅ Debug - Arquivo válido, aguardando senha...');
      
      // Armazenar o arquivo para validação posterior
      setSelectedFile(file);
      setSuccess('Arquivo selecionado com sucesso! Agora digite a senha do certificado.');
      
    } catch (error: any) {
      console.error('❌ Debug - Erro ao validar arquivo:', error);
      setError(error.message || 'Erro ao validar arquivo. Verifique o console para mais detalhes.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!selectedFile) {
      setError('Selecione um arquivo primeiro');
      return;
    }

    if (!password) {
      setError('Digite a senha do certificado');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      console.log('🔍 Debug - Iniciando validação completa:', { 
        fileName: selectedFile.name, 
        fileSize: selectedFile.size, 
        passwordLength: password.length 
      });

      // Validar e processar certificado no frontend
      const validationResult = await CertificadoUtils.validateCertificado(selectedFile, password);
      
      console.log('🔍 Debug - Resultado da validação:', validationResult);
      
      if (!validationResult.isValid) {
        console.log('❌ Debug - Validação falhou:', validationResult.error);
        setError(validationResult.error || 'Erro ao validar certificado');
        return;
      }

      if (!validationResult.info) {
        console.log('❌ Debug - Sem informações do certificado');
        setError('Erro ao extrair informações do certificado');
        return;
      }

      console.log('✅ Debug - Validação bem-sucedida, tentando upload...');

      // Fazer upload para o backend
      const response = await CertificadoService.uploadCertificado({
        arquivo: selectedFile,
        senha: password
      });
      setCertificado(response);
      setSuccess('Certificado validado e enviado com sucesso!');
      console.log('✅ Debug - Upload para backend bem-sucedido');
      
      // Limpar estado
      setPassword('');
      setSelectedFile(null);
      
      // Limpar input de arquivo
      const fileInput = document.getElementById('certificado-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      console.error('❌ Debug - Erro geral:', error);
      setError(error.message || 'Erro inesperado ao processar certificado. Verifique o console para mais detalhes.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCertificado = async () => {
    if (!confirm('Tem certeza que deseja remover o certificado digital?')) {
      return;
    }

    try {
      await CertificadoService.deleteCertificado();
      setCertificado(null);
      setSuccess('Certificado removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover certificado:', error);
      setError('Erro ao remover certificado. Tente novamente.');
    }
  };

  const handleVerificarCertificado = async () => {
    try {
      const response = await CertificadoService.verificarCertificado();
      setCertificado(response);
      setSuccess('Certificado verificado com sucesso!');
    } catch (error) {
      console.error('Erro ao verificar certificado:', error);
      setError('Erro ao verificar certificado. Tente novamente.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'text-green-600 bg-green-100 border-green-200';
      case 'expirado': return 'text-red-600 bg-red-100 border-red-200';
      case 'inativo': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo': return '🟢';
      case 'expirado': return '🔴';
      case 'inativo': return '⚪';
      default: return '⚪';
    }
  };

  const getDaysUntilExpiration = (validade: string) => {
    if (!certificado) return 0;
    const validadeDate = new Date(validade);
    const now = new Date();
    const diffTime = validadeDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'expirado': return 'Expirado';
      case 'inativo': return 'Inativo';
      default: return 'Desconhecido';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-purple-600 mt-4 font-medium">Carregando certificado...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
                <Shield className="w-8 h-8 lg:w-10 lg:h-10 mr-3" />
                Certificado Digital
              </h1>
              <p className="text-purple-100 text-sm lg:text-base">
                Gerencie seu certificado digital A1 para emissão de notas fiscais
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-sm font-medium">Sistema seguro</span>
            </div>
          </div>
        </motion.div>

        {/* Alertas */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-600 transition-colors p-1"
              title="Fechar erro"
            >
              <AlertCircle className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3 shadow-sm"
          >
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">{success}</span>
          </motion.div>
        )}

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload de Certificado */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Enviar Certificado</h2>
            </div>

            <div className="space-y-6">
              {/* Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Arquivo do Certificado (.pfx ou .p12)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group">
                  <div className="space-y-3 text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Upload className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="certificado-file"
                        className="relative cursor-pointer bg-white rounded-lg font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-500 px-4 py-2 border border-purple-200 hover:border-purple-300 transition-all duration-200"
                      >
                        <span>Selecionar arquivo</span>
                        <input
                          id="certificado-file"
                          name="certificado-file"
                          type="file"
                          accept=".pfx,.p12"
                          className="sr-only"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </label>
                      <p className="pl-3 self-center">ou arraste aqui</p>
                    </div>
                    <p className="text-xs text-gray-500">PFX, P12 até 5MB</p>
                  </div>
                </div>
              </div>

              {/* Arquivo Selecionado */}
              {selectedFile && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">{selectedFile.name}</p>
                      <p className="text-xs text-green-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPassword('');
                        const fileInput = document.getElementById('certificado-file') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="text-green-400 hover:text-green-600 transition-colors p-1"
                      title="Remover arquivo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Password Field - Só aparece se arquivo foi selecionado */}
              {selectedFile && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Senha do Certificado
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Digite a senha do certificado"
                      disabled={isUploading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                    <Lock className="h-3 w-3" />
                    <span>Senha será enviada de forma segura</span>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {!selectedFile ? (
                <button
                  onClick={() => document.getElementById('certificado-file')?.click()}
                  disabled={isUploading}
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Validando arquivo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Arquivo
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handlePasswordSubmit}
                  disabled={isUploading || !password}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Validando certificado...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Validar e Enviar Certificado
                    </>
                  )}
                </button>
              )}

              {/* Debug Buttons - Remover em produção */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setError('');
                    setSuccess('Teste: Simulando certificado válido');
                    setCertificado({
                      id: 'test-' + Date.now(),
                      nome: 'EMPRESA TESTE LTDA',
                      cnpj: '12.345.678/0001-90',
                      validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      tipo: 'A1',
                      status: 'ativo',
                      dataUpload: new Date().toISOString().split('T')[0],
                      ultimaVerificacao: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-medium transition-all duration-200"
                >
                  🧪 Teste (Simular Certificado)
                </button>
                
                <button
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setCertificado(null);
                    setPassword('');
                    setSelectedFile(null);
                    const fileInput = document.getElementById('certificado-file') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm font-medium transition-all duration-200"
                >
                  🗑️ Limpar Tudo
                </button>
              </div>
            </div>
          </motion.div>

          {/* Informações do Certificado */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Certificado Atual</h2>
            </div>

            {certificado ? (
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getStatusIcon(certificado.status)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(certificado.status)}`}>
                      {getStatusText(certificado.status)}
                    </span>
                  </div>
                </div>

                {/* Validade Info */}
                {certificado.status === 'ativo' && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Dias restantes</span>
                      <span className="text-lg font-bold text-blue-600">
                        {getDaysUntilExpiration(certificado.validade)} dias
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Válido até {formatDate(certificado.validade)}
                    </p>
                  </div>
                )}

                {/* Certificate Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{certificado.nome}</p>
                      <p className="text-xs text-gray-500">Razão Social</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{certificado.cnpj}</p>
                      <p className="text-xs text-gray-500">CNPJ</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{formatDate(certificado.validade)}</p>
                      <p className="text-xs text-gray-500">Validade</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                      <Lock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Certificado {certificado.tipo}</p>
                      <p className="text-xs text-gray-500">Tipo</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeleteCertificado}
                      className="flex-1 bg-red-50 text-red-700 py-3 px-4 rounded-xl hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center font-medium transition-all duration-200 border border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </button>
                    <button
                      onClick={handleVerificarCertificado}
                      className="flex-1 bg-gray-50 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center font-medium transition-all duration-200 border border-gray-200 hover:border-gray-300"
                    >
                      <FileCheck className="h-4 w-4 mr-2" />
                      Verificar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum certificado</h3>
                <p className="text-sm text-gray-500">
                  Envie um certificado digital para começar
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Security Features */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900">Segurança e Privacidade</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-100">
              <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Transmissão Segura</p>
                <p className="text-xs text-blue-600">HTTPS protegido</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-100">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Arquivo Seguro</p>
                <p className="text-xs text-blue-600">Armazenamento seguro</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-100">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                <Globe className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Acesso Restrito</p>
                <p className="text-xs text-blue-600">Apenas sua empresa</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-100">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">NF-e Integrada</p>
                <p className="text-xs text-blue-600">Emissão automática</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}