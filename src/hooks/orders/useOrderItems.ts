"use client";

import { useCallback } from "react";
import { useOrderForm } from "@/components/orders/OrderForm/OrderFormProvider";
import type { OrderItem } from "@/components/orders/OrderForm/OrderFormProvider";

/**
 * Hook para gerenciar itens do pedido
 * Fornece métodos para adicionar, editar, remover e reordenar itens
 */
export function useOrderItems() {
  const { items, addItem, updateItem, removeItem, setItems } = useOrderForm();

  const addNewItem = useCallback(
    (item: OrderItem) => {
      addItem(item);
    },
    [addItem]
  );

  const editItem = useCallback(
    (id: string, updates: Partial<OrderItem>) => {
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
