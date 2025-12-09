# tailwind-merge

Função utilitária para mesclar classes Tailwind CSS em JavaScript sem conflitos de estilo, suportando navegadores modernos e versões Node com tipagem completa.

## Instalação

```bash
npm add tailwind-merge
# ou
yarn add tailwind-merge
# ou
pnpm add tailwind-merge
# ou
bun add tailwind-merge
```

## Uso Básico

### Mesclar Classes

```typescript
import { twMerge } from 'tailwind-merge'

twMerge('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]')
// → 'hover:bg-dark-red p-3 bg-[#B91C1C]'
```

### Resolver Conflitos

```typescript
twMerge('p-5 p-2 p-4')
// → 'p-4'

twMerge('px-2 py-1 p-3')
// → 'p-3'
```

## Funcionalidades

### Suporte a Múltiplos Argumentos

```typescript
twMerge('some-class', 'another-class yet-another-class', 'so-many-classes')
// → 'some-class another-class yet-another-class so-many-classes'
```

### Classes Condicionais

```typescript
twMerge('some-class', undefined, null, false, 0)
// → 'some-class'

twMerge('my-class', false && 'not-this', null && 'also-not-this', true && 'but-this')
// → 'my-class but-this'
```

### Arrays e Arrays Aninhados

```typescript
twMerge('some-class', [undefined, ['another-class', false]], ['third-class'])
// → 'some-class another-class third-class'
```

### Modificadores

```typescript
twMerge('p-2 hover:p-4')
// → 'p-2 hover:p-4'

twMerge('hover:p-2 hover:p-4')
// → 'hover:p-4'

twMerge('hover:focus:p-2 focus:hover:p-4')
// → 'focus:hover:p-4'
```

### Modificador Important

```typescript
twMerge('p-3! p-4! p-5')
// → 'p-4! p-5'

twMerge('right-2! -inset-x-1!')
// → '-inset-x-1!'
```

### Postfix Modifiers

```typescript
twMerge('text-sm leading-6 text-lg/7')
// → 'text-lg/7'
```

### Propriedades Arbitrárias

```typescript
twMerge('[mask-type:luminance] [mask-type:alpha]')
// → '[mask-type:alpha]'

twMerge('[--scroll-offset:56px] lg:[--scroll-offset:44px]')
// → '[--scroll-offset:56px] lg:[--scroll-offset:44px]'
```

### Preservar Classes Não-Tailwind

```typescript
twMerge('p-5 p-2 my-non-tailwind-class p-4')
// → 'my-non-tailwind-class p-4'
```

### Refinamentos de Classe

```typescript
twMerge('p-3 px-5')
// → 'p-3 px-5'

twMerge('inset-x-4 right-4')
// → 'inset-x-4 right-4'
```

## twJoin

### Para Apenas Juntar Classes

```typescript
import { twJoin } from 'tailwind-merge'

twJoin(
  'border border-red-500',
  hasBackground && 'bg-red-100',
  hasLargeText && 'text-lg',
  hasLargeSpacing && ['p-2', hasLargeText ? 'leading-8' : 'leading-7'],
)
```

Use `twJoin` quando você só precisa juntar classes sem resolver conflitos (mais rápido).

## Configuração Customizada

### Estender Configuração Padrão

```typescript
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ['sm', 'md', 'lg']
    },
    classGroups: {
      foo: ['foo', 'foo-2', { 'bar-baz': ['', '1', '2'] }],
      bar: [{ qux: ['auto', (value) => Number(value) >= 1000] }]
    },
    conflictingClassGroups: {
      foo: ['bar']
    }
  }
})
```

### Criar Configuração do Zero

```typescript
import { createTailwindMerge } from 'tailwind-merge'

const twMerge = createTailwindMerge(() => ({
  cacheSize: 500,
  theme: {},
  classGroups: {
    foo: ['foo', 'foo-2'],
    bar: [{ qux: ['auto'] }]
  },
  conflictingClassGroups: {
    foo: ['bar']
  },
  conflictingClassGroupModifiers: {},
  orderSensitiveModifiers: []
}))
```

## Integração com CVA

### Usando com Class Variance Authority

```typescript
// cva.config.ts
import { defineConfig } from "cva";
import { twMerge } from "tailwind-merge";

export const { cva, cx, compose } = defineConfig({
  hooks: {
    onComplete: (className) => twMerge(className),
  },
});
```

## Uso em React

### Exemplo Básico

```jsx
import { twMerge } from 'tailwind-merge'

function Button({ className, variant }) {
  return (
    <button
      className={twMerge(
        'px-4 py-2 rounded font-semibold',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        className
      )}
    >
      Button
    </button>
  );
}
```

### Com Componentes

```jsx
import { twMerge } from 'tailwind-merge'
import { button } from './components/button'

function App() {
  return (
    <button className={twMerge(button({ intent: 'primary' }), 'm-4')}>
      Click me
    </button>
  );
}
```

## Validators

### Validadores Disponíveis

```typescript
import { validators } from 'tailwind-merge'

// Validadores comuns
validators.isNumber(value)
validators.isFraction(value)
validators.isInteger(value)
validators.isArbitraryValue(value)
validators.isArbitraryLength(value)
validators.isArbitraryNumber(value)
validators.isArbitrarySize(value)
validators.isArbitraryUrl(value)
validators.isArbitraryImage(value)
validators.isTshirtSize(value)
```

### Usar Validadores em Configuração

```typescript
import { validators } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'my-group': [
        {
          'my-class': [
            'auto',
            validators.isNumber,
            validators.isArbitraryLength
          ]
        }
      ]
    }
  }
})
```

## fromTheme

### Usar Valores do Tema

```typescript
import { fromTheme } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      colors: ['red', 'blue', 'green']
    },
    classGroups: {
      'bg-color': [
        {
          'bg': [
            fromTheme('colors'),
            validators.isArbitraryValue
          ]
        }
      ]
    }
  }
})
```

## Plugins

### Usar Plugin

```typescript
import { extendTailwindMerge } from 'tailwind-merge'
import { withMagic } from 'tailwind-merge-magic-plugin'

const twMerge = extendTailwindMerge(withMagic)
```

### Múltiplos Plugins

```typescript
const twMerge = extendTailwindMerge(
  { extend: { /* config */ } },
  withMagic,
  withMoreMagic
)
```

## Performance

### Cache

Por padrão, `tailwind-merge` usa um cache para melhorar performance:

```typescript
const twMerge = extendTailwindMerge({
  cacheSize: 1000 // Padrão: 500
})
```

Para desabilitar o cache:

```typescript
const twMerge = extendTailwindMerge({
  cacheSize: 0
})
```

## Recursos

- Resolve conflitos automaticamente
- Preserva classes não-Tailwind
- Suporte a modificadores
- TypeScript support
- Configurável
- Performático (com cache)
- Leve

## Documentação Oficial

- GitHub: https://github.com/dcastil/tailwind-merge
- Documentação: https://github.com/dcastil/tailwind-merge/tree/main/docs

