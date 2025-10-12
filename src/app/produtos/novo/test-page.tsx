'use client';

import { useState } from 'react';

export default function TestPage() {
  const [test, setTest] = useState('Hello World');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900">Test Page</h1>
      <p className="text-gray-600">{test}</p>
    </div>
  );
}
