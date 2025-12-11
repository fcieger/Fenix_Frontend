"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { OrderFormProvider } from "@/components/orders/OrderForm/OrderFormProvider";
import { PurchaseOrderForm } from "@/components/orders/PurchaseOrderForm";

function PurchaseOrderPage() {
  const params = useParams();
  const id = params?.id as string;
  const isNovo = id === "novo";
  const orderId = isNovo ? undefined : id;

  return (
    <OrderFormProvider type="purchase" orderId={orderId}>
      <PurchaseOrderForm />
    </OrderFormProvider>
  );
}

// Wrapper com Suspense para usar useParams
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <PurchaseOrderPage />
    </Suspense>
  );
}
