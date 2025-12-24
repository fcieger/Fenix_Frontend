"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSalesOrderFormContext } from "@/components/orders/SalesOrderForm/SalesOrderFormProvider";
import {
  useCreateSalesOrder,
  useUpdateSalesOrder,
} from "@/hooks/queries/useSalesOrders";
import { toast } from "sonner";
import type { CreateSalesOrderDto, UpdateSalesOrderDto } from "@/types/sdk";

/**
 * Hook para gerenciar formulário de pedido de venda
 * Integra context, mutations e lógica de negócio específica para SalesOrder
 */
export function useSalesOrderForm() {
  const router = useRouter();
  const context = useSalesOrderFormContext();
  const { order, items, totals, isLoading, error, orderId, reset } = context;

  // Mutations específicas para SalesOrder
  const createSalesOrder = useCreateSalesOrder();
  const updateSalesOrder = useUpdateSalesOrder();

  const isNew = !orderId;
  const isSaving = createSalesOrder.isPending || updateSalesOrder.isPending;

  // Salvar pedido de venda
  const save = useCallback(
    async (data?: CreateSalesOrderDto | UpdateSalesOrderDto) => {
      try {
        const orderData = data || {
          ...order,
          items,
        } as CreateSalesOrderDto | UpdateSalesOrderDto;

        if (isNew) {
          // Criar novo pedido de venda
          const result = await createSalesOrder.mutateAsync(orderData as CreateSalesOrderDto);
          toast.success("Pedido de venda criado com sucesso!");
          router.push(`/sales/${result.id}`);
        } else {
          // Atualizar pedido de venda existente
          await updateSalesOrder.mutateAsync({
            id: orderId!,
            data: orderData as UpdateSalesOrderDto,
          });
          toast.success("Pedido de venda atualizado com sucesso!");
        }
      } catch (error: any) {
        toast.error(error?.message || "Erro ao salvar pedido de venda");
        throw error;
      }
    },
    [order, items, isNew, orderId, createSalesOrder, updateSalesOrder, router]
  );

  // Cancelar e voltar
  const cancel = useCallback(() => {
    if (isNew) {
      router.back();
    } else {
      router.push("/sales");
    }
  }, [isNew, router]);

  // Duplicar pedido de venda
  const duplicate = useCallback(async () => {
    if (!order) return;

    try {
      const duplicatedData: CreateSalesOrderDto = {
        ...order,
        id: undefined,
        number: undefined,
        status: "draft" as any,
        items: items.map((item) => ({
          ...item,
          id: undefined,
        })),
      } as CreateSalesOrderDto;

      const result = await createSalesOrder.mutateAsync(duplicatedData);
      toast.success("Pedido de venda duplicado com sucesso!");
      router.push(`/sales/${result.id}`);
    } catch (error: any) {
      toast.error(error?.message || "Erro ao duplicar pedido de venda");
    }
  }, [order, items, createSalesOrder, router]);

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



