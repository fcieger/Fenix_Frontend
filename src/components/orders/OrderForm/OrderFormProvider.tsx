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
  PurchaseOrder,
  SalesOrder,
  Quote,
  PurchaseOrderItem,
  SalesOrderItem,
  QuoteItem,
} from "@/types/sdk";
import { usePurchaseOrder } from "@/hooks/queries/usePurchaseOrders";
import { useSalesOrder } from "@/hooks/queries/useSalesOrders";
import { useQuote } from "@/hooks/queries/useQuotes";

export type OrderType = "purchase" | "sales" | "quote";
export type Order = PurchaseOrder | SalesOrder | Quote;
export type OrderItem = PurchaseOrderItem | SalesOrderItem | QuoteItem;

export interface OrderTotals {
  totalDescontos: number;
  totalImpostos: number;
  impostosAprox: number;
  totalProdutos: number;
  totalPedido: number;
}

export interface OrderFormContextValue {
  order: Order | null;
  orderId?: string;
  items: OrderItem[];
  totals: OrderTotals;
  isLoading: boolean;
  error: Error | null;
  orderType: OrderType;
  addItem: (item: OrderItem) => void;
  updateItem: (id: string, item: Partial<OrderItem>) => void;
  removeItem: (id: string) => void;
  setItems: (items: OrderItem[]) => void;
  setTotals: (totals: Partial<OrderTotals>) => void;
  recalculateTotals: () => void;
  reset: () => void;
}

const OrderFormContext = createContext<OrderFormContextValue | undefined>(
  undefined
);

export interface OrderFormProviderProps {
  children: ReactNode;
  type: OrderType;
  orderId?: string;
}

const initialTotals: OrderTotals = {
  totalDescontos: 0,
  totalImpostos: 0,
  impostosAprox: 0,
  totalProdutos: 0,
  totalPedido: 0,
};

export function OrderFormProvider({
  children,
  type,
  orderId,
}: OrderFormProviderProps) {
  const [items, setItemsState] = useState<OrderItem[]>([]);
  const [totals, setTotalsState] = useState<OrderTotals>(initialTotals);
  const [error, setError] = useState<Error | null>(null);

  // Use appropriate hook based on type
  const purchaseQuery = usePurchaseOrder(orderId || "", {
    enabled: type === "purchase" && !!orderId,
  });
  const salesQuery = useSalesOrder(orderId || "", {
    enabled: type === "sales" && !!orderId,
  });
  const quoteQuery = useQuote(orderId || "", {
    enabled: type === "quote" && !!orderId,
  });

  // Get the appropriate query result
  const queryResult =
    type === "purchase"
      ? purchaseQuery
      : type === "sales"
      ? salesQuery
      : quoteQuery;

  const order = queryResult.data as Order | null;
  const isLoading = queryResult.isLoading;
  const queryError = queryResult.error;

  // Update items when order loads
  useEffect(() => {
    if (order) {
      // Extract items from order based on type
      if (type === "purchase" && "items" in order) {
        setItemsState((order as PurchaseOrder).items || []);
      } else if (type === "sales" && "items" in order) {
        setItemsState((order as SalesOrder).items || []);
      } else if (type === "quote" && "items" in order) {
        setItemsState((order as Quote).items || []);
      }

      // Calculate initial totals from order
      if ("total" in order) {
        setTotalsState({
          totalDescontos: (order as any).totalDiscounts || 0,
          totalImpostos: (order as any).totalTaxes || 0,
          impostosAprox: (order as any).totalTaxes || 0,
          totalProdutos: (order as any).subtotal || 0,
          totalPedido: (order as any).total || 0,
        });
      }
    } else if (!orderId) {
      // Reset for new order
      setItemsState([]);
      setTotalsState(initialTotals);
    }
  }, [order, type, orderId]);

  // Update error state
  useEffect(() => {
    if (queryError) {
      setError(queryError as Error);
    } else {
      setError(null);
    }
  }, [queryError]);

  const addItem = useCallback((item: OrderItem) => {
    setItemsState((prev) => [...prev, item]);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<OrderItem>) => {
    setItemsState((prev) =>
      prev.map((item) => {
        const itemId = (item as any).id || (item as any).productId;
        return itemId === id ? { ...item, ...updates } : item;
      })
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItemsState((prev) =>
      prev.filter((item) => {
        const itemId = (item as any).id || (item as any).productId;
        return itemId !== id;
      })
    );
  }, []);

  const setItems = useCallback((newItems: OrderItem[]) => {
    setItemsState(newItems);
  }, []);

  const setTotals = useCallback((newTotals: Partial<OrderTotals>) => {
    setTotalsState((prev) => ({ ...prev, ...newTotals }));
  }, []);

  const recalculateTotals = useCallback(() => {
    // Calculate totals from items
    const calculatedTotals = items.reduce(
      (acc, item) => {
        const quantity = (item as any).quantity || 0;
        const unitPrice = (item as any).unitPrice || (item as any).price || 0;
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

  const value: OrderFormContextValue = {
    order,
    orderId,
    items,
    totals,
    isLoading,
    error,
    orderType: type,
    addItem,
    updateItem,
    removeItem,
    setItems,
    setTotals,
    recalculateTotals,
    reset,
  };

  return (
    <OrderFormContext.Provider value={value}>
      {children}
    </OrderFormContext.Provider>
  );
}

export function useOrderForm() {
  const context = useContext(OrderFormContext);
  if (context === undefined) {
    throw new Error("useOrderForm must be used within an OrderFormProvider");
  }
  return context;
}
