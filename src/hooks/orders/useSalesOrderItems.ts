"use client";

import { useCallback } from "react";
import { useSalesOrderFormContext } from "@/components/orders/SalesOrderForm/SalesOrderFormProvider";
import type { SalesOrderItem } from "@/types/sdk";

/**
 * Hook para gerenciar itens do pedido de venda
 * Fornece métodos para adicionar, editar, remover e reordenar itens
 * Tipado especificamente para SalesOrderItem
 */
export function useSalesOrderItems() {
  const { items, addItem, updateItem, removeItem, setItems } = useSalesOrderFormContext();

  const addNewItem = useCallback(
    (item: SalesOrderItem) => {
      addItem(item);
    },
    [addItem]
  );

  const editItem = useCallback(
    (id: string, updates: Partial<SalesOrderItem>) => {
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



