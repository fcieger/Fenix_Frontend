'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle, Clock, XCircle, Upload, AlertCircle, FileCheck, FileX, FileClock, Sparkles } from 'lucide-react';
import { listarMinhasSolicitacoes, listarDocumentos } from '@/services/credito';
import { SolicitacaoCredito, DocumentoCredito } from '@/types/credito';
import UploadDocumentos from '@/components/credito/UploadDocumentos';

export default function DocumentacaoPage() {
  const router = useRouter();
  const [solicitacao, setSolicitacao] = useState<SolicitacaoCredito | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoCredito[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // Buscar última solicitação ativa
      const solicitacoes = await listarMinhasSolicitacoes();
      const ativa = solicitacoes.find(
        (s) => ['em_analise', 'aguardando_documentos', 'documentacao_completa'].includes(s.status)
      );

      if (ativa) {
        setSolicitacao(ativa);
        const docs = await listarDocumentos(ativa.id);
        setDocumentos(docs);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const documentosObrigatorios = [
    { tipo: 'documento_socio_1', label: 'CPF, CNH ou RG vigente - Sócio I', icon: FileText },
    { tipo: 'documento_socio_2', label: 'CPF, CNH ou RG vigente - Sócio II', icon: FileText },
    { tipo: 'comprovante_endereco_empresa', label: 'Comprovante Endereço - Empresa (Emissão nos últimos 90 dias)', icon: FileText },
    { tipo: 'comprovante_endereco_socio_1', label: 'Comprovante Endereço - Sócios (Emissão nos últimos 90 dias)', icon: FileText },
    { tipo: 'comprovante_endereco_socio_2', label: 'Comprovante Endereço - Sócios II (Emissão nos Últimos 90 Dias)', icon: FileText },
    { tipo: 'contrato_social', label: 'Contrato Social Consolidado Atualizado', icon: FileCheck },
    { tipo: 'fotos_empresa', label: 'Fotos da Empresa', icon: FileText },
    { tipo: 'ir_socio_1', label: 'Recibo e Declaração do Imposto de Renda PF - Sócio I', icon: FileText },
    { tipo: 'ir_socio_2', label: 'Recibo e Declaração do Imposto de Renda PF - Sócio II', icon: FileText },
    { tipo: 'comprovante_estado_civil', label: 'Comprovante de Estado Civil - Sócio', icon: FileText },
    { tipo: 'declaracao_faturamento', label: 'Declaração de Faturamento Assinada pelo Contador e Sócio da Empresa (Últimos 24 meses)', icon: FileText },
    { tipo: 'extrato_conta_corrente', label: 'Extrato Conta Corrente - Empresa (Últimos 90 dias)', icon: FileText },
  ];

  const documentosOpcionais = [
    { tipo: 'certidao_negativa', label: 'Certidão Negativa', icon: FileCheck },
    { tipo: 'balanco_patrimonial', label: 'Balanço Patrimonial', icon: FileText },
    { tipo: 'dre', label: 'DRE', icon: FileText },
    { tipo: 'outros', label: 'Outros Documentos', icon: FileText },
  ];

  const getDocumentoStatus = (tipo: string) => {
    const doc = documentos.find((d) => d.tipoDocumento === tipo);
    return doc ? doc.status : 'pendente';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle className="h-5 w-5 text-green-600 animate-in fade-in duration-300" />;
      case 'reprovado':
        return <XCircle className="h-5 w-5 text-red-600 animate-in fade-in duration-300" />;
      case 'pendente':
        return <Clock className="h-5 w-5 text-amber-500 animate-pulse" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'aprovado':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprovado
          </span>
        );
      case 'reprovado':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <XCircle className="h-3 w-3 mr-1" />
            Reprovado
          </span>
        );
      case 'substituir':
        return (
          <span className={`${baseClasses} bg-orange-100 text-orange-800`}>
            <FileX className="h-3 w-3 mr-1" />
            Substituir
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-amber-100 text-amber-800`}>
            <FileClock className="h-3 w-3 mr-1" />
            Pendente
          </span>
        );
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pendente: 'Pendente',
      aprovado: 'Aprovado',
      reprovado: 'Reprovado',
      substituir: 'Substituir',
    };
    return labels[status] || status;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleUploadSuccess = () => {
    carregarDados();
  };

  // Calcular progresso
  const documentosObrigatoriosEnviados = documentosObrigatorios.filter(
    (doc) => getDocumentoStatus(doc.tipo) !== 'pendente'
  ).length;
  const progresso = Math.round((documentosObrigatoriosEnviados / documentosObrigatorios.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="h-32 bg-gray-100 rounded-lg"></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!solicitacao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-amber-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-12 w-12 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Nenhuma solicitação ativa encontrada
                </h3>
                <p className="text-gray-600 mb-6">
                  Você precisa ter uma solicitação de crédito ativa para enviar documentos.
                </p>
                <Link
                  href="/credito/solicitar"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Criar Nova Solicitação
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Modernizado */}
        <div className="mb-8">
          <Link 
            href="/credito" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar</span>
          </Link>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Envio de Documentação
                </h1>
                <p className="text-gray-600">
                  Solicitação <span className="font-semibold text-gray-900">#{solicitacao.id.slice(0, 8)}</span> • 
                  Envie os documentos necessários para análise
                </p>
              </div>
              
              {/* Progresso */}
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Progresso</div>
                <div className="text-2xl font-bold text-blue-600">{progresso}%</div>
                <div className="w-24 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Upload */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card de Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Upload de Documentos</h2>
                  <p className="text-sm text-gray-500">Envie seus documentos em PDF, JPG ou PNG</p>
                </div>
              </div>
              <UploadDocumentos
                solicitacaoId={solicitacao.id}
                onUploadSuccess={handleUploadSuccess}
              />
            </div>

            {/* Documentos Enviados */}
            {documentos.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg mr-3">
                      <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Documentos Enviados</h2>
                      <p className="text-sm text-gray-500">{documentos.length} documento(s) enviado(s)</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {documentos.map((doc) => (
                    <div
                      key={doc.id}
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="flex-shrink-0 mr-4">
                          {getStatusIcon(doc.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{doc.nomeArquivo}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-gray-500">
                              {formatFileSize(doc.tamanhoBytes)}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                              {formatDate(doc.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 ml-4">
                        {getStatusBadge(doc.status)}
                        {doc.observacoes && (
                          <div className="group/obs relative">
                            <AlertCircle className="h-5 w-5 text-amber-500 cursor-help" />
                            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover/obs:opacity-100 group-hover/obs:visible transition-all duration-200 z-10">
                              {doc.observacoes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Checklist */}
          <div className="space-y-6">
            {/* Documentos Obrigatórios */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <FileCheck className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Documentos Obrigatórios</h3>
              </div>
              <div className="space-y-3">
                {documentosObrigatorios.map((doc) => {
                  const status = getDocumentoStatus(doc.tipo);
                  const enviado = status !== 'pendente';
                  const Icon = doc.icon;
                  return (
                    <div
                      key={doc.tipo}
                      className={`flex items-start p-3 rounded-lg border transition-all duration-200 ${
                        enviado 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="mt-0.5 mr-3">
                        {enviado ? (
                          getStatusIcon(status)
                        ) : (
                          <Icon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${enviado ? 'text-gray-900' : 'text-gray-700'}`}>
                          {doc.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {enviado ? getStatusLabel(status) : 'Não enviado'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Documentos Opcionais */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Documentos Opcionais</h3>
              </div>
              <div className="space-y-3">
                {documentosOpcionais.map((doc) => {
                  const status = getDocumentoStatus(doc.tipo);
                  const enviado = status !== 'pendente';
                  const Icon = doc.icon;
                  return (
                    <div
                      key={doc.tipo}
                      className={`flex items-start p-3 rounded-lg border transition-all duration-200 ${
                        enviado
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="mt-0.5 mr-3">
                        {enviado ? (
                          getStatusIcon(status)
                        ) : (
                          <Icon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <p className={`text-sm ${enviado ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {doc.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Informações */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Importante</p>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Envie todos os documentos obrigatórios para que sua solicitação seja analisada com agilidade.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


