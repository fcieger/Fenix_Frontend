"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import type {
  SalesOrder,
  SalesOrderItem,
} from "@/types/sdk";
import { useSalesOrder } from "@/hooks/queries/useSalesOrders";

export interface OrderTotals {
  totalDescontos: number;
  totalImpostos: number;
  impostosAprox: number;
  totalProdutos: number;
  totalPedido: number;
}

export interface SalesOrderFormContextValue {
  order: SalesOrder | null;
  items: SalesOrderItem[];
  totals: OrderTotals;
  isLoading: boolean;
  error: Error | null;
  orderId?: string;
  addItem: (item: SalesOrderItem) => void;
  updateItem: (id: string, item: Partial<SalesOrderItem>) => void;
  removeItem: (id: string) => void;
  setItems: (items: SalesOrderItem[]) => void;
  setTotals: (totals: Partial<OrderTotals>) => void;
  recalculateTotals: () => void;
  reset: () => void;
}

const SalesOrderFormContext = createContext<SalesOrderFormContextValue | undefined>(
  undefined
);

export interface SalesOrderFormProviderProps {
  children: ReactNode;
  orderId?: string;
}

const initialTotals: OrderTotals = {
  totalDescontos: 0,
  totalImpostos: 0,
  impostosAprox: 0,
  totalProdutos: 0,
  totalPedido: 0,
};

export function SalesOrderFormProvider({
  children,
  orderId,
}: SalesOrderFormProviderProps) {
  const [items, setItemsState] = useState<SalesOrderItem[]>([]);
  const [totals, setTotalsState] = useState<OrderTotals>(initialTotals);
  const [error, setError] = useState<Error | null>(null);

  // Fetch sales order data
  const { data: order, isLoading, error: queryError } = useSalesOrder(orderId || "", {
    enabled: !!orderId,
  });

  // Update items when order loads
  useEffect(() => {
    if (order && order.items) {
      setItemsState(order.items);

      // Calculate initial totals from order
      setTotalsState({
        totalDescontos: (order as any).totalDiscounts || 0,
        totalImpostos: (order as any).totalTaxes || 0,
        impostosAprox: (order as any).totalTaxes || 0,
        totalProdutos: (order as any).subtotal || 0,
        totalPedido: order.total || 0,
      });
    } else if (!orderId) {
      // Reset for new order
      setItemsState([]);
      setTotalsState(initialTotals);
    }
  }, [order, orderId]);

  // Update error state
  useEffect(() => {
    if (queryError) {
      setError(queryError as Error);
    } else {
      setError(null);
    }
  }, [queryError]);

  const addItem = useCallback((item: SalesOrderItem) => {
    setItemsState((prev) => [...prev, item]);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<SalesOrderItem>) => {
    setItemsState((prev) =>
      prev.map((item) => {
        const itemId = item.id || (item as any).productId;
        return itemId === id ? { ...item, ...updates } : item;
      })
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItemsState((prev) =>
      prev.filter((item) => {
        const itemId = item.id || (item as any).productId;
        return itemId !== id;
      })
    );
  }, []);

  const setItems = useCallback((newItems: SalesOrderItem[]) => {
    setItemsState(newItems);
  }, []);

  const setTotals = useCallback((newTotals: Partial<OrderTotals>) => {
    setTotalsState((prev) => ({ ...prev, ...newTotals }));
  }, []);

  const recalculateTotals = useCallback(() => {
    // Calculate totals from items
    const calculatedTotals = items.reduce(
      (acc, item) => {
        const quantity = item.quantity || 0;
        const unitPrice = (item as any).unitPrice || 0;
        const discount = (item as any).discount || 0;
        const taxes = (item as any).taxes || 0;

        const itemSubtotal = quantity * unitPrice;
        const itemTotal = itemSubtotal - discount + taxes;

        acc.totalProdutos += itemSubtotal;
        acc.totalDescontos += discount;
        acc.totalImpostos += taxes;
        acc.totalPedido += itemTotal;

        return acc;
      },
      {
        totalDescontos: 0,
        totalImpostos: 0,
        impostosAprox: 0,
        totalProdutos: 0,
        totalPedido: 0,
      }
    );

    setTotalsState(calculatedTotals);
  }, [items]);

  const reset = useCallback(() => {
    setItemsState([]);
    setTotalsState(initialTotals);
    setError(null);
  }, []);

  const value: SalesOrderFormContextValue = {
    order: order || null,
    items,
    totals,
    isLoading,
    error,
    orderId,
    addItem,
    updateItem,
    removeItem,
    setItems,
    setTotals,
    recalculateTotals,
    reset,
  };

  return (
    <SalesOrderFormContext.Provider value={value}>
      {children}
    </SalesOrderFormContext.Provider>
  );
}

export function useSalesOrderFormContext() {
  const context = useContext(SalesOrderFormContext);
  if (context === undefined) {
    throw new Error("useSalesOrderFormContext must be used within a SalesOrderFormProvider");
  }
  return context;
}



