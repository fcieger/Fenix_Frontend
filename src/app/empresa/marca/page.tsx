'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useCompanyLogo } from '@/hooks/useCompanyLogo';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Shield,
  FileImage,
  Download,
  Save,
  X,
  RefreshCw
} from 'lucide-react';

export default function EmpresaMarcaPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const { logo, updateLogo } = useCompanyLogo();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Carregar logo atual
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentLogo(logo);
    }
  }, [isAuthenticated, logo]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);
    setSuccess(null);

    // Validar tipo de arquivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato de arquivo não suportado. Use PNG, JPG ou GIF.');
      return;
    }

    // Validar tamanho (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Arquivo muito grande. Tamanho máximo: 2MB.');
      return;
    }

    // Criar preview da imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      const logoData = e.target?.result as string;
      console.log('🖼️ Logo carregada:', logoData ? 'Sim' : 'Não');
      setCurrentLogo(logoData);
      
      // Atualizar logo no hook (que será exibida no header)
      console.log('🔄 Atualizando logo no hook...');
      updateLogo(logoData);
      console.log('✅ Logo atualizada no hook');
    };
    reader.readAsDataURL(file);

    // Simular upload (TODO: implementar upload real)
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSuccess('Logo carregada! Clique em "Salvar" para confirmar.');
    }, 2000);
  };

  const removeLogo = () => {
    setCurrentLogo(null);
    setError(null);
    setSuccess(null);
    
    // Remover logo do hook (que será removida do header)
    updateLogo(null);
  };

  const downloadLogo = () => {
    if (currentLogo) {
      const link = document.createElement('a');
      link.href = currentLogo;
      link.download = 'logo-empresa.png';
      link.click();
    }
  };

  const handleSave = async () => {
    if (!currentLogo) {
      setError('Nenhuma logo para salvar');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implementar salvamento real no backend
      // Por enquanto, apenas confirma que a logo já foi salva no localStorage
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Logo salva com sucesso!');
      console.log('✅ Logo salva:', currentLogo ? 'Sim' : 'Não');
    } catch (error) {
      setError('Erro ao salvar a logo. Tente novamente.');
      console.error('❌ Erro ao salvar logo:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentLogo && !logo) {
      setError('Nenhuma logo para excluir');
      return;
    }

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implementar exclusão real no backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentLogo(null);
      updateLogo(null);
      setSuccess('Logo excluída com sucesso!');
      console.log('🗑️ Logo excluída');
    } catch (error) {
      setError('Erro ao excluir a logo. Tente novamente.');
      console.error('❌ Erro ao excluir logo:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => router.back()}
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white">Marca da Empresa</h1>
                  <p className="text-purple-100 mt-1">Gerencie a identidade visual da sua empresa</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-white/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Card de Upload */}
            <Card className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Logo da Empresa</h2>
                <p className="text-gray-600 mb-8">
                  Faça upload da logo da sua empresa. Esta imagem será usada em relatórios e outras áreas do sistema.
                </p>

                {/* Área de Upload */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-200 ${
                    dragActive
                      ? 'border-purple-500 bg-purple-50'
                      : currentLogo
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-purple-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.gif"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />

                  {currentLogo ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={currentLogo}
                          alt="Logo da empresa"
                          className="max-h-32 max-w-64 object-contain rounded-lg shadow-lg"
                        />
                        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-green-600 font-medium">Logo carregada com sucesso!</p>
                        <div className="flex justify-center space-x-3">
                          <Button
                            onClick={downloadLogo}
                            variant="outline"
                            size="sm"
                            className="text-purple-600 border-purple-300 hover:bg-purple-50"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Baixar
                          </Button>
                          <Button
                            onClick={removeLogo}
                            variant="outline"
                            size="sm"
                            className="text-gray-600 border-gray-300 hover:bg-gray-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Remover Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {uploading ? (
                        <div className="space-y-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                          <p className="text-purple-600 font-medium">Enviando logo...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900">
                              Arraste e solte sua logo aqui
                            </p>
                            <p className="text-gray-500 mt-1">
                              ou clique para selecionar um arquivo
                            </p>
                          </div>
                          <div className="text-sm text-gray-400">
                            <p>Formatos aceitos: PNG, JPG, GIF</p>
                            <p>Tamanho máximo: 2MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Mensagens de erro/sucesso */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <p className="text-green-700">{success}</p>
                  </div>
                )}

                {/* Botões de ação */}
                {(currentLogo || logo) && (
                  <div className="mt-6 flex justify-center space-x-4">
                    <Button
                      onClick={handleSave}
                      disabled={saving || !currentLogo}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Logo
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleDelete}
                      disabled={deleting}
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Excluindo...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir Logo
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Card de Informações */}
            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileImage className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Especificações da Logo
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• <strong>Formatos aceitos:</strong> PNG, JPG, GIF</p>
                    <p>• <strong>Tamanho máximo:</strong> 2MB</p>
                    <p>• <strong>Resolução recomendada:</strong> 300x300px ou superior</p>
                    <p>• <strong>Fundo transparente:</strong> Recomendado para melhor integração</p>
                    <p>• <strong>Uso:</strong> A logo será exibida em relatórios, documentos e outras áreas do sistema</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Card de Preview */}
            {currentLogo && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview da Logo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-2">
                      <img
                        src={currentLogo}
                        alt="Preview pequeno"
                        className="w-16 h-16 object-contain mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600">Tamanho pequeno</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-2">
                      <img
                        src={currentLogo}
                        alt="Preview médio"
                        className="w-24 h-24 object-contain mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600">Tamanho médio</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-2">
                      <img
                        src={currentLogo}
                        alt="Preview grande"
                        className="w-32 h-32 object-contain mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600">Tamanho grande</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
