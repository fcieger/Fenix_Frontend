import { useEffect, useRef, useState, useCallback } from 'react';

export interface BarcodeScannerConfig {
  onBarcodeScanned: (barcode: string) => void;
  minLength?: number;
  maxLength?: number;
  timeout?: number; // Tempo máximo entre teclas (ms)
  enabled?: boolean;
  prefixToRemove?: string;
  suffixToRemove?: string;
}

export function useBarcodeScanner(config: BarcodeScannerConfig) {
  const {
    onBarcodeScanned,
    minLength = 8,
    maxLength = 13,
    timeout = 100,
    enabled = true,
    prefixToRemove = '',
    suffixToRemove = ''
  } = config;

  const [isScanning, setIsScanning] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string>('');
  
  const buffer = useRef<string>('');
  const lastKeyTime = useRef<number>(0);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const processBarcode = useCallback((barcode: string) => {
    // Remover prefixo e sufixo se configurado
    let processedBarcode = barcode;
    
    if (prefixToRemove && processedBarcode.startsWith(prefixToRemove)) {
      processedBarcode = processedBarcode.substring(prefixToRemove.length);
    }
    
    if (suffixToRemove && processedBarcode.endsWith(suffixToRemove)) {
      processedBarcode = processedBarcode.substring(0, processedBarcode.length - suffixToRemove.length);
    }

    // Validar comprimento
    if (processedBarcode.length >= minLength && processedBarcode.length <= maxLength) {
      setLastBarcode(processedBarcode);
      setIsScanning(false);
      onBarcodeScanned(processedBarcode);
      return true;
    }

    return false;
  }, [onBarcodeScanned, minLength, maxLength, prefixToRemove, suffixToRemove]);

  const resetBuffer = useCallback(() => {
    buffer.current = '';
    lastKeyTime.current = 0;
    setIsScanning(false);
    
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime.current;

      // Se passou muito tempo desde a última tecla, resetar o buffer
      if (timeDiff > timeout && buffer.current.length > 0) {
        resetBuffer();
      }

      // Verificar se é uma tecla de caractere válido
      const key = event.key;
      
      // Enter geralmente indica fim da leitura do scanner
      if (key === 'Enter') {
        if (buffer.current.length >= minLength) {
          event.preventDefault();
          const barcode = buffer.current;
          resetBuffer();
          processBarcode(barcode);
        }
        return;
      }

      // Ignorar teclas especiais
      if (key.length > 1) return;

      // Adicionar ao buffer se for caractere válido
      if (key.match(/[a-zA-Z0-9]/)) {
        // Detectar entrada rápida (scanner)
        if (timeDiff < timeout) {
          setIsScanning(true);
          event.preventDefault();
        }

        buffer.current += key;
        lastKeyTime.current = currentTime;

        // Limpar buffer automaticamente após timeout
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }

        timeoutId.current = setTimeout(() => {
          if (buffer.current.length >= minLength) {
            const barcode = buffer.current;
            resetBuffer();
            processBarcode(barcode);
          } else {
            resetBuffer();
          }
        }, timeout * 2);
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      resetBuffer();
    };
  }, [enabled, timeout, minLength, processBarcode, resetBuffer]);

  return {
    isScanning,
    lastBarcode,
    resetBuffer
  };
}




