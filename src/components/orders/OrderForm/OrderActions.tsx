"use client";

import React from "react";
import { Save, X, Copy, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderType } from "./OrderFormProvider";

export interface OrderActionsProps {
  onSave: () => void;
  onCancel: () => void;
  onDuplicate?: () => void;
  onSend?: () => void;
  isSaving?: boolean;
  isSending?: boolean;
  orderType: OrderType;
  orderId?: string;
}

export function OrderActions({
  onSave,
  onCancel,
  onDuplicate,
  onSend,
  isSaving = false,
  isSending = false,
  orderType,
  orderId,
}: OrderActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t">
      <Button variant="outline" onClick={onCancel}>
        <X className="w-4 h-4 mr-2" />
        Cancelar
      </Button>

      {onDuplicate && orderId && (
        <Button variant="outline" onClick={onDuplicate}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicar
        </Button>
      )}

      {onSend && (
        <Button
          variant="outline"
          onClick={onSend}
          disabled={isSending}
          className="border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar
            </>
          )}
        </Button>
      )}

      <Button
        onClick={onSave}
        disabled={isSaving}
        className="bg-purple-600 hover:bg-purple-700"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </>
        )}
      </Button>
    </div>
  );
}
