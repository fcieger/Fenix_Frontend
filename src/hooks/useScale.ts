import { useState, useEffect, useCallback, useRef } from 'react';

export interface ScaleConfig {
  modelo?: 'toledo' | 'filizola' | 'urano' | 'generico';
  porta?: string;
  baudRate?: number;
  autoConnect?: boolean;
}

export interface ScaleState {
  peso: number;
  conectada: boolean;
  lendo: boolean;
  estavel: boolean;
  erro: string | null;
  unidade: 'kg' | 'g';
}

export function useScale(config: ScaleConfig = {}) {
  const {
    modelo = 'generico',
    baudRate = 9600,
    autoConnect = false
  } = config;

  const [state, setState] = useState<ScaleState>({
    peso: 0,
    conectada: false,
    lendo: false,
    estavel: false,
    erro: null,
    unidade: 'kg'
  });

  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const pesoHistoricoRef = useRef<number[]>([]);
  const taraRef = useRef<number>(0);

  // Conectar balança via Serial API
  const conectarBalanca = useCallback(async () => {
    try {
      // Verificar se Serial API está disponível
      if (!('serial' in navigator)) {
        throw new Error('Serial API não suportada neste navegador. Use Chrome/Edge.');
      }

      // Solicitar porta serial
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate });

      portRef.current = port;
      setState(prev => ({ ...prev, conectada: true, erro: null }));

      // Iniciar leitura
      iniciarLeitura();
    } catch (error: any) {
      console.error('Erro ao conectar balança:', error);
      setState(prev => ({ 
        ...prev, 
        conectada: false, 
        erro: error.message || 'Erro ao conectar balança'
      }));
    }
  }, [baudRate]);

  // Desconectar balança
  const desconectarBalanca = useCallback(async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }

      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }

      setState(prev => ({ 
        ...prev, 
        conectada: false, 
        lendo: false,
        peso: 0,
        erro: null
      }));
    } catch (error: any) {
      console.error('Erro ao desconectar balança:', error);
    }
  }, []);

  // Iniciar leitura contínua
  const iniciarLeitura = async () => {
    if (!portRef.current) return;

    try {
      setState(prev => ({ ...prev, lendo: true }));

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = portRef.current.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      // Ler continuamente
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Processar dados recebidos
        processarDados(value);
      }
    } catch (error: any) {
      console.error('Erro na leitura:', error);
      setState(prev => ({ ...prev, lendo: false, erro: 'Erro na leitura da balança' }));
    }
  };

  // Processar dados recebidos da balança
  const processarDados = (dados: string) => {
    try {
      // Protocolo genérico: assume que vem peso em formato "XXX.XXX"
      // Diferentes modelos podem ter protocolos diferentes
      const match = dados.match(/(\d+\.?\d*)/);
      
      if (match) {
        let peso = parseFloat(match[1]);
        
        // Converter para kg se necessário (alguns modelos enviam em gramas)
        if (peso > 1000) {
          peso = peso / 1000;
        }

        // Aplicar tara
        peso = Math.max(0, peso - taraRef.current);

        // Adicionar ao histórico para calcular estabilidade
        pesoHistoricoRef.current.push(peso);
        if (pesoHistoricoRef.current.length > 5) {
          pesoHistoricoRef.current.shift();
        }

        // Verificar estabilidade (variação < 0.005 kg nos últimos 5 valores)
        const estavel = verificarEstabilidade();

        setState(prev => ({
          ...prev,
          peso,
          estavel,
          erro: null
        }));
      }
    } catch (error) {
      console.error('Erro ao processar dados da balança:', error);
    }
  };

  // Verificar se o peso está estável
  const verificarEstabilidade = (): boolean => {
    if (pesoHistoricoRef.current.length < 3) return false;

    const pesos = pesoHistoricoRef.current;
    const media = pesos.reduce((sum, p) => sum + p, 0) / pesos.length;
    const variacoes = pesos.map(p => Math.abs(p - media));
    const maxVariacao = Math.max(...variacoes);

    return maxVariacao < 0.005; // 5 gramas de variação
  };

  // Aplicar tara (zerar peso atual)
  const aplicarTara = useCallback((peso?: number) => {
    if (peso !== undefined) {
      taraRef.current = peso;
    } else {
      taraRef.current = state.peso;
    }
    
    setState(prev => ({ ...prev, peso: 0 }));
    pesoHistoricoRef.current = [];
  }, [state.peso]);

  // Zerar tara
  const zerarTara = useCallback(() => {
    taraRef.current = 0;
    pesoHistoricoRef.current = [];
  }, []);

  // Auto-conectar se configurado
  useEffect(() => {
    if (autoConnect) {
      conectarBalanca();
    }

    return () => {
      if (portRef.current) {
        desconectarBalanca();
      }
    };
  }, [autoConnect, conectarBalanca, desconectarBalanca]);

  return {
    ...state,
    conectarBalanca,
    desconectarBalanca,
    aplicarTara,
    zerarTara,
    tara: taraRef.current
  };
}



