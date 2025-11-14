'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

export default function DebugNaturezaFrenteCaixaPage() {
  const { token, activeCompanyId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const naturezaId = '979411f7-aa1f-433e-b8f0-f04bf435e2dc';

  useEffect(() => {
    if (token && activeCompanyId) {
      checkNatureza();
    }
  }, [token, activeCompanyId]);

  const checkNatureza = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar via API de debug
      const debugResponse = await fetch(`/api/debug/natureza-frente-caixa?id=${naturezaId}`);
      const debugData = await debugResponse.json();
      
      if (!debugResponse.ok) {
        throw new Error(debugData.error || 'Erro ao buscar dados');
      }
      
      // Também buscar via API normal
      const normalResponse = await fetch(`/api/natureza-operacao/${naturezaId}?companyId=${activeCompanyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      let normalData = null;
      if (normalResponse.ok) {
        normalData = await normalResponse.json();
      }
      
      setData({
        debug: debugData,
        normal: normalData,
        normalResponseOk: normalResponse.ok,
        normalStatus: normalResponse.status
      });
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Verificando Natureza...</h1>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Erro</h1>
          <p className="text-red-600">{error}</p>
          <button
            onClick={checkNatureza}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const debug = data?.debug;
  const normal = data?.normal;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug: Natureza Frente de Caixa</h1>
        <p className="mb-4 text-gray-600">ID: {naturezaId}</p>
        
        <button
          onClick={checkNatureza}
          className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Atualizar
        </button>

        {debug && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">📦 Dados do Banco (API Debug)</h2>
            
            {debug.natureza && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Informações Gerais</h3>
                  <p>Nome: {debug.natureza.nome}</p>
                  <p>CFOP: {debug.natureza.cfop}</p>
                  <p>Tipo: {debug.natureza.tipo}</p>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Frente de Caixa</h3>
                  <div className={`p-3 rounded ${debug.natureza.frenteDeCaixa.estaMarcado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <p className="font-bold">{debug.natureza.frenteDeCaixa.avaliacao}</p>
                    <p>Valor: {String(debug.natureza.frenteDeCaixa.valor)}</p>
                    <p>Tipo: {debug.natureza.frenteDeCaixa.tipo}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Outras Configurações</h3>
                  <p>Considerar Operação como Faturamento: {String(debug.natureza.considerarOperacaoComoFaturamento ?? 'null')}</p>
                  <p>Destacar Total Impostos IBPT: {String(debug.natureza.destacarTotalImpostosIBPT ?? 'null')}</p>
                  <p>Gerar Contas Receber/Pagar: {String(debug.natureza.gerarContasReceberPagar ?? 'null')}</p>
                </div>

                {debug.estruturaColuna && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Estrutura da Coluna</h3>
                    {debug.estruturaColuna.existe ? (
                      <>
                        <p>Coluna existe: ✅</p>
                        <p>Tipo de dados: {debug.estruturaColuna.tipo}</p>
                        <p>Valor padrão: {debug.estruturaColuna.valorPadrao ?? 'null'}</p>
                      </>
                    ) : (
                      <p className="text-red-600">❌ {debug.estruturaColuna.mensagem}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {normal && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">📡 Dados via API Normal</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(normal, null, 2)}
            </pre>
          </div>
        )}

        {data && !normal && (
          <div className="bg-yellow-100 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-yellow-800">⚠️ API Normal não respondeu</h2>
            <p>Status: {data.normalStatus}</p>
            <p>Response OK: {String(data.normalResponseOk)}</p>
          </div>
        )}
      </div>
    </div>
  );
}







