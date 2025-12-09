# Class Variance Authority (CVA)

Utilitário para construir sistemas de design e bibliotecas de componentes com foco em type safety e experiência do desenvolvedor.

## Instalação

```bash
npm i class-variance-authority
# ou
pnpm i class-variance-authority
# ou
yarn add class-variance-authority
# ou
bun add class-variance-authority
```

## Alias (Opcional)

Para usar `cva` como nome do pacote:

```bash
npm i cva@npm:class-variance-authority
```

## Uso Básico

### Definir Variantes

```ts
import { cva } from "class-variance-authority";

const button = cva(["font-semibold", "border", "rounded"], {
  variants: {
    intent: {
      primary: ["bg-blue-500", "text-white", "border-transparent"],
      secondary: ["bg-white", "text-gray-800", "border-gray-400"]
    },
    size: {
      small: ["text-sm", "py-1", "px-2"],
      medium: ["text-base", "py-2", "px-4"]
    }
  },
  defaultVariants: {
    intent: "primary",
    size: "medium"
  }
});

button();
// => "font-semibold border rounded bg-blue-500 text-white border-transparent text-base py-2 px-4"

button({ intent: "secondary", size: "small" });
// => "font-semibold border rounded bg-white text-gray-800 border-gray-400 text-sm py-1 px-2"
```

### Nova API (v1.0+)

```ts
import { cva } from "cva";

const button = cva({
  base: "rounded border font-semibold",
  variants: {
    intent: {
      primary: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
      secondary: "border-gray-400 bg-white text-gray-800 hover:bg-gray-100"
    },
    size: {
      small: "px-2 py-1 text-sm",
      medium: "px-4 py-2 text-base"
    }
  },
  defaultVariants: {
    intent: "primary",
    size: "medium"
  }
});
```

## Variantes Compostas

### Compound Variants

```ts
const button = cva({
  base: "rounded border font-semibold",
  variants: {
    intent: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-white text-gray-800"
    },
    size: {
      small: "px-2 py-1 text-sm",
      medium: "px-4 py-2 text-base"
    }
  },
  compoundVariants: [
    {
      intent: "primary",
      size: "medium",
      class: "uppercase"
    }
  ],
  defaultVariants: {
    intent: "primary",
    size: "medium"
  }
});
```

### Múltiplas Condições

```ts
compoundVariants: [
  {
    intent: ["primary", "secondary"],
    size: "medium",
    class: "uppercase"
  }
]
```

## Variantes Booleanas

```ts
const button = cva({
  base: "rounded border font-semibold",
  variants: {
    intent: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-white text-gray-800"
    },
    disabled: {
      false: null,
      true: ["opacity-50", "cursor-not-allowed"]
    }
  },
  compoundVariants: [
    {
      intent: "primary",
      disabled: false,
      class: "hover:bg-blue-600"
    }
  ],
  defaultVariants: {
    intent: "primary",
    disabled: false
  }
});
```

## Desabilitar Variantes

### Usando null

```ts
const button = cva({
  base: "button",
  variants: {
    intent: {
      unset: null,
      primary: "button--primary",
      secondary: "button--secondary"
    }
  }
});

button({ intent: "unset" });
// => "button"
```

## Estender Componentes

### Adicionar Classes Adicionais

```ts
button({ class: "m-4" });
// => "…buttonClasses m-4"

button({ className: "m-4" });
// => "…buttonClasses m-4"
```

## TypeScript

### Extrair Tipos de Variantes

```ts
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export type ButtonProps = VariantProps<typeof button>;
export const button = cva(/* … */);
```

### Variantes Obrigatórias

```ts
export interface ButtonProps
  extends Omit<ButtonVariantProps, "required">,
    Required<Pick<ButtonVariantProps, "required">> {}

export const button = (props: ButtonProps) => buttonVariants(props);

// ❌ Erro TypeScript
button({});

// ✅
button({ required: "a" });
```

## Compor Componentes

### Usando cx

```ts
import type { VariantProps } from "class-variance-authority";
import { cva, cx } from "class-variance-authority";

export type BoxProps = VariantProps<typeof box>;
export const box = cva(["box", "box-border"], {
  variants: {
    margin: { 0: "m-0", 2: "m-2", 4: "m-4", 8: "m-8" },
    padding: { 0: "p-0", 2: "p-2", 4: "p-4", 8: "p-8" }
  },
  defaultVariants: {
    margin: 0,
    padding: 0
  }
});

const cardBase = cva(["card", "border-solid", "border-slate-300", "rounded"], {
  variants: {
    shadow: {
      md: "drop-shadow-md",
      lg: "drop-shadow-lg",
      xl: "drop-shadow-xl"
    }
  }
});

export interface CardProps extends BoxProps, VariantProps<typeof cardBase> {}
export const card = ({ margin, padding, shadow }: CardProps = {}) =>
  cx(box({ margin, padding }), cardBase({ shadow }));
```

### Usando compose

```ts
import { cva, compose } from "cva";

const box = cva({
  base: "box box-border",
  variants: {
    margin: { 0: "m-0", 2: "m-2", 4: "m-4", 8: "m-8" },
    padding: { 0: "p-0", 2: "p-2", 4: "p-4", 8: "p-8" }
  },
  defaultVariants: {
    margin: 0,
    padding: 0
  }
});

const root = cva({
  base: "card rounded border-solid border-slate-300",
  variants: {
    shadow: {
      md: "drop-shadow-md",
      lg: "drop-shadow-lg",
      xl: "drop-shadow-xl"
    }
  }
});

export const card = compose(box, root);
```

## Integração com tailwind-merge

### Configuração com defineConfig

```ts
// cva.config.ts
import { defineConfig } from "cva";
import { twMerge } from "tailwind-merge";

export const { cva, cx, compose } = defineConfig({
  hooks: {
    onComplete: (className) => twMerge(className),
  },
});
```

### Wrapper Manual

```ts
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva(["your", "base", "classes"], {
  variants: {
    intent: {
      primary: ["your", "primary", "classes"]
    }
  },
  defaultVariants: {
    intent: "primary"
  }
});

export interface ButtonVariants extends VariantProps<typeof buttonVariants> {}

export const button = (variants: ButtonVariants) =>
  twMerge(buttonVariants(variants));
```

## Componentes Polimórficos

### Com Radix UI Slot

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "cva";

const button = cva({
  base: "button",
  variants: {
    intent: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-white text-gray-800"
    }
  },
  defaultVariants: {
    intent: "primary"
  }
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  asChild,
  className,
  intent,
  ...props
}) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={button({ intent, className })} {...props} />;
};
```

## Uso em React

```tsx
import { button } from "./components/button";

function App() {
  return (
    <button className={button({ intent: "primary", size: "medium" })}>
      Click me
    </button>
  );
}
```

## Configuração do Editor

### VS Code

```json
{
  "tailwindCSS.classFunctions": ["cva", "cx"]
}
```

### Tailwind CSS IntelliSense

Adicione `cva` e `cx` às funções de classe no seu editor para autocompletar classes Tailwind dentro dessas funções.

## Recursos

- Type-safe variants
- Compound variants
- Default variants
- Integração com Tailwind CSS
- Suporte a TypeScript
- Leve e performático

## Documentação Oficial

- GitHub: https://github.com/joe-bell/cva
- Documentação: https://cva.style/

