'use client';

import React from 'react';

interface BandeiraEstadoProps {
  uf: string;
  className?: string;
}

const BandeiraEstado: React.FC<BandeiraEstadoProps> = ({ uf, className = "w-6 h-6" }) => {
  const getBandeiraSVG = (uf: string) => {
    const bandeiras: Record<string, JSX.Element> = {
      'AC': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FF0000"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FF0000"/>
          <circle cx="50" cy="35" r="8" fill="#FFD700"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="12" fontWeight="bold">AC</text>
        </svg>
      ),
      'AL': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#FF0000"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <circle cx="50" cy="35" r="6" fill="#FFD700"/>
          <text x="50" y="40" textAnchor="middle" fill="#FF0000" fontSize="12" fontWeight="bold">AL</text>
        </svg>
      ),
      'AP': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">AP</text>
        </svg>
      ),
      'AM': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#00AA00"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFD700"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFD700"/>
          <circle cx="50" cy="35" r="8" fill="#0066CC"/>
          <text x="50" y="40" textAnchor="middle" fill="#00AA00" fontSize="12" fontWeight="bold">AM</text>
        </svg>
      ),
      'BA': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#FFD700"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#0066CC"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#0066CC"/>
          <circle cx="50" cy="35" r="8" fill="#FF0000"/>
          <text x="50" y="40" textAnchor="middle" fill="#FFD700" fontSize="12" fontWeight="bold">BA</text>
        </svg>
      ),
      'CE': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#00AA00"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFD700"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFD700"/>
          <circle cx="50" cy="35" r="8" fill="#FF0000"/>
          <text x="50" y="40" textAnchor="middle" fill="#00AA00" fontSize="12" fontWeight="bold">CE</text>
        </svg>
      ),
      'DF': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">DF</text>
        </svg>
      ),
      'ES': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">ES</text>
        </svg>
      ),
      'GO': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">GO</text>
        </svg>
      ),
      'MA': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">MA</text>
        </svg>
      ),
      'MT': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">MT</text>
        </svg>
      ),
      'MS': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">MS</text>
        </svg>
      ),
      'MG': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">MG</text>
        </svg>
      ),
      'PA': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">PA</text>
        </svg>
      ),
      'PB': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">PB</text>
        </svg>
      ),
      'PR': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">PR</text>
        </svg>
      ),
      'PE': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">PE</text>
        </svg>
      ),
      'PI': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">PI</text>
        </svg>
      ),
      'RJ': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <circle cx="50" cy="35" r="8" fill="#FFD700"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="12" fontWeight="bold">RJ</text>
        </svg>
      ),
      'RN': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">RN</text>
        </svg>
      ),
      'RS': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#00AA00"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FF0000"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FF0000"/>
          <circle cx="50" cy="35" r="8" fill="#FFD700"/>
          <text x="50" y="40" textAnchor="middle" fill="#00AA00" fontSize="12" fontWeight="bold">RS</text>
        </svg>
      ),
      'RO': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">RO</text>
        </svg>
      ),
      'RR': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">RR</text>
        </svg>
      ),
      'SC': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">SC</text>
        </svg>
      ),
      'SP': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#FF0000"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <circle cx="50" cy="35" r="10" fill="#FFD700"/>
          <text x="50" y="40" textAnchor="middle" fill="#FF0000" fontSize="12" fontWeight="bold">SP</text>
        </svg>
      ),
      'SE': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">SE</text>
        </svg>
      ),
      'TO': (
        <svg viewBox="0 0 100 70" className={className}>
          <rect width="100" height="70" fill="#0066CC"/>
          <rect x="0" y="0" width="100" height="23.33" fill="#FFFFFF"/>
          <rect x="0" y="46.67" width="100" height="23.33" fill="#FFFFFF"/>
          <text x="50" y="40" textAnchor="middle" fill="#0066CC" fontSize="20" fontWeight="bold">TO</text>
        </svg>
      ),
    };

    return bandeiras[uf] || (
      <svg viewBox="0 0 100 70" className={className}>
        <rect width="100" height="70" fill="#CCCCCC"/>
        <text x="50" y="40" textAnchor="middle" fill="#666666" fontSize="16" fontWeight="bold">?</text>
      </svg>
    );
  };

  return (
    <div className={`inline-block ${className}`} title={`Bandeira de ${uf}`}>
      {getBandeiraSVG(uf)}
    </div>
  );
};

export default BandeiraEstado;
