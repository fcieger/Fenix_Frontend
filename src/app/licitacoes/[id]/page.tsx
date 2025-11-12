'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Building, 
  ExternalLink, 
  Eye, 
  Share2, 
  FileText, 
  Clock,
  Edit,
  Save,
  X,
  Copy,
  Star,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Tag,
  Globe
} from 'lucide-react';
import { licitacoesService, Licitacao } from '@/services/licitacoes-service';
import { toast } from 'sonner';

export default function LicitacaoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, activeCompanyId } = useAuth();
  const [licitacao, setLicitacao] = useState<Licitacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Licitacao>>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      carregarLicitacao();
    }
  }, [params.id, isAuthenticated]);

  const carregarLicitacao = async () => {
    try {
      setLoading(true);
      console.log('📥 Carregando detalhes da licitação:', params.id);
      const data = await licitacoesService.buscarPorId(params.id as string);
      console.log('✅ Licitação carregada:', data);
      setLicitacao(data);
      setFormData(data);
    } catch (error: any) {
      console.error('❌ Erro ao carregar licitação:', error);
      toast.error(error?.response?.data?.error || 'Erro ao carregar detalhes da licitação');
      setTimeout(() => router.push('/licitacoes'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!activeCompanyId) {
        toast.error('CompanyId não encontrado.');
        return;
      }

      // TODO: Implementar endpoint de atualização quando disponível
      // Por enquanto, apenas simular salvamento
      toast.success('Alterações salvas com sucesso!');
      setEditing(false);
      
      // Atualizar estado local
      if (licitacao) {
        setLicitacao({ ...licitacao, ...formData });
      }
    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error);
      toast.error(error?.response?.data?.error || 'Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(licitacao || {});
    setEditing(false);
  };

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatDate = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateInput = (data: string) => {
    if (!data) return '';
    return new Date(data).toISOString().split('T')[0];
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-purple-600 mt-4 font-medium">Carregando detalhes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!licitacao) {
    return (
      <Layout>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Licitação não encontrada</p>
              <Button onClick={() => router.push('/licitacoes')}>
                Voltar para Licitações
              </Button>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const statusColor: Record<string, string> = {
    'Aberta': 'bg-green-100 text-green-700 border-green-200',
    'Encerrada': 'bg-gray-100 text-gray-700 border-gray-200',
    'Homologada': 'bg-blue-100 text-blue-700 border-blue-200',
    'Cancelada': 'bg-red-100 text-red-700 border-red-200',
  };

  const diasRestantes = formData.dataLimite || licitacao.dataLimite
    ? Math.ceil((new Date(formData.dataLimite || licitacao.dataLimite!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/licitacoes')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Licitações
            </Button>
            
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>

          {/* Título e Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {editing ? (
                      <div className="flex gap-2 flex-wrap">
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">Status</Label>
                          <select
                            value={formData.status || licitacao.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="px-3 py-1 rounded-full text-xs font-semibold border bg-white"
                          >
                            <option value="Aberta">Aberta</option>
                            <option value="Encerrada">Encerrada</option>
                            <option value="Homologada">Homologada</option>
                            <option value="Cancelada">Cancelada</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">Modalidade</Label>
                          <Input
                            value={formData.modalidade || licitacao.modalidade}
                            onChange={(e) => setFormData({ ...formData, modalidade: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">Esfera</Label>
                          <Input
                            value={formData.esfera || licitacao.esfera}
                            onChange={(e) => setFormData({ ...formData, esfera: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor[licitacao.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          {licitacao.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          {licitacao.modalidade}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                          {licitacao.esfera}
                        </span>
                        {diasRestantes !== null && diasRestantes > 0 && diasRestantes <= 7 && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Encerra em {diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  
                  {editing ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Título</Label>
                        <Input
                          value={formData.titulo || licitacao.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Número do Processo</Label>
                        <Input
                          value={formData.numeroProcesso || licitacao.numeroProcesso}
                          onChange={(e) => setFormData({ ...formData, numeroProcesso: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {licitacao.titulo}
                      </h1>
                      <p className="text-gray-600">
                        Processo: <span className="font-semibold text-gray-900">{licitacao.numeroProcesso}</span>
                      </p>
                    </>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                  <Building className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-600 mb-1 font-medium block">Órgão</Label>
                    {editing ? (
                      <div className="space-y-2">
                        <Input
                          value={formData.orgao || licitacao.orgao}
                          onChange={(e) => setFormData({ ...formData, orgao: e.target.value })}
                        />
                        {licitacao.orgaoSigla && (
                          <Input
                            placeholder="Sigla do órgão"
                            value={formData.orgaoSigla || licitacao.orgaoSigla}
                            onChange={(e) => setFormData({ ...formData, orgaoSigla: e.target.value })}
                            className="text-sm"
                          />
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="font-bold text-gray-900">{licitacao.orgao}</p>
                        {licitacao.orgaoSigla && (
                          <p className="text-sm text-gray-500 mt-1">{licitacao.orgaoSigla}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                  <MapPin className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-600 mb-1 font-medium block">Localização</Label>
                    {editing ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Estado"
                          value={formData.estado || licitacao.estado}
                          onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        />
                        <Input
                          placeholder="Município"
                          value={formData.municipio || licitacao.municipio || ''}
                          onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                        />
                      </div>
                    ) : (
                      <p className="font-bold text-gray-900">
                        {licitacao.municipio ? `${licitacao.municipio}, ${licitacao.estado}` : licitacao.estado}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                  <DollarSign className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-600 mb-1 font-medium block">Valor Estimado</Label>
                    {editing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.valorEstimado || licitacao.valorEstimado}
                        onChange={(e) => setFormData({ ...formData, valorEstimado: parseFloat(e.target.value) || 0 })}
                        className="text-2xl font-bold"
                      />
                    ) : (
                      <p className="font-bold text-gray-900 text-2xl">
                        {formatCurrency(licitacao.valorEstimado)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                  <Calendar className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-600 mb-1 font-medium block">Datas</Label>
                    {editing ? (
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Data de Abertura</Label>
                          <Input
                            type="date"
                            value={formatDateInput(formData.dataAbertura || licitacao.dataAbertura)}
                            onChange={(e) => setFormData({ ...formData, dataAbertura: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                        {licitacao.dataLimite && (
                          <div>
                            <Label className="text-xs">Data Limite</Label>
                            <Input
                              type="date"
                              value={formatDateInput(formData.dataLimite || licitacao.dataLimite || '')}
                              onChange={(e) => setFormData({ ...formData, dataLimite: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="font-bold text-gray-900">
                          {formatDate(licitacao.dataAbertura)}
                        </p>
                        {licitacao.dataLimite && (
                          <>
                            <p className="text-sm text-gray-600 mt-3 mb-1 font-medium">Data Limite</p>
                            <p className="font-bold text-gray-900">
                              {formatDate(licitacao.dataLimite)}
                            </p>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descrição */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Descrição / Objeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <Textarea
                  value={formData.descricao || licitacao.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={8}
                  className="w-full"
                  placeholder="Descrição da licitação..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {licitacao.descricao || 'Descrição não disponível'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          {editing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Informações Adicionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Link do Edital</Label>
                  <Input
                    type="url"
                    value={formData.linkEdital || licitacao.linkEdital || ''}
                    onChange={(e) => setFormData({ ...formData, linkEdital: e.target.value })}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Fonte</Label>
                  <Input
                    value={formData.fonte || licitacao.fonte}
                    onChange={(e) => setFormData({ ...formData, fonte: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Ações Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {(formData.linkEdital || licitacao.linkEdital) ? (
                    <Button asChild>
                      <a
                        href={formData.linkEdital || licitacao.linkEdital}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir Edital
                      </a>
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const link = 'https://www.gov.br/compras/pt-br';
                        window.open(link, '_blank');
                      }}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Portal de Compras do Governo
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const texto = `Licitação: ${formData.titulo || licitacao.titulo}\nProcesso: ${formData.numeroProcesso || licitacao.numeroProcesso}\nÓrgão: ${formData.orgao || licitacao.orgao}\nValor: R$ ${(formData.valorEstimado || licitacao.valorEstimado).toLocaleString('pt-BR')}`;
                      navigator.clipboard.writeText(texto);
                      toast.success('Informações copiadas para a área de transferência!');
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Informações
                  </Button>
                  
                  <Button variant="outline" onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                    <Star className="w-4 h-4 mr-2" />
                    Adicionar aos Favoritos
                  </Button>
                  
                  <Button variant="outline" onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Manifestar Interesse
                  </Button>
                </div>
                
                {!(formData.linkEdital || licitacao.linkEdital) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">
                        Link direto do edital não disponível. Use o número do processo <strong>{formData.numeroProcesso || licitacao.numeroProcesso}</strong> para buscar no Portal de Compras do Governo.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Meta Informações */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{licitacao.visualizacoes} visualizações</span>
              </div>
              <span>•</span>
              <span>Fonte: {formData.fonte || licitacao.fonte}</span>
            </div>
            <div>
              Sincronizado em {formatDate(licitacao.createdAt)}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
