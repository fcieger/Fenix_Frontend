'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  CreditCard, 
  Zap,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import PrazoPagamentoAI from './PrazoPagamentoAI';

interface ProdutoAIActionsProps {
  produto?: {
    id?: string;
    nome?: string;
    preco?: number;
    descricao?: string;
  };
  onPrazoCreated?: (prazo: any) => void;
}

export default function ProdutoAIActions({ produto, onPrazoCreated }: ProdutoAIActionsProps) {
  const [isAIOpen, setIsAIOpen] = useState(false);

  const context = {
    tipo: 'produto' as const,
    nome: produto?.nome,
    valor: produto?.preco,
    descricao: produto?.descricao
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-100 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">IA Assistente</h3>
                <p className="text-sm text-gray-600">
                  {produto?.nome 
                    ? `Configure prazos de pagamento para "${produto.nome}"`
                    : 'Configure prazos de pagamento inteligentes'
                  }
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsAIOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Prazo
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* AI Modal */}
      <PrazoPagamentoAI
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onSuccess={(prazo) => {
          setIsAIOpen(false);
          if (onPrazoCreated) {
            onPrazoCreated(prazo);
          }
        }}
        context={context}
      />
    </>
  );
}














