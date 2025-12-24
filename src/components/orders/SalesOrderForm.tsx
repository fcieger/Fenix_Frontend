"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSalesOrderForm } from "@/hooks/orders/useSalesOrderForm";
import { useSalesOrderItems } from "@/hooks/orders/useSalesOrderItems";
import { useSalesOrderTotals } from "@/hooks/orders/useSalesOrderTotals";
import { useSalesOrderTaxes } from "@/hooks/orders/useSalesOrderTaxes";
import { OrderHeader } from "./OrderForm/OrderHeader";
import { OrderItemsList } from "./OrderForm/OrderItems/OrderItemsList";
import { OrderItemModal } from "./OrderForm/OrderItems/OrderItemModal";
import { OrderTotalsCard } from "./OrderForm/OrderTotals/OrderTotalsCard";
import { OrderTaxesCard } from "./OrderForm/OrderTotals/OrderTaxesCard";
import { OrderActions } from "./OrderForm/OrderActions";
import { OrderTabs } from "./OrderForm/OrderTabs";
import { Card, CardContent } from "@/components/ui/card";

export function SalesOrderForm() {
  const router = useRouter();
  const orderForm = useSalesOrderForm();
  const { items, addItem, editItem, removeItem } = useSalesOrderItems();
  const { totals, formatCurrency } = useSalesOrderTotals();
  const { taxDetails, totalTaxes } = useSalesOrderTaxes();

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
      console.error("Error saving order:", error);
    }
  };

  const handleCancel = () => {
    orderForm.cancel();
  };

  const handleBack = () => {
    router.back();
  };

  const handleExportPDF = () => {
    // TODO: Implementar exportação PDF
    console.log("Export PDF");
  };

  return (
    <div className="space-y-6">
      <OrderHeader
        orderType="sales"
        onBack={handleBack}
        onSave={handleSave}
        onAddProduct={handleAddItem}
        onExportPDF={handleExportPDF}
        isSaving={orderForm.isSaving}
        totalItems={items.length}
        totalValue={totals.totalPedido}
        title={orderForm.isNew ? "Nova Venda" : "Editar Venda"}
        description="Gerencie produtos, impostos e configurações do pedido de venda"
        status={(orderForm.order as any)?.status}
        showStatus={!!orderForm.order}
        orderId={orderForm.orderId}
      />

      <OrderTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        itemsContent={
          <OrderItemsList
            items={items}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onRemoveItem={handleRemoveItem}
          />
        }
        taxesContent={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderTotalsCard totals={totals} />
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
                Observações do pedido serão implementadas aqui
              </p>
            </CardContent>
          </Card>
        }
      />

      <OrderActions
        orderType="sales"
        onSave={handleSave}
        onCancel={handleCancel}
        onDuplicate={orderForm.order ? orderForm.duplicate : undefined}
        isSaving={orderForm.isSaving}
        orderId={orderForm.orderId}
      />

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
