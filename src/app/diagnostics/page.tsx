'use client';

import { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';

export default function DiagnosticoPage() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('fenix_token');

    if (token) {
      setHasToken(true);
      try {
        const decoded = jwt.decode(token) as any;
        setTokenInfo({
          userId: decoded?.userId,
          email: decoded?.email,
          companyId: decoded?.companyId,
          exp: decoded?.exp ? new Date(decoded.exp * 1000).toLocaleString() : null,
          expired: decoded?.exp ? new Date() > new Date(decoded.exp * 1000) : false
        });
      } catch (error) {
        setTokenInfo({ error: 'Erro ao decodificar token' });
      }
    }
  }, []);

  const forcarLimpeza = () => {
    localStorage.clear();
    sessionStorage.clear();

    // Limpar cookies também
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    alert('✅ Cache limpo! Redirecionando para login...');
    window.location.href = '/login';
  };

  const corrigirAgora = () => {
    // IDs corretos do banco
    const correctUserId = '876fcdff-e957-4ca7-987f-19b934094f1d';
    const correctCompanyId = 'eb198f2a-a95b-413a-abb9-464e3b7af303';

    const isWrongUser = tokenInfo?.userId && tokenInfo.userId !== correctUserId;
    const isWrongCompany = tokenInfo?.companyId && tokenInfo.companyId !== correctCompanyId;

    if (isWrongUser || isWrongCompany) {
      forcarLimpeza();
    } else {
      alert('✅ Seus IDs estão corretos! Se ainda houver erro, tente fazer logout e login novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔧 Diagnóstico de Autenticação
          </h1>

          <div className="space-y-6">
            {/* Status do Token */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3">Status do Token</h2>
              {!hasToken ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-yellow-800">
                  ⚠️ Nenhum token encontrado no localStorage
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">User ID:</span>
                    <code className={`text-sm ${tokenInfo?.userId === '876fcdff-e957-4ca7-987f-19b934094f1d' ? 'text-green-600' : 'text-red-600'}`}>
                      {tokenInfo?.userId || 'N/A'}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <code className="text-sm">{tokenInfo?.email || 'N/A'}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Company ID:</span>
                    <code className={`text-sm ${tokenInfo?.companyId === 'eb198f2a-a95b-413a-abb9-464e3b7af303' ? 'text-green-600' : 'text-red-600'}`}>
                      {tokenInfo?.companyId || 'N/A'}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Expira em:</span>
                    <code className="text-sm">{tokenInfo?.exp || 'N/A'}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`font-bold ${tokenInfo?.expired ? 'text-red-600' : 'text-green-600'}`}>
                      {tokenInfo?.expired ? '❌ Expirado' : '✅ Válido'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* IDs Corretos */}
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3 text-green-900">✅ IDs Corretos (Banco de Dados)</h2>
              <div className="space-y-2 text-green-800">
                <div className="flex justify-between">
                  <span className="font-medium">User ID:</span>
                  <code className="text-sm">876fcdff-e957-4ca7-987f-19b934094f1d</code>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <code className="text-sm">fcieger1982@gmail.com</code>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Company ID:</span>
                  <code className="text-sm">eb198f2a-a95b-413a-abb9-464e3b7af303</code>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Company:</span>
                  <code className="text-sm">CASA DA CALANDRA LTDA</code>
                </div>
              </div>
            </div>

            {/* Diagnóstico */}
            {hasToken && tokenInfo && (
              <div className={`border rounded-lg p-4 ${
                tokenInfo.userId === '876fcdff-e957-4ca7-987f-19b934094f1d' &&
                tokenInfo.companyId === 'eb198f2a-a95b-413a-abb9-464e3b7af303'
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}>
                <h2 className="text-xl font-semibold mb-3">Diagnóstico</h2>
                {tokenInfo.userId === '876fcdff-e957-4ca7-987f-19b934094f1d' &&
                 tokenInfo.companyId === 'eb198f2a-a95b-413a-abb9-464e3b7af303' ? (
                  <p className="text-green-800">
                    ✅ Seus IDs estão corretos! O token está OK.
                  </p>
                ) : (
                  <div className="text-red-800 space-y-2">
                    <p className="font-bold">❌ IDs INCORRETOS DETECTADOS!</p>
                    {tokenInfo.userId !== '876fcdff-e957-4ca7-987f-19b934094f1d' && (
                      <p>• User ID está errado</p>
                    )}
                    {tokenInfo.companyId !== 'eb198f2a-a95b-413a-abb9-464e3b7af303' && (
                      <p>• Company ID está errado</p>
                    )}
                    <p className="mt-3">Clique no botão "Corrigir Agora" para limpar o cache.</p>
                  </div>
                )}
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-4">
              <button
                onClick={forcarLimpeza}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🗑️ Forçar Limpeza Total
              </button>
              {hasToken && tokenInfo && (
                tokenInfo.userId !== '876fcdff-e957-4ca7-987f-19b934094f1d' ||
                tokenInfo.companyId !== 'eb198f2a-a95b-413a-abb9-464e3b7af303'
              ) && (
                <button
                  onClick={corrigirAgora}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  🔧 Corrigir Agora
                </button>
              )}
              <button
                onClick={() => window.location.href = '/login'}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🔑 Ir para Login
              </button>
            </div>

            {/* Instruções */}
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3 text-blue-900">📋 Instruções</h2>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Clique em "Forçar Limpeza Total" para limpar todo o cache</li>
                <li>Aguarde ser redirecionado para o login</li>
                <li>Faça login com: fcieger1982@gmail.com</li>
                <li>Os dashboards devem funcionar normalmente</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






