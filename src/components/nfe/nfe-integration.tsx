'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Download,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface NFeIntegrationProps {
  nfeId: string;
  nfeStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

interface NFeIntegrationStatus {
  status: string;
  chaveAcesso?: string;
  dataAutorizacao?: string;
  protocoloAutorizacao?: string;
  ultimaAtualizacao?: string;
}

const statusConfig = {
  RASCUNHO: { 
    label: 'Rascunho', 
    color: 'bg-gray-100 text-gray-800',
    icon: FileText,
    description: 'NFe criada, pronta para emissão'
  },
  PENDENTE: { 
    label: 'Processando', 
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'NFe sendo processada pela API externa'
  },
  AUTORIZADA: { 
    label: 'Autorizada', 
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'NFe autorizada e válida'
  },
  REJEITADA: { 
    label: 'Rejeitada', 
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'NFe rejeitada pela API externa'
  },
  CANCELADA: { 
    label: 'Cancelada', 
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'NFe cancelada'
  }
};

export default function NFeIntegration({ 
  nfeId, 
  nfeStatus, 
  onStatusChange 
}: NFeIntegrationProps) {
  const { token } = useAuth();
  const [isEmitindo, setIsEmitindo] = useState(false);
  const [isSincronizando, setIsSincronizando] = useState(false);
  const [statusAtual, setStatusAtual] = useState(nfeStatus);
  const [statusInfo, setStatusInfo] = useState<NFeIntegrationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Atualizar status quando prop mudar
  useEffect(() => {
    setStatusAtual(nfeStatus);
  }, [nfeStatus]);

  // Buscar informações detalhadas do status
  useEffect(() => {
    if (statusAtual !== 'RASCUNHO') {
      buscarStatusDetalhado();
    }
  }, [statusAtual]);

  const buscarStatusDetalhado = async () => {
    try {
      const response = await apiService.getStatusIntegracaoNFe(nfeId, token);
      setStatusInfo(response);
    } catch (error) {
      console.error('Erro ao buscar status detalhado:', error);
    }
  };

  const emitirNFe = async () => {
    setIsEmitindo(true);
    setError(null);
    
    try {
      const response = await apiService.emitirNFeExterna(nfeId, token);
      
      setStatusAtual(response.status);
      onStatusChange?.(response.status);
      
      toast.success('NFe enviada para processamento!', {
        description: 'A NFe está sendo processada pela API externa'
      });
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      setError(errorMessage);
      
      toast.error('Erro ao emitir NFe', {
        description: errorMessage
      });
    } finally {
      setIsEmitindo(false);
    }
  };

  const sincronizarStatus = async () => {
    setIsSincronizando(true);
    setError(null);
    
    try {
      const response = await apiService.sincronizarNFe(nfeId, token);
      
      if (response.success) {
        await buscarStatusDetalhado();
        toast.success('Status atualizado!', {
          description: 'A NFe foi sincronizada com sucesso'
        });
      } else {
        throw new Error(response.message);
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao sincronizar';
      setError(errorMessage);
      
      toast.error('Erro ao sincronizar', {
        description: errorMessage
      });
    } finally {
      setIsSincronizando(false);
    }
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.RASCUNHO;
  };

  const statusConfigAtual = getStatusConfig(statusAtual);
  const StatusIcon = statusConfigAtual.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="nfe-integration">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Integração NFe
          </CardTitle>
          <CardDescription>
            Gerencie a emissão e sincronização da NFe com a API externa
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status atual */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className="h-5 w-5" />
              <div>
                <Badge className={statusConfigAtual.color}>
                  {statusConfigAtual.label}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">
                  {statusConfigAtual.description}
                </p>
              </div>
            </div>
          </div>

          {/* Informações da API */}
          {statusInfo && (
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Informações da API</h4>
              
              {statusInfo.chaveAcesso && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Chave de Acesso:</span>
                  <code className="bg-white px-2 py-1 rounded text-xs">
                    {statusInfo.chaveAcesso}
                  </code>
                </div>
              )}
              
              {statusInfo.protocoloAutorizacao && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Protocolo:</span>
                  <code className="bg-white px-2 py-1 rounded text-xs">
                    {statusInfo.protocoloAutorizacao}
                  </code>
                </div>
              )}
              
              {statusInfo.dataAutorizacao && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Data Autorização:</span>
                  <span>{new Date(statusInfo.dataAutorizacao).toLocaleString('pt-BR')}</span>
                </div>
              )}
              
              {statusInfo.ultimaAtualizacao && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Última atualização:</span>
                  <span>{new Date(statusInfo.ultimaAtualizacao).toLocaleString('pt-BR')}</span>
                </div>
              )}
            </div>
          )}

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Ações */}
          <div className="flex gap-2 flex-wrap">
            {statusAtual === 'RASCUNHO' && (
              <Button 
                onClick={emitirNFe} 
                disabled={isEmitindo}
                className="flex items-center gap-2"
                size="sm"
              >
                {isEmitindo ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isEmitindo ? 'Emitindo...' : 'Emitir NFe'}
              </Button>
            )}

            {(statusAtual === 'PENDENTE' || statusAtual === 'AUTORIZADA') && (
              <Button 
                onClick={sincronizarStatus} 
                disabled={isSincronizando}
                variant="outline"
                className="flex items-center gap-2"
                size="sm"
              >
                {isSincronizando ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isSincronizando ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
            )}

            {statusAtual === 'AUTORIZADA' && (
              <>
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar XML
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Visualizar
                </Button>
              </>
            )}
          </div>

          {/* Informações da integração */}
          {statusAtual !== 'RASCUNHO' && (
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <ExternalLink className="h-3 w-3" />
                <span className="font-medium">Integração Ativa</span>
              </div>
              <p>Esta NFe está integrada com a API externa e será atualizada automaticamente.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}






