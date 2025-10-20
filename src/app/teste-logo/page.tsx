'use client';

import { useState } from 'react';
import { useCompanyLogo } from '@/hooks/useCompanyLogo';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

export default function TesteLogoPage() {
  const { logo, updateLogo } = useCompanyLogo();
  const [testImage, setTestImage] = useState<string | null>(null);

  const createTestLogo = () => {
    // Criar uma imagem de teste simples
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Desenhar um círculo roxo
      ctx.fillStyle = '#8B5CF6';
      ctx.beginPath();
      ctx.arc(50, 50, 40, 0, 2 * Math.PI);
      ctx.fill();
      
      // Adicionar texto
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TEST', 50, 55);
      
      // Converter para data URL
      const dataURL = canvas.toDataURL('image/png');
      setTestImage(dataURL);
      updateLogo(dataURL);
    }
  };

  const clearLogo = () => {
    setTestImage(null);
    updateLogo(null);
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Teste de Logo</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Estado atual da logo:</h2>
            <p className="text-gray-600">
              {logo ? '✅ Logo presente' : '❌ Nenhuma logo'}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Preview da logo:</h2>
            {logo ? (
              <div className="flex items-center space-x-4">
                <img 
                  src={logo} 
                  alt="Logo da empresa" 
                  className="w-16 h-16 border border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  Tamanho: {logo.length} caracteres
                </span>
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma logo carregada</p>
            )}
          </div>

          <div className="flex space-x-4">
            <Button onClick={createTestLogo}>
              Criar Logo de Teste
            </Button>
            <Button onClick={clearLogo} variant="outline">
              Limpar Logo
            </Button>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">localStorage:</h2>
            <p className="text-sm text-gray-600">
              {typeof window !== 'undefined' && localStorage.getItem('company-logo') 
                ? '✅ Logo salva no localStorage' 
                : '❌ Nenhuma logo no localStorage'
              }
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
