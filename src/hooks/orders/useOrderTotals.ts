"use client";

import { useMemo, useCallback } from "react";
import { useOrderForm } from "@/components/orders/OrderForm/OrderFormProvider";
import type { OrderTotals } from "@/components/orders/OrderForm/OrderFormProvider";

/**
 * Hook para calcular totais do pedido
 * Calcula subtotal, impostos, descontos e total final
 */
export function useOrderTotals() {
  const { items, totals, setTotals, recalculateTotals } = useOrderForm();

  // Calcular totais baseados nos itens
  const calculatedTotals = useMemo(() => {
    const calculated: OrderTotals = items.reduce(
      (acc, item) => {
        const quantity = (item as any).quantity || 0;
        const unitPrice = (item as any).unitPrice || (item as any).price || 0;
        const discount = (item as any).discount || 0;
        const taxes = (item as any).taxes || (item as any).totalTaxes || 0;

        const itemSubtotal = quantity * unitPrice;
        const itemTotal = itemSubtotal - discount + taxes;

        acc.totalProdutos += itemSubtotal;
        acc.totalDescontos += discount;
        acc.totalImpostos += taxes;
        acc.totalPedido += itemTotal;

        return acc;
      },
      {
        totalDescontos: 0,
        totalImpostos: 0,
        impostosAprox: 0,
        totalProdutos: 0,
        totalPedido: 0,
      }
    );

    // Aproximação de impostos igual ao total de impostos se não calculado separadamente
    calculated.impostosAprox = calculated.totalImpostos;

    return calculated;
  }, [items]);

  // Atualizar totais quando itens mudarem
  const updateTotals = useCallback(
    (newTotals: Partial<OrderTotals>) => {
      setTotals(newTotals);
    },
    [setTotals]
  );

  // Recalcular totais manualmente
  const recalculate = useCallback(() => {
    recalculateTotals();
  }, [recalculateTotals]);

  return {
    totals: calculatedTotals,
    originalTotals: totals,
    updateTotals,
    recalculate,
    formatCurrency: (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    },
  };
}
