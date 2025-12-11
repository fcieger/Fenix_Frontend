"use client";

import { useMemo } from "react";
import { useOrderForm } from "@/components/orders/OrderForm/OrderFormProvider";
import type { TaxDetail } from "@/components/orders/OrderForm/OrderTotals/OrderTaxesCard";

/**
 * Hook para calcular e gerenciar impostos do pedido
 * Extrai informações de impostos dos itens e calcula totais por tipo
 */
export function useOrderTaxes() {
  const { items, totals } = useOrderForm();

  // Extrair detalhes de impostos dos itens
  const taxDetails = useMemo(() => {
    const taxMap = new Map<string, TaxDetail>();

    items.forEach((item) => {
      const itemTaxes = (item as any).taxes || {};
      const itemSubtotal =
        ((item as any).quantity || 0) *
        ((item as any).unitPrice || (item as any).price || 0);

      // Processar diferentes tipos de impostos
      if (itemTaxes.icms) {
        const existing = taxMap.get("ICMS") || {
          name: "ICMS",
          value: 0,
          base: 0,
          rate: 0,
        };
        existing.value += itemTaxes.icms.value || 0;
        existing.base += itemTaxes.icms.base || itemSubtotal;
        taxMap.set("ICMS", existing);
      }

      if (itemTaxes.ipi) {
        const existing = taxMap.get("IPI") || {
          name: "IPI",
          value: 0,
          base: 0,
          rate: 0,
        };
        existing.value += itemTaxes.ipi.value || 0;
        existing.base += itemTaxes.ipi.base || itemSubtotal;
        taxMap.set("IPI", existing);
      }

      if (itemTaxes.pis) {
        const existing = taxMap.get("PIS") || {
          name: "PIS",
          value: 0,
          base: 0,
          rate: 0,
        };
        existing.value += itemTaxes.pis.value || 0;
        existing.base += itemTaxes.pis.base || itemSubtotal;
        taxMap.set("PIS", existing);
      }

      if (itemTaxes.cofins) {
        const existing = taxMap.get("COFINS") || {
          name: "COFINS",
          value: 0,
          base: 0,
          rate: 0,
        };
        existing.value += itemTaxes.cofins.value || 0;
        existing.base += itemTaxes.cofins.base || itemSubtotal;
        taxMap.set("COFINS", existing);
      }
    });

    // Calcular alíquotas
    const details: TaxDetail[] = Array.from(taxMap.values()).map((tax) => ({
      ...tax,
      rate: tax.base > 0 ? (tax.value / tax.base) * 100 : 0,
    }));

    return details;
  }, [items]);

  const totalTaxes = totals.totalImpostos;

  return {
    taxDetails,
    totalTaxes,
    hasTaxes: taxDetails.length > 0 || totalTaxes > 0,
    formatCurrency: (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    },
    formatPercent: (value: number) => {
      return `${value.toFixed(2)}%`;
    },
  };
}
