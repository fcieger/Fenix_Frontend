"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOrderForm as useOrderFormContext } from "@/components/orders/OrderForm/OrderFormProvider";
import type { OrderType } from "@/components/orders/OrderForm/OrderFormProvider";
import {
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
} from "@/hooks/queries/usePurchaseOrders";
import {
  useCreateSalesOrder,
  useUpdateSalesOrder,
} from "@/hooks/queries/useSalesOrders";
import { useCreateQuote, useUpdateQuote } from "@/hooks/queries/useQuotes";
import { toast } from "sonner";

/**
 * Hook principal para gerenciar formulário de pedido
 * Integra context, mutations e lógica de negócio
 */
export function useOrderForm(orderType: OrderType) {
  const router = useRouter();
  const context = useOrderFormContext();
  const { order, items, totals, isLoading, error, orderId, reset } = context;

  // Selecionar mutations apropriadas baseado no tipo
  const createPurchaseOrder = useCreatePurchaseOrder();
  const updatePurchaseOrder = useUpdatePurchaseOrder();
  const createSalesOrder = useCreateSalesOrder();
  const updateSalesOrder = useUpdateSalesOrder();
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();

  const isNew = !orderId;
  const isSaving =
    createPurchaseOrder.isPending ||
    updatePurchaseOrder.isPending ||
    createSalesOrder.isPending ||
    updateSalesOrder.isPending ||
    createQuote.isPending ||
    updateQuote.isPending;

  // Salvar pedido
  const save = useCallback(
    async (data?: any) => {
      try {
        const orderData = data || {
          ...order,
          items,
        };

        if (isNew) {
          // Criar novo pedido
          if (orderType === "purchase") {
            const result = await createPurchaseOrder.mutateAsync(orderData);
            toast.success("Pedido de compra criado com sucesso!");
            router.push(`/purchases/${result.id}`);
          } else if (orderType === "sales") {
            const result = await createSalesOrder.mutateAsync(orderData);
            toast.success("Pedido de venda criado com sucesso!");
            router.push(`/sales/${result.id}`);
          } else if (orderType === "quote") {
            const result = await createQuote.mutateAsync(orderData);
            toast.success("Orçamento criado com sucesso!");
            router.push(`/quotes/${result.id}`);
          }
        } else {
          // Atualizar pedido existente
          if (orderType === "purchase") {
            await updatePurchaseOrder.mutateAsync({
              id: orderId!,
              data: orderData,
            });
            toast.success("Pedido de compra atualizado com sucesso!");
          } else if (orderType === "sales") {
            await updateSalesOrder.mutateAsync({
              id: orderId!,
              data: orderData,
            });
            toast.success("Pedido de venda atualizado com sucesso!");
          } else if (orderType === "quote") {
            await updateQuote.mutateAsync({
              id: orderId!,
              data: orderData,
            });
            toast.success("Orçamento atualizado com sucesso!");
          }
        }
      } catch (error: any) {
        toast.error(error?.message || "Erro ao salvar pedido");
        throw error;
      }
    },
    [
      order,
      items,
      isNew,
      orderType,
      orderId,
      createPurchaseOrder,
      updatePurchaseOrder,
      createSalesOrder,
      updateSalesOrder,
      createQuote,
      updateQuote,
      router,
    ]
  );

  // Cancelar e voltar
  const cancel = useCallback(() => {
    if (isNew) {
      router.back();
    } else {
      router.push(
        orderType === "purchase"
          ? "/purchases"
          : orderType === "sales"
          ? "/sales"
          : "/quotes"
      );
    }
  }, [isNew, orderType, router]);

  // Duplicar pedido
  const duplicate = useCallback(async () => {
    if (!order) return;

    try {
      const duplicatedData = {
        ...order,
        id: undefined,
        number: undefined,
        status: "draft",
        items: items.map((item) => ({
          ...item,
          id: undefined,
        })),
      };

      if (orderType === "purchase") {
        const result = await createPurchaseOrder.mutateAsync(duplicatedData);
        toast.success("Pedido duplicado com sucesso!");
        router.push(`/purchases/${result.id}`);
      } else if (orderType === "sales") {
        const result = await createSalesOrder.mutateAsync(duplicatedData);
        toast.success("Pedido duplicado com sucesso!");
        router.push(`/sales/${result.id}`);
      } else if (orderType === "quote") {
        const result = await createQuote.mutateAsync(duplicatedData);
        toast.success("Orçamento duplicado com sucesso!");
        router.push(`/quotes/${result.id}`);
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao duplicar pedido");
    }
  }, [
    order,
    items,
    orderType,
    createPurchaseOrder,
    createSalesOrder,
    createQuote,
    router,
  ]);

  return {
    ...context,
    save,
    cancel,
    duplicate,
    isNew,
    isSaving,
    orderId,
    reset,
  };
}
