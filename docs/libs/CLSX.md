# clsx

Utilitário pequeno e rápido para construir condicionalmente strings de className, servindo como uma substituição mais rápida e menor para o módulo classnames.

## Instalação

```bash
npm install --save clsx
```

## Importação

```javascript
import clsx from 'clsx';
// ou
import { clsx } from 'clsx';
```

## Uso Básico

### Strings

```javascript
clsx('foo', true && 'bar', 'baz');
//=> 'foo bar baz'
```

### Objetos

```javascript
clsx({ foo: true, bar: false, baz: isTrue() });
//=> 'foo baz'
```

### Objetos (variadic)

```javascript
clsx({ foo: true }, { bar: false }, null, { '--foobar': 'hello' });
//=> 'foo --foobar'
```

### Arrays

```javascript
clsx(['foo', 0, false, 'bar']);
//=> 'foo bar'
```

### Arrays Aninhados

```javascript
clsx(['foo'], ['', 0, false, 'bar'], [['baz', [['hello'], 'there']]]);
//=> 'foo bar baz hello there'
```

### Exemplo Completo

```javascript
clsx('foo', [1 && 'bar', { baz: false, bat: null }, ['hello', ['world']]], 'cya');
//=> 'foo bar hello world cya'
```

## Valores Falsy

### Valores Descartados

```javascript
clsx(true, false, '', null, undefined, 0, NaN);
//=> ''
```

**Importante**: Qualquer valor falsy é descartado! Valores booleanos standalone também são descartados.

## Versão Lite

### clsx/lite

A versão "lite" aceita apenas argumentos string e ignora outros:

```javascript
import { clsx } from 'clsx/lite';
// ou
import clsx from 'clsx/lite';

// string
clsx('hello', true && 'foo', false && 'bar');
// => "hello foo"

// NOTA: Qualquer entrada não-string é ignorada
clsx({ foo: true });
//=> ""
```

## Uso com React

### Exemplo Básico

```jsx
import clsx from 'clsx';

function Button({ primary, disabled, className }) {
  return (
    <button
      className={clsx(
        'btn',
        {
          'btn-primary': primary,
          'btn-disabled': disabled
        },
        className
      )}
    >
      Click me
    </button>
  );
}
```

### Exemplo com Condições

```jsx
import clsx from 'clsx';

function Card({ isActive, isSelected, variant }) {
  return (
    <div
      className={clsx(
        'card',
        isActive && 'card-active',
        isSelected && 'card-selected',
        variant === 'large' && 'card-large',
        variant === 'small' && 'card-small'
      )}
    >
      Content
    </div>
  );
}
```

## Integração com Tailwind CSS

### Configuração do VS Code

Para habilitar autocompletar do Tailwind CSS dentro de `clsx`:

```json
{
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Exemplo com Tailwind

```jsx
import clsx from 'clsx';

function Button({ variant, size, disabled }) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded font-semibold',
        {
          'bg-blue-500 text-white': variant === 'primary',
          'bg-gray-200 text-gray-800': variant === 'secondary',
          'opacity-50 cursor-not-allowed': disabled,
          'text-sm': size === 'small',
          'text-base': size === 'medium',
          'text-lg': size === 'large'
        }
      )}
    >
      Button
    </button>
  );
}
```

## Performance

### Benchmarks

clsx é otimizado para performance:

- **Strings**: ~12.9M ops/sec
- **Objects**: ~9.4M ops/sec
- **Arrays**: ~9.4M ops/sec
- **Nested Arrays**: ~7.3M ops/sec

Comparado a `classnames`:
- Mais rápido em todos os cenários
- Bundle menor
- API compatível

## Comparação com classnames

### Compatibilidade

clsx é uma substituição drop-in para `classnames`:

```javascript
// classnames
import classnames from 'classnames';
classnames('foo', { bar: true });

// clsx (mesma API)
import clsx from 'clsx';
clsx('foo', { bar: true });
```

### Vantagens do clsx

- Mais rápido
- Bundle menor
- Mesma API
- Melhor tree-shaking

## Casos de Uso Comuns

### Classes Condicionais

```javascript
clsx('base-class', condition && 'conditional-class');
```

### Múltiplas Condições

```javascript
clsx(
  'base',
  isActive && 'active',
  isDisabled && 'disabled',
  variant === 'primary' && 'primary'
);
```

### Com Objetos

```javascript
clsx({
  'btn': true,
  'btn-primary': variant === 'primary',
  'btn-disabled': disabled,
  'btn-large': size === 'large'
});
```

### Combinando Tudo

```javascript
clsx(
  'base-class',
  {
    'conditional-class': condition,
    'another-class': anotherCondition
  },
  ['array', 'of', 'classes'],
  additionalClass
);
```

## Recursos

- Leve (~200 bytes minified)
- Rápido
- Compatível com classnames
- Suporte a TypeScript
- Tree-shakable
- Zero dependencies

## Documentação Oficial

- GitHub: https://github.com/lukeed/clsx
- npm: https://www.npmjs.com/package/clsx

