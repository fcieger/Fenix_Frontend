'use client';

import React, { useState } from 'react';
import { FENIXNFeIntegration } from '@/services/nfeIntegration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, FileText, Zap } from 'lucide-react';

export default function NFeIntegrationTest() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [erro, setErro] = useState<string>('');

  const testarIntegracao = async () => {
    setLoading(true);
    setErro('');
    setResultado(null);
    
    try {
      const resultado = await FENIXNFeIntegration.testarIntegracao();
      setResultado(resultado);
    } catch (error) {
      setErro(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Teste de Integração FENIX ↔ API NFe
          </CardTitle>
          <CardDescription>
            Teste a integração entre o sistema FENIX e a API NFe externa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testarIntegracao}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testando Integração...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Testar Integração Completa
              </>
            )}
          </Button>

          {erro && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}

          {resultado && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {resultado.sucesso ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Resultado do Teste
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status:</label>
                    <div className="mt-1">
                      <Badge variant={resultado.sucesso ? "default" : "destructive"}>
                        {resultado.sucesso ? 'Sucesso' : 'Falha'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Mensagem:</label>
                    <p className="mt-1 text-sm text-gray-900">{resultado.mensagem}</p>
                  </div>
                </div>

                {resultado.chaveNFe && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Chave NFe:</label>
                    <p className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded">
                      {resultado.chaveNFe}
                    </p>
                  </div>
                )}

                {resultado.protocolo && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Protocolo:</label>
                    <p className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded">
                      {resultado.protocolo}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">Dados Enviados:</label>
                  <pre className="mt-1 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(resultado.dadosOriginais, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>Como funciona:</strong> Este teste simula a emissão de uma NFe usando dados do FENIX,
              converte para o formato da API NFe externa e envia para processamento.
              Certifique-se de que a API NFe está rodando na porta 8080.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}




