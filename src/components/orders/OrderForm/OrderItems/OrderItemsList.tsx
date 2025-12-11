"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOrderForm } from "../OrderFormProvider";
import { OrderItemRow } from "./OrderItemRow";

export interface OrderItemsListProps {
  onAddItem: () => void;
  onEditItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
}

export function OrderItemsList({
  onAddItem,
  onEditItem,
  onRemoveItem,
}: OrderItemsListProps) {
  const { items } = useOrderForm();

  if (items.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg font-medium mb-2">
            Nenhum produto adicionado
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Adicione produtos ao pedido para começar
          </p>
          <Button
            onClick={onAddItem}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Produto
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const itemId =
          (item as any).id || (item as any).productId || `item-${index}`;
        return (
          <motion.div
            key={itemId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <OrderItemRow
              item={item}
              index={index}
              onEdit={() => onEditItem(itemId)}
              onRemove={() => onRemoveItem(itemId)}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
