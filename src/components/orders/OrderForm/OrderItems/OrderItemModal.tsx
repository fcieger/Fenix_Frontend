"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrderItem } from "../OrderFormProvider";

export interface OrderItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: OrderItem) => void;
  item?: OrderItem | null;
  title?: string;
}

export function OrderItemModal({
  isOpen,
  onClose,
  onSave,
  item,
  title = "Adicionar Produto",
}: OrderItemModalProps) {
  const [formData, setFormData] = useState({
    productId: "",
    code: "",
    name: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    unit: "UN",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        productId: (item as any).productId || (item as any).product?.id || "",
        code: (item as any).code || (item as any).product?.code || "",
        name: (item as any).name || (item as any).product?.name || "",
        quantity: (item as any).quantity || 1,
        unitPrice: (item as any).unitPrice || (item as any).price || 0,
        discount: (item as any).discount || 0,
        unit: (item as any).unit || (item as any).unitOfMeasure || "UN",
      });
    } else {
      setFormData({
        productId: "",
        code: "",
        name: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        unit: "UN",
      });
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: any = {
      ...formData,
      id: item ? (item as any).id : undefined,
      product: (item as any)?.product || {
        id: formData.productId,
        code: formData.code,
        name: formData.name,
      },
    };
    onSave(newItem);
    onClose();
  };

  const total = formData.quantity * formData.unitPrice - formData.discount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Código do produto"
              />
            </div>
            <div>
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nome do produto"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                placeholder="UN"
              />
            </div>
            <div>
              <Label htmlFor="unitPrice">Preço Unitário</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unitPrice: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="discount">Desconto</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              value={formData.discount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discount: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total do Item:</span>
              <span className="text-xl font-bold text-purple-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(total)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {item ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
