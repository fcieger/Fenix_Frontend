"use client";

import { Suspense } from "react";
import { PartnerFormPage } from "@/components/partners/PartnerFormPage";

function CreatePartnerPageContent() {
  return <PartnerFormPage />;
}

export default function CreatePartnerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      }
    >
      <CreatePartnerPageContent />
    </Suspense>
  );
}
