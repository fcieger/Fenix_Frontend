# StatsCards Components

Componentes para exibição de estatísticas e métricas em cards.

## Visão Geral

Os componentes StatsCards fornecem uma interface consistente para exibição de estatísticas e métricas com ícones, valores e tendências.

## Componentes

### StatsCard

Card individual de estatística.

#### Props

```typescript
interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}
```

#### Exemplo de Uso

```tsx
import { StatsCard } from "@/components/shared/StatsCards";
import { DollarSign, TrendingUp } from "lucide-react";

<StatsCard
  label="Total de Vendas"
  value="R$ 125.000,00"
  icon={DollarSign}
  iconBgColor="bg-green-100"
  iconColor="text-green-600"
  trend={{
    value: 12.5,
    isPositive: true,
  }}
/>;
```

---

### StatsGrid

Grid responsivo para múltiplos StatsCards.

#### Props

```typescript
interface StatsGridProps {
  stats: StatsCardProps[];
  className?: string;
}
```

#### Exemplo de Uso

```tsx
import { StatsGrid } from "@/components/shared/StatsCards";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";

const stats = [
  {
    label: "Total de Vendas",
    value: "R$ 125.000,00",
    icon: DollarSign,
    iconBgColor: "bg-green-100",
    iconColor: "text-green-600",
    trend: { value: 12.5, isPositive: true },
  },
  {
    label: "Pedidos",
    value: "1.234",
    icon: ShoppingCart,
    iconBgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    trend: { value: 8.3, isPositive: true },
  },
  {
    label: "Clientes",
    value: "567",
    icon: Users,
    iconBgColor: "bg-purple-100",
    iconColor: "text-purple-600",
    trend: { value: -2.1, isPositive: false },
  },
];

<StatsGrid stats={stats} />;
```

## Tendências

O componente suporta exibição de tendências (variação percentual):

```tsx
trend={{
  value: 12.5,      // Valor percentual
  isPositive: true, // true = verde, false = vermelho
}}
```

A tendência é exibida como:

- **Positiva (verde)**: `+12.5%`
- **Negativa (vermelho)**: `-2.1%`

## Cores Customizadas

Você pode customizar as cores do ícone:

```tsx
<StatsCard
  label="Vendas"
  value="R$ 50.000"
  icon={DollarSign}
  iconBgColor="bg-purple-100" // Cor de fundo do ícone
  iconColor="text-purple-600" // Cor do ícone
/>
```

## Layout Responsivo

O StatsGrid usa um layout responsivo:

- **Mobile**: 1 coluna
- **Tablet (sm)**: 2 colunas
- **Desktop (lg)**: 5 colunas

## Quando Usar

- Use StatsCard para exibir métricas individuais
- Use StatsGrid para dashboards com múltiplas métricas
- Use quando precisar destacar valores importantes
- Use com tendências para mostrar variações

## Boas Práticas

1. **Use ícones apropriados** para cada métrica
2. **Formate valores** de forma clara (moeda, números, etc.)
3. **Use cores consistentes** para tipos de métricas similares
4. **Inclua tendências** quando relevante para contexto
5. **Mantenha labels claros** e descritivos
