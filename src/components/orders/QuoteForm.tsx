"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderForm } from "@/hooks/orders/useOrderForm";
import { useOrderItems } from "@/hooks/orders/useOrderItems";
import { useOrderTotals } from "@/hooks/orders/useOrderTotals";
import { useOrderTaxes } from "@/hooks/orders/useOrderTaxes";
import { OrderHeader } from "./OrderForm/OrderHeader";
import { OrderItemsList } from "./OrderForm/OrderItems/OrderItemsList";
import { OrderItemModal } from "./OrderForm/OrderItems/OrderItemModal";
import { OrderTotalsCard } from "./OrderForm/OrderTotals/OrderTotalsCard";
import { OrderTaxesCard } from "./OrderForm/OrderTotals/OrderTaxesCard";
import { OrderActions } from "./OrderForm/OrderActions";
import { OrderTabs } from "./OrderForm/OrderTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateSalesOrder } from "@/hooks/queries/useSalesOrders";
import { toast } from "sonner";

export function QuoteForm() {
  const router = useRouter();
  const orderForm = useOrderForm("quote");
  const { items, addItem, editItem, removeItem } = useOrderItems();
  const { totals, formatCurrency } = useOrderTotals();
  const { taxDetails, totalTaxes } = useOrderTaxes();
  const createSalesOrder = useCreateSalesOrder();

  const [activeTab, setActiveTab] = useState("items");
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleAddItem = () => {
    setEditingItem(null);
    setShowItemModal(true);
  };

  const handleEditItem = (itemId: string) => {
    const item = items.find(
      (i) => (i as any).id === itemId || (i as any).productId === itemId
    );
    setEditingItem(item || null);
    setShowItemModal(true);
  };

  const handleSaveItem = (item: any) => {
    if (editingItem) {
      const itemId = (editingItem as any).id || (editingItem as any).productId;
      editItem(itemId, item);
    } else {
      addItem(item);
    }
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  const handleSave = async () => {
    try {
      await orderForm.save();
    } catch (error) {
      console.error("Error saving quote:", error);
    }
  };

  const handleCancel = () => {
    orderForm.cancel();
  };

  const handleBack = () => {
    router.back();
  };

  const handleConvertToOrder = async () => {
    if (!orderForm.orderId) return;

    try {
      const result = await createSalesOrder.mutateAsync({
        quoteId: orderForm.orderId,
      } as any);
      toast.success("Orçamento convertido em pedido de venda!");
      router.push(`/sales/${result.id}`);
    } catch (error: any) {
      toast.error(error?.message || "Erro ao converter orçamento");
    }
  };

  return (
    <div className="space-y-6">
      <OrderHeader
        orderType="quote"
        onBack={handleBack}
        onSave={handleSave}
        onAddProduct={handleAddItem}
        isSaving={orderForm.isSaving}
        totalItems={items.length}
        totalValue={totals.totalPedido}
        title={orderForm.isNew ? "Novo Orçamento" : "Editar Orçamento"}
        description="Gerencie produtos, impostos e configurações do orçamento"
        status={(orderForm.order as any)?.status}
        showStatus={!!orderForm.order}
        orderId={orderForm.orderId}
      />

      <OrderTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        itemsContent={
          <OrderItemsList
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onRemoveItem={handleRemoveItem}
          />
        }
        taxesContent={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderTotalsCard />
            <OrderTaxesCard taxes={taxDetails} totalTaxes={totalTaxes} />
          </div>
        }
        shippingContent={
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500">
                Configurações de entrega serão implementadas aqui
              </p>
            </CardContent>
          </Card>
        }
        notesContent={
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500">
                Observações do orçamento serão implementadas aqui
              </p>
            </CardContent>
          </Card>
        }
      />

      <div className="flex items-center justify-between gap-3 pt-4 border-t">
        {orderForm.orderId && (
          <Button
            onClick={handleConvertToOrder}
            className="bg-green-600 hover:bg-green-700"
            disabled={createSalesOrder.isPending}
          >
            Converter em Pedido de Venda
          </Button>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <OrderActions
            orderType="quote"
            onSave={handleSave}
            onCancel={handleCancel}
            onDuplicate={orderForm.order ? orderForm.duplicate : undefined}
            isSaving={orderForm.isSaving}
            orderId={orderForm.orderId}
          />
        </div>
      </div>

      <OrderItemModal
        isOpen={showItemModal}
        onClose={() => {
          setShowItemModal(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        item={editingItem}
        title={editingItem ? "Editar Produto" : "Adicionar Produto"}
      />
    </div>
  );
}
