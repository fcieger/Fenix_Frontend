"use client";

import { useCallback } from "react";
import { usePurchaseOrderFormContext } from "@/components/orders/PurchaseOrderForm/PurchaseOrderFormProvider";
import type { PurchaseOrderItem } from "@/types/sdk";

/**
 * Hook para gerenciar itens do pedido de compra
 * Fornece métodos para adicionar, editar, remover e reordenar itens
 * Tipado especificamente para PurchaseOrderItem
 */
export function usePurchaseOrderItems() {
  const { items, addItem, updateItem, removeItem, setItems } = usePurchaseOrderFormContext();

  const addNewItem = useCallback(
    (item: PurchaseOrderItem) => {
      addItem(item);
    },
    [addItem]
  );

  const editItem = useCallback(
    (id: string, updates: Partial<PurchaseOrderItem>) => {
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



