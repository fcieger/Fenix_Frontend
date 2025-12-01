'use client';

import React from 'react';

interface PDFLayoutProps {
  title: string;
  subtitle?: string;
  companyName?: string;
  children: React.ReactNode;
}

export function PDFLayout({ title, subtitle, companyName, children }: PDFLayoutProps) {
  return (
    <div className="pdf-container">
      {/* Header */}
      <div className="pdf-header">
        <h1>{title}</h1>
        {subtitle && <div className="subtitle">{subtitle}</div>}
        {companyName && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
            {companyName}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pdf-content">
        {children}
      </div>
    </div>
  );
}







