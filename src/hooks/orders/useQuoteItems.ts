"use client";

import { useCallback } from "react";
import { useQuoteFormContext } from "@/components/orders/QuoteForm/QuoteFormProvider";
import type { QuoteItem } from "@/types/sdk";

/**
 * Hook para gerenciar itens do orçamento
 * Fornece métodos para adicionar, editar, remover e reordenar itens
 * Tipado especificamente para QuoteItem
 */
export function useQuoteItems() {
  const { items, addItem, updateItem, removeItem, setItems } = useQuoteFormContext();

  const addNewItem = useCallback(
    (item: QuoteItem) => {
      addItem(item);
    },
    [addItem]
  );

  const editItem = useCallback(
    (id: string, updates: Partial<QuoteItem>) => {
      updateItem(id, updates);
    },
    [updateItem]
  );

  const deleteItem = useCallback(
    (id: string) => {
      removeItem(id);
    },
    [removeItem]
  );

  const reorderItems = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newItems = [...items];
      const [removed] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, removed);
      setItems(newItems);
    },
    [items, setItems]
  );

  const clearItems = useCallback(() => {
    setItems([]);
  }, [setItems]);

  return {
    items,
    addItem: addNewItem,
    editItem,
    removeItem: deleteItem,
    reorderItems,
    clearItems,
    itemCount: items.length,
  };
}



