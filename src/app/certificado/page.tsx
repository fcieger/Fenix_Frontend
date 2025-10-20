'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Upload, Shield, FileText, Lock, CheckCircle, AlertCircle, X } from 'lucide-react';

interface FileInfo {
  nome: string;
  tamanho: string;
  tipo: string;
}

interface Certificado {
  id: string;
  nomeRazaoSocial: string;
  cnpj: string;
  validade: string;
  tipo: string;
  status: string;
  nomeArquivo: string;
  tamanhoArquivo: string;
  dataUpload: string;
  observacoes?: string;
}

export default function CertificadoPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<'upload' | 'password' | 'success'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [certificado, setCertificado] = useState<Certificado | null>(null);
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validar tipo de arquivo
      if (!selectedFile.name.endsWith('.pfx') && !selectedFile.name.endsWith('.p12')) {
        setError('Formato inválido. Use apenas arquivos .pfx ou .p12');
        return;
      }

      // Validar tamanho (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Arquivo muito grande. Máximo 10MB');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file || !user?.companyId) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('certificado', file);
      formData.append('companyId', user.companyId);

      const response = await fetch('/api/v2certificado/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        setFileInfo(data.fileInfo);
        setStep('password');
        setSuccess('Arquivo carregado com sucesso!');
      } else {
        setError(data.message || 'Erro ao fazer upload');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async () => {
    if (!sessionId || !password) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v2certificado/submit-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId,
          senha: password
        })
      });

      const data = await response.json();

      if (data.success) {
        setCertificado(data.certificado);
        setStep('success');
        setSuccess('Certificado A1 processado com sucesso!');
        loadCertificados();
      } else {
        setError(data.message || 'Erro ao processar certificado');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadCertificados = async () => {
    try {
      const response = await fetch('/api/v2certificado/meus-certificados', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCertificados(data.certificados);
      }
    } catch (err) {
      console.error('Erro ao carregar certificados:', err);
    }
  };

  const resetForm = () => {
    setStep('upload');
    setFile(null);
    setFileInfo(null);
    setSessionId('');
    setPassword('');
    setError('');
    setSuccess('');
    setCertificado(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'text-green-600 bg-green-100';
      case 'pendente': return 'text-yellow-600 bg-yellow-100';
      case 'expirado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Certificado Digital A1</h1>
              <p className="text-gray-600">Envie e gerencie seus certificados digitais</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center space-x-2 ${step === 'upload' ? 'text-blue-600' : step === 'password' || step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-blue-600 text-white' : step === 'password' || step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                <Upload className="h-4 w-4" />
              </div>
              <span className="font-medium">1. Upload</span>
            </div>
            <div className={`w-16 h-0.5 ${step === 'password' || step === 'success' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center space-x-2 ${step === 'password' ? 'text-blue-600' : step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'password' ? 'bg-blue-600 text-white' : step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                <Lock className="h-4 w-4" />
              </div>
              <span className="font-medium">2. Senha</span>
            </div>
            <div className={`w-16 h-0.5 ${step === 'success' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center space-x-2 ${step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="font-medium">3. Concluído</span>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="h-4 w-4 text-red-600" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="h-4 w-4 text-green-600" />
            </button>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecione o arquivo do certificado</h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pfx,.p12"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center space-y-2 text-gray-600 hover:text-blue-600"
                >
                  <FileText className="h-12 w-12" />
                  <span className="text-lg font-medium">Clique para selecionar o arquivo</span>
                  <span className="text-sm">Formatos aceitos: .pfx, .p12 (máximo 10MB)</span>
                </button>
              </div>

              {file && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Enviar Arquivo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Password */}
        {step === 'password' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informe a senha do certificado</h2>
            
            {fileInfo && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{fileInfo.nome}</p>
                    <p className="text-sm text-gray-600">{fileInfo.tamanho} • {fileInfo.tipo}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha do Certificado
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha do certificado"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmitPassword}
                  disabled={!password || loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Processar Certificado</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && certificado && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Certificado Processado!</h2>
              <p className="text-gray-600">Seu certificado A1 foi salvo com sucesso.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Informações do Certificado</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Empresa:</span>
                  <span className="font-medium">{certificado.nomeRazaoSocial}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CNPJ:</span>
                  <span className="font-medium">{certificado.cnpj}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Validade:</span>
                  <span className="font-medium">{formatDate(certificado.validade)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{certificado.tipo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(certificado.status)}`}>
                    {certificado.status}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
            >
              Enviar Outro Certificado
            </button>
          </div>
        )}

        {/* Meus Certificados */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Meus Certificados</h2>
            <button
              onClick={loadCertificados}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Atualizar
            </button>
          </div>

          {certificados.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum certificado encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {certificados.map((cert) => (
                <div key={cert.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{cert.nomeRazaoSocial}</p>
                        <p className="text-sm text-gray-600">{cert.cnpj}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                        {cert.status}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{formatDate(cert.dataUpload)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
