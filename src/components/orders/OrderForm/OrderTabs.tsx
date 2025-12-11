"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Receipt, Truck, FileText } from "lucide-react";
import type { ReactNode } from "react";

export interface OrderTabsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  itemsContent: ReactNode;
  taxesContent?: ReactNode;
  shippingContent?: ReactNode;
  notesContent?: ReactNode;
  showTaxes?: boolean;
  showShipping?: boolean;
  showNotes?: boolean;
}

export function OrderTabs({
  activeTab = "items",
  onTabChange,
  itemsContent,
  taxesContent,
  shippingContent,
  notesContent,
  showTaxes = true,
  showShipping = true,
  showNotes = true,
}: OrderTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        <TabsTrigger value="items" className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          <span className="hidden sm:inline">Produtos</span>
        </TabsTrigger>
        {showTaxes && (
          <TabsTrigger value="taxes" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            <span className="hidden sm:inline">Impostos</span>
          </TabsTrigger>
        )}
        {showShipping && (
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Entrega</span>
          </TabsTrigger>
        )}
        {showNotes && (
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Observações</span>
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="items" className="mt-6">
        {itemsContent}
      </TabsContent>

      {showTaxes && (
        <TabsContent value="taxes" className="mt-6">
          {taxesContent || (
            <p className="text-gray-500">Nenhum imposto calculado</p>
          )}
        </TabsContent>
      )}

      {showShipping && (
        <TabsContent value="shipping" className="mt-6">
          {shippingContent || (
            <p className="text-gray-500">Nenhuma informação de entrega</p>
          )}
        </TabsContent>
      )}

      {showNotes && (
        <TabsContent value="notes" className="mt-6">
          {notesContent || <p className="text-gray-500">Nenhuma observação</p>}
        </TabsContent>
      )}
    </Tabs>
  );
}
