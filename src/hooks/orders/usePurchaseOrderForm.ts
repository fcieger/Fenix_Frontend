"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePurchaseOrderFormContext } from "@/components/orders/PurchaseOrderForm/PurchaseOrderFormProvider";
import {
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
} from "@/hooks/queries/usePurchaseOrders";
import { toast } from "sonner";
import type { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from "@/types/sdk";

/**
 * Hook para gerenciar formulário de pedido de compra
 * Integra context, mutations e lógica de negócio específica para PurchaseOrder
 */
export function usePurchaseOrderForm() {
  const router = useRouter();
  const context = usePurchaseOrderFormContext();
  const { order, items, totals, isLoading, error, orderId, reset } = context;

  // Mutations específicas para PurchaseOrder
  const createPurchaseOrder = useCreatePurchaseOrder();
  const updatePurchaseOrder = useUpdatePurchaseOrder();

  const isNew = !orderId;
  const isSaving = createPurchaseOrder.isPending || updatePurchaseOrder.isPending;

  // Salvar pedido de compra
  const save = useCallback(
    async (data?: CreatePurchaseOrderDto | UpdatePurchaseOrderDto) => {
      try {
        const orderData = data || {
          ...order,
          items,
        } as CreatePurchaseOrderDto | UpdatePurchaseOrderDto;

        if (isNew) {
          // Criar novo pedido de compra
          const result = await createPurchaseOrder.mutateAsync(orderData as CreatePurchaseOrderDto);
          toast.success("Pedido de compra criado com sucesso!");
          router.push(`/purchases/${result.id}`);
        } else {
          // Atualizar pedido de compra existente
          await updatePurchaseOrder.mutateAsync({
            id: orderId!,
            data: orderData as UpdatePurchaseOrderDto,
          });
          toast.success("Pedido de compra atualizado com sucesso!");
        }
      } catch (error: any) {
        toast.error(error?.message || "Erro ao salvar pedido de compra");
        throw error;
      }
    },
    [order, items, isNew, orderId, createPurchaseOrder, updatePurchaseOrder, router]
  );

  // Cancelar e voltar
  const cancel = useCallback(() => {
    if (isNew) {
      router.back();
    } else {
      router.push("/purchases");
    }
  }, [isNew, router]);

  // Duplicar pedido de compra
  const duplicate = useCallback(async () => {
    if (!order) return;

    try {
      const duplicatedData: CreatePurchaseOrderDto = {
        ...order,
        id: undefined,
        number: undefined,
        status: "draft" as any,
        items: items.map((item) => ({
          ...item,
          id: undefined,
        })),
      } as CreatePurchaseOrderDto;

      const result = await createPurchaseOrder.mutateAsync(duplicatedData);
      toast.success("Pedido de compra duplicado com sucesso!");
      router.push(`/purchases/${result.id}`);
    } catch (error: any) {
      toast.error(error?.message || "Erro ao duplicar pedido de compra");
    }
  }, [order, items, createPurchaseOrder, router]);

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



