"use client";

import { useMemo } from "react";
import { useQuoteFormContext } from "@/components/orders/QuoteForm/QuoteFormProvider";
import type { TaxDetail } from "@/components/orders/OrderForm/OrderTotals/OrderTaxesCard";

/**
 * Hook para calcular e gerenciar impostos do orçamento
 * Extrai informações de impostos dos itens e calcula totais por tipo
 */
export function useQuoteTaxes() {
  const { items, totals } = useQuoteFormContext();

  const taxDetails = useMemo(() => {
    const taxMap = new Map<string, TaxDetail>();

    items.forEach((item) => {
      const itemTaxes = (item as any).taxes || {};
      const itemSubtotal = (item.quantity || 0) * ((item as any).unitPrice || 0);

      if (itemTaxes.icms) {
        const existing = taxMap.get("ICMS") || { name: "ICMS", value: 0, base: 0, rate: 0 };
        existing.value += itemTaxes.icms.value || 0;
        existing.base += itemTaxes.icms.base || itemSubtotal;
        taxMap.set("ICMS", existing);
      }

      if (itemTaxes.ipi) {
        const existing = taxMap.get("IPI") || { name: "IPI", value: 0, base: 0, rate: 0 };
        existing.value += itemTaxes.ipi.value || 0;
        existing.base += itemTaxes.ipi.base || itemSubtotal;
        taxMap.set("IPI", existing);
      }

      if (itemTaxes.pis) {
        const existing = taxMap.get("PIS") || { name: "PIS", value: 0, base: 0, rate: 0 };
        existing.value += itemTaxes.pis.value || 0;
        existing.base += itemTaxes.pis.base || itemSubtotal;
        taxMap.set("PIS", existing);
      }

      if (itemTaxes.cofins) {
        const existing = taxMap.get("COFINS") || { name: "COFINS", value: 0, base: 0, rate: 0 };
        existing.value += itemTaxes.cofins.value || 0;
        existing.base += itemTaxes.cofins.base || itemSubtotal;
        taxMap.set("COFINS", existing);
      }
    });

    taxMap.forEach((tax) => {
      if (tax.base && tax.base > 0) {
        tax.rate = (tax.value / tax.base) * 100;
      }
    });

    return Array.from(taxMap.values());
  }, [items]);

  const totalTaxes = useMemo(() => {
    return taxDetails.reduce((sum, tax) => sum + tax.value, 0);
  }, [taxDetails]);

  return {
    taxDetails,
    totalTaxes,
    impostosAprox: totals.impostosAprox,
  };
}



