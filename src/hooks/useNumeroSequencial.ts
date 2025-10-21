import { useState, useCallback } from 'react';
import { apiService } from '@/lib/api';

interface UseNumeroSequencialReturn {
  numero: string;
  loading: boolean;
  error: string | null;
  prepararParaSalvar: (configuracaoId: string) => void;
  gerarNumeroParaSalvar: (token: string) => Promise<number | null>;
  reset: () => void;
}

export function useNumeroSequencial(): UseNumeroSequencialReturn {
  const [numero, setNumero] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configuracaoId, setConfiguracaoId] = useState<string>('');

  // Preparar para salvar - apenas armazena a configuração selecionada
  const prepararParaSalvar = useCallback((configId: string) => {
    setConfiguracaoId(configId);
    setError(null);
    setNumero(''); // Limpar número anterior
  }, []);

  // Gerar número apenas quando realmente for salvar
  const gerarNumeroParaSalvar = useCallback(async (token: string): Promise<number | null> => {
    if (!configuracaoId || !token) {
      setError('Configuração ou token não fornecidos');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Gerando próximo número para configuração:', configuracaoId);
      const result = await apiService.getProximoNumeroNfe(configuracaoId, token);
      setNumero(result.numeroAtual.toString());
      console.log('✅ Próximo número gerado:', result.numeroAtual);
      return result.numeroAtual;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar número sequencial';
      setError(errorMessage);
      console.error('❌ Erro ao gerar próximo número:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [configuracaoId]);

  const reset = useCallback(() => {
    setNumero('');
    setError(null);
    setLoading(false);
    setConfiguracaoId('');
  }, []);

  return {
    numero,
    loading,
    error,
    prepararParaSalvar,
    gerarNumeroParaSalvar,
    reset,
  };
}
