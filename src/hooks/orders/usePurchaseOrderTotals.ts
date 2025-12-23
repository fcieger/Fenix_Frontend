"use client";

import { useMemo, useCallback } from "react";
import { usePurchaseOrderFormContext } from "@/components/orders/PurchaseOrderForm/PurchaseOrderFormProvider";
import type { OrderTotals } from "@/components/orders/PurchaseOrderForm/PurchaseOrderFormProvider";

/**
 * Hook para calcular totais do pedido de compra
 * Calcula subtotal, impostos, descontos e total final
 */
export function usePurchaseOrderTotals() {
  const { items, totals, setTotals, recalculateTotals } = usePurchaseOrderFormContext();

  // Calcular totais baseados nos itens
  const calculatedTotals = useMemo(() => {
    const calculated: OrderTotals = items.reduce(
      (acc, item) => {
        const quantity = item.quantity || 0;
        const unitPrice = (item as any).unitPrice || 0;
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

    calculated.impostosAprox = calculated.totalImpostos;
    return calculated;
  }, [items]);

  const updateTotals = useCallback(
    (newTotals: Partial<OrderTotals>) => {
      setTotals(newTotals);
    },
    [setTotals]
  );

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



