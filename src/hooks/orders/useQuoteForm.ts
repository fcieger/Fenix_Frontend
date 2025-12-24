"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuoteFormContext } from "@/components/orders/QuoteForm/QuoteFormProvider";
import {
  useCreateQuote,
  useUpdateQuote,
} from "@/hooks/queries/useQuotes";
import { toast } from "sonner";
import type { CreateQuoteDto, UpdateQuoteDto } from "@/types/sdk";

/**
 * Hook para gerenciar formulário de orçamento
 * Integra context, mutations e lógica de negócio específica para Quote
 */
export function useQuoteForm() {
  const router = useRouter();
  const context = useQuoteFormContext();
  const { order, items, totals, isLoading, error, orderId, reset } = context;

  // Mutations específicas para Quote
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();

  const isNew = !orderId;
  const isSaving = createQuote.isPending || updateQuote.isPending;

  // Salvar orçamento
  const save = useCallback(
    async (data?: CreateQuoteDto | UpdateQuoteDto) => {
      try {
        const orderData = data || {
          ...order,
          items,
        } as CreateQuoteDto | UpdateQuoteDto;

        if (isNew) {
          // Criar novo orçamento
          const result = await createQuote.mutateAsync(orderData as CreateQuoteDto);
          toast.success("Orçamento criado com sucesso!");
          router.push(`/quotes/${result.id}`);
        } else {
          // Atualizar orçamento existente
          await updateQuote.mutateAsync({
            id: orderId!,
            data: orderData as UpdateQuoteDto,
          });
          toast.success("Orçamento atualizado com sucesso!");
        }
      } catch (error: any) {
        toast.error(error?.message || "Erro ao salvar orçamento");
        throw error;
      }
    },
    [order, items, isNew, orderId, createQuote, updateQuote, router]
  );

  // Cancelar e voltar
  const cancel = useCallback(() => {
    if (isNew) {
      router.back();
    } else {
      router.push("/quotes");
    }
  }, [isNew, router]);

  // Duplicar orçamento
  const duplicate = useCallback(async () => {
    if (!order) return;

    try {
      const duplicatedData: CreateQuoteDto = {
        ...order,
        id: undefined,
        number: undefined,
        status: "draft" as any,
        items: items.map((item) => ({
          ...item,
          id: undefined,
        })),
      } as CreateQuoteDto;

      const result = await createQuote.mutateAsync(duplicatedData);
      toast.success("Orçamento duplicado com sucesso!");
      router.push(`/quotes/${result.id}`);
    } catch (error: any) {
      toast.error(error?.message || "Erro ao duplicar orçamento");
    }
  }, [order, items, createQuote, router]);

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



