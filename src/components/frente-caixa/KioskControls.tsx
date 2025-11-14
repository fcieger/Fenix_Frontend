'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Maximize2, Minimize2, Lock, Unlock } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { kioskMode } from '@/lib/kiosk-mode';
import { motion } from 'framer-motion';
import { VirtualKeyboard } from '@/components/ui/VirtualKeyboard';

interface KioskControlsProps {
  senhaKiosk?: string;
}

export function KioskControls({ senhaKiosk = '1234' }: KioskControlsProps) {
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [kioskModeAtivo, setKioskModeAtivo] = useState(false);
  const [showSenhaDialog, setShowSenhaDialog] = useState(false);
  const [senhaDigitada, setSenhaDigitada] = useState('');

  const toggleKioskMode = () => {
    if (kioskModeAtivo) {
      // Desativar - pedir senha
      setShowSenhaDialog(true);
    } else {
      // Ativar
      kioskMode.enable({
        bloquearTeclasSistema: true,
        bloquearMenuContexto: true,
        bloquearSelecao: false,
        bloquearZoom: true,
        bloquearRefresh: true
      });
      setKioskModeAtivo(true);
      
      // Entrar em fullscreen automaticamente
      if (!isFullscreen) {
        toggleFullscreen();
      }
    }
  };

  const verificarSenha = () => {
    if (senhaDigitada === senhaKiosk) {
      kioskMode.disable();
      setKioskModeAtivo(false);
      setShowSenhaDialog(false);
      setSenhaDigitada('');
    } else {
      alert('Senha incorreta!');
      setSenhaDigitada('');
    }
  };

  return (
    <>
      {/* Controles Flutuantes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
      >
        {/* Toggle Fullscreen */}
        <Button
          onClick={toggleFullscreen}
          size="lg"
          variant="outline"
          className="h-12 w-12 p-0 bg-white shadow-lg hover:shadow-xl border-2"
          title={isFullscreen ? "Sair de Tela Cheia" : "Tela Cheia"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </Button>

        {/* Toggle Kiosk Mode */}
        <Button
          onClick={toggleKioskMode}
          size="lg"
          variant="outline"
          className={`h-12 w-12 p-0 shadow-lg hover:shadow-xl border-2 ${
            kioskModeAtivo 
              ? 'bg-green-500 text-white border-green-600 hover:bg-green-600' 
              : 'bg-white hover:bg-gray-50'
          }`}
          title={kioskModeAtivo ? "Sair do Modo Kiosk" : "Modo Kiosk"}
        >
          {kioskModeAtivo ? (
            <Lock className="h-5 w-5" />
          ) : (
            <Unlock className="h-5 w-5" />
          )}
        </Button>

        {kioskModeAtivo && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold text-center whitespace-nowrap"
          >
            Modo Kiosk
          </motion.div>
        )}
      </motion.div>

      {/* Dialog de Senha */}
      <Dialog open={showSenhaDialog} onOpenChange={setShowSenhaDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Lock className="h-6 w-6 text-red-600" />
              Sair do Modo Kiosk
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 text-center">
              Digite a senha para sair do modo kiosk
            </p>

            <VirtualKeyboard
              value={senhaDigitada.replace(/./g, '•')}
              onChange={(val) => {
                // Pegar apenas os números
                const numeros = val.replace(/[^\d]/g, '');
                if (numeros.length <= 6) {
                  setSenhaDigitada(numeros);
                }
              }}
              onEnter={verificarSenha}
              onCancel={() => {
                setShowSenhaDialog(false);
                setSenhaDigitada('');
              }}
              showDecimal={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}




