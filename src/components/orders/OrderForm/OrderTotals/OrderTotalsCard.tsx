"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, DollarSign, Percent, Receipt } from "lucide-react";

export interface OrderTotals {
  totalDescontos: number;
  totalImpostos: number;
  impostosAprox: number;
  totalProdutos: number;
  totalPedido: number;
}

export interface OrderTotalsCardProps {
  totals: OrderTotals;
}

export function OrderTotalsCard({ totals }: OrderTotalsCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Totais do Pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Subtotal de Produtos:</span>
          <span className="font-semibold">
            {formatCurrency(totals.totalProdutos)}
          </span>
        </div>

        {totals.totalDescontos > 0 && (
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Descontos:
            </span>
            <span className="font-semibold text-red-600">
              -{formatCurrency(totals.totalDescontos)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600 flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Impostos:
          </span>
          <span className="font-semibold">
            {formatCurrency(totals.totalImpostos)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-4 border-t-2 border-purple-200">
          <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Total do Pedido:
          </span>
          <span className="text-2xl font-bold text-purple-600">
            {formatCurrency(totals.totalPedido)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
