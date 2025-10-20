'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { Upload, Shield, FileText, Lock, CheckCircle, AlertCircle, X, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
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
          <p className="text-purple-600 mt-4 font-medium">Carregando certificados...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

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
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                Selecione o arquivo do certificado
              </CardTitle>
              <CardDescription>
                Formatos aceitos: .pfx, .p12 (máximo 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pfx,.p12"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center space-y-2 text-gray-600 hover:text-purple-600"
                  >
                    <FileText className="h-12 w-12" />
                    <span className="text-lg font-medium">Clique para selecionar o arquivo</span>
                    <span className="text-sm">Formatos aceitos: .pfx, .p12 (máximo 10MB)</span>
                  </button>
                </div>

                {file && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900">{file.name}</p>
                        <p className="text-sm text-green-700">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      <span>Enviar Arquivo</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Password */}
        {step === 'password' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                Informe a senha do certificado
              </CardTitle>
              <CardDescription>
                O arquivo foi carregado com sucesso. Agora digite a senha para processá-lo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fileInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">{fileInfo.nome}</p>
                      <p className="text-sm text-blue-700">{fileInfo.tamanho} • {fileInfo.tipo}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Senha do Certificado</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha do certificado"
                    className="mt-1"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmitPassword}
                    disabled={!password || loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        <span>Processar Certificado</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === 'success' && certificado && (
          <Card className="mb-6">
            <CardHeader>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Certificado Processado!</CardTitle>
                <CardDescription>Seu certificado A1 foi salvo com sucesso.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-green-900 mb-3">Informações do Certificado</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Empresa:</span>
                    <span className="font-medium text-green-900">{certificado.nomeRazaoSocial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">CNPJ:</span>
                    <span className="font-medium text-green-900">{certificado.cnpj}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Validade:</span>
                    <span className="font-medium text-green-900">{formatDate(certificado.validade)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Tipo:</span>
                    <span className="font-medium text-green-900">{certificado.tipo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(certificado.status)}`}>
                      {certificado.status}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={resetForm}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Enviar Outro Certificado
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Meus Certificados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Meus Certificados
              </CardTitle>
              <Button
                onClick={loadCertificados}
                variant="outline"
                size="sm"
              >
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {certificados.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum certificado encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {certificados.map((cert) => (
                  <div key={cert.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-8 w-8 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">{cert.nomeRazaoSocial}</p>
                          <p className="text-sm text-gray-600">{cert.cnpj}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                            {cert.status}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">{formatDate(cert.dataUpload)}</p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso removerá permanentemente o certificado de {cert.nomeRazaoSocial}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(cert.id)}>
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
