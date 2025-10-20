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
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCertificados();
    }
  }, [isAuthenticated]);

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

      // Validar tamanho mínimo (1KB)
      if (selectedFile.size < 1024) {
        setError('Arquivo muito pequeno. Verifique se é um certificado válido');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file || !password || !user?.companyId) {
      setError('Selecione um arquivo, digite a senha e certifique-se de que a empresa está selecionada');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('certificado', file);
    formData.append('companyId', user.companyId);
    formData.append('senha', password);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/v2certificado/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar certificado');
      }

      setSuccess('Certificado enviado com sucesso!');
      setFile(null);
      setPassword('');
      loadCertificados();
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar certificado');
    } finally {
      setLoading(false);
    }
  };

  const loadCertificados = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/v2certificado/meus-certificados`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setCertificados(data.certificados);
      }
    } catch (err) {
      console.error('Erro ao carregar certificados:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/v2certificado/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Certificado deletado com sucesso!');
        loadCertificados();
      } else {
        setError(data.message || 'Erro ao deletar certificado');
      }
    } catch (err) {
      setError('Erro ao deletar certificado');
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

        {/* Upload Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              Enviar Novo Certificado
            </CardTitle>
            <CardDescription>
              Selecione o arquivo do seu certificado digital (.pfx ou .p12) e digite a senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* File Upload */}
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

              {/* Password Input */}
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

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!file || !password || loading}
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
                    <span>Enviar Certificado</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

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
                        <Button
                          onClick={() => handleDelete(cert.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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