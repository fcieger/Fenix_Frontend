'use client';

import React from 'react';
import Layout from '@/components/Layout';
import NFeIntegrationTest from '@/components/NFeIntegrationTest';

export default function TesteIntegracaoNFePage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <NFeIntegrationTest />
      </div>
    </Layout>
  );
}




