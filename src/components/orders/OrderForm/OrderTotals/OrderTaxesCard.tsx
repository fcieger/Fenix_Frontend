"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export interface TaxDetail {
  name: string;
  value: number;
  base?: number;
  rate?: number;
}

export interface OrderTaxesCardProps {
  taxes?: TaxDetail[];
  totalTaxes?: number;
}

export function OrderTaxesCard({
  taxes = [],
  totalTaxes = 0,
}: OrderTaxesCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (taxes.length === 0 && totalTaxes === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Impostos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Nenhum imposto calculado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Detalhamento de Impostos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {taxes.map((tax, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 border-b last:border-b-0"
          >
            <div>
              <span className="font-medium text-gray-900">{tax.name}</span>
              {tax.base && (
                <p className="text-xs text-gray-500">
                  Base: {formatCurrency(tax.base)}
                  {tax.rate && ` | Alíquota: ${formatPercent(tax.rate)}`}
                </p>
              )}
            </div>
            <span className="font-semibold">{formatCurrency(tax.value)}</span>
          </div>
        ))}
        {totalTaxes > 0 && (
          <div className="flex justify-between items-center pt-3 border-t-2">
            <span className="font-bold text-gray-900">Total de Impostos:</span>
            <span className="text-lg font-bold text-purple-600">
              {formatCurrency(totalTaxes)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
