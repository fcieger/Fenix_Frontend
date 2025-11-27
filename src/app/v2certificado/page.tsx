'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function V2CertificadoRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar imediatamente para a página correta
    router.replace('/settings/certificado');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="text-purple-600 mt-4 font-medium">Redirecionando...</p>
      </div>
    </div>
  );
}