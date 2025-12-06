"use client";

export function ProductLoadingState() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 mt-2">Carregando produtos...</p>
        </div>
      </div>
    </div>
  );
}

