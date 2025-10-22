'use client';

import React, { useState } from 'react';
import { nfeService, NFeRequest, NFeResponse } from '@/services/nfeService';

export default function NFeTeste() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resultado, setResultado] = useState<NFeResponse | null>(null);
  const [erro, setErro] = useState<string>('');

  const testarStatus = async () => {
    setLoading(true);
    setErro('');
    try {
      const statusText = await nfeService.verificarStatus();
      setStatus(statusText);
    } catch (error) {
      setErro(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testarSaude = async () => {
    setLoading(true);
    setErro('');
    try {
      const saudeText = await nfeService.verificarSaude();
      setStatus(saudeText);
    } catch (error) {
      setErro(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const emitirNFeTeste = async () => {
    setLoading(true);
    setErro('');
    setResultado(null);
    
    try {
      const dadosNFe = nfeService.criarNFeExemplo();
      const resultado = await nfeService.emitirNFe(dadosNFe);
      setResultado(resultado);
    } catch (error) {
      setErro(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🧪 Teste de Integração NFe
      </h2>
      
      <div className="space-y-4">
        {/* Botões de Teste */}
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={testarStatus}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Status'}
          </button>
          
          <button
            onClick={testarSaude}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Saúde'}
          </button>
          
          <button
            onClick={emitirNFeTeste}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Emitindo...' : 'Emitir NFe Teste'}
          </button>
        </div>

        {/* Status */}
        {status && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800">Status da API:</h3>
            <p className="text-blue-700">{status}</p>
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-semibold text-red-800">Erro:</h3>
            <p className="text-red-700">{erro}</p>
          </div>
        )}

        {/* Resultado da NFe */}
        {resultado && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded">
            <h3 className="font-semibold text-gray-800 mb-2">Resultado da NFe:</h3>
            <div className="space-y-2">
              <p><strong>Sucesso:</strong> {resultado.sucesso ? '✅ Sim' : '❌ Não'}</p>
              <p><strong>Mensagem:</strong> {resultado.mensagem}</p>
              {resultado.chaveNFe && (
                <p><strong>Chave NFe:</strong> <code className="bg-gray-200 px-2 py-1 rounded text-sm">{resultado.chaveNFe}</code></p>
              )}
              {resultado.protocolo && (
                <p><strong>Protocolo:</strong> <code className="bg-gray-200 px-2 py-1 rounded text-sm">{resultado.protocolo}</code></p>
              )}
              {resultado.status && (
                <p><strong>Status:</strong> <code className="bg-gray-200 px-2 py-1 rounded text-sm">{resultado.status}</code></p>
              )}
              {resultado.dataProcessamento && (
                <p><strong>Data Processamento:</strong> {new Date(resultado.dataProcessamento).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Instruções:</h3>
          <ol className="list-decimal list-inside space-y-1 text-yellow-700">
            <li>Certifique-se de que a API NFe está rodando na porta 8080</li>
            <li>Clique em "Testar Status" para verificar se a API está respondendo</li>
            <li>Clique em "Emitir NFe Teste" para testar a emissão (ambiente de homologação)</li>
            <li>Verifique os logs da API para mais detalhes</li>
          </ol>
        </div>
      </div>
    </div>
  );
}




