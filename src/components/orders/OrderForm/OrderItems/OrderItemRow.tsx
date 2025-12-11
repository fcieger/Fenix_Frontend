"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { OrderItem } from "../OrderFormProvider";

export interface OrderItemRowProps {
  item: OrderItem;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}

export function OrderItemRow({
  item,
  index,
  onEdit,
  onRemove,
}: OrderItemRowProps) {
  const quantity = (item as any).quantity || 0;
  const unitPrice = (item as any).unitPrice || (item as any).price || 0;
  const discount = (item as any).discount || 0;
  const productName =
    (item as any).product?.name || (item as any).name || "Produto";
  const productCode = (item as any).product?.code || (item as any).code || "";
  const unit = (item as any).unit || (item as any).unitOfMeasure || "UN";

  const subtotal = quantity * unitPrice;
  const total = subtotal - discount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                #{index + 1}
              </span>
              <h3 className="font-semibold text-gray-900">{productName}</h3>
              {productCode && (
                <span className="text-sm text-gray-500">({productCode})</span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Quantidade:</span>
                <p className="font-medium">
                  {quantity} {unit}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Preço Unit.:</span>
                <p className="font-medium">{formatCurrency(unitPrice)}</p>
              </div>
              {discount > 0 && (
                <div>
                  <span className="text-gray-500">Desconto:</span>
                  <p className="font-medium text-red-600">
                    -{formatCurrency(discount)}
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Total:</span>
                <p className="font-medium text-purple-600">
                  {formatCurrency(total)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="hover:bg-purple-50"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              onClick={onRemove}
              variant="outline"
              size="sm"
              className="hover:bg-red-50 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
