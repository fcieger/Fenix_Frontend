# Lucide React

Biblioteca de ícones SVG para React, baseada no projeto Feather Icons.

## Instalação

```bash
npm install lucide-react
# ou
yarn add lucide-react
# ou
pnpm add lucide-react
# ou
bun add lucide-react
```

## Uso Básico

### Importar e Usar Ícones

```jsx
import { Camera, Home, User } from 'lucide-react';

function App() {
  return (
    <div>
      <Camera color="red" size={48} />
      <Home color="blue" size={32} />
      <User color="green" size={24} />
    </div>
  );
}
```

### Importação Direta (Otimizada)

```jsx
import Camera from 'lucide-react/icons/camera';

function App() {
  return <Camera color="red" size={48} />;
}
```

## Props dos Ícones

### Props Básicas

```jsx
<Camera
  size={24}           // Tamanho do ícone (padrão: 24)
  color="currentColor" // Cor do stroke (padrão: currentColor)
  strokeWidth={2}     // Largura do stroke (padrão: 2)
  absoluteStrokeWidth // Se true, strokeWidth não escala com size
/>
```

### Props SVG

Você pode passar qualquer atributo SVG válido:

```jsx
<Camera
  fill="red"
  strokeLinejoin="bevel"
  strokeLinecap="round"
  className="my-icon"
  style={{ opacity: 0.5 }}
/>
```

## Componente Genérico Icon

### Usar Ícones Customizados

```jsx
import { Icon } from 'lucide-react';
import { coconut } from '@lucide/lab';

function App() {
  return <Icon iconNode={coconut} color="red" />;
}
```

## Dynamic Icons

### Carregamento Dinâmico (Não Recomendado)

```jsx
import { DynamicIcon } from 'lucide-react/dynamic';

function App() {
  return <DynamicIcon name="camera" color="red" size={48} />;
}
```

**Nota**: Esta abordagem importa todos os ícones e não é recomendada para produção.

## Exemplos de Uso

### Menu de Navegação

```jsx
import { Home, Library, Cog } from 'lucide-react';

const menuItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Blog', href: '/blog', icon: Library },
  { name: 'Settings', href: '/settings', icon: Cog },
];

function Navigation() {
  return (
    <nav>
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <a key={item.href} href={item.href}>
            <Icon size={20} />
            <span>{item.name}</span>
          </a>
        );
      })}
    </nav>
  );
}
```

### Botões com Ícones

```jsx
import { Download, Upload, Trash2 } from 'lucide-react';

function ActionButtons() {
  return (
    <div>
      <button>
        <Download size={16} />
        Download
      </button>
      <button>
        <Upload size={16} />
        Upload
      </button>
      <button>
        <Trash2 size={16} />
        Delete
      </button>
    </div>
  );
}
```

### Ícones com Estados

```jsx
import { Heart } from 'lucide-react';
import { useState } from 'react';

function LikeButton() {
  const [liked, setLiked] = useState(false);

  return (
    <button onClick={() => setLiked(!liked)}>
      <Heart
        fill={liked ? "red" : "none"}
        color={liked ? "red" : "currentColor"}
      />
    </button>
  );
}
```

## Estilização

### Com CSS

```css
.my-icon {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
```

```jsx
<Camera className="my-icon" />
```

### Com Tailwind CSS

```jsx
<Camera
  className="w-6 h-6 text-blue-500 hover:text-blue-700"
  strokeWidth={2}
/>
```

### Ícones Preenchidos

```jsx
<Phone fill="#333" />
```

## Performance

### Tree-shaking

Lucide React suporta tree-shaking, então apenas os ícones importados são incluídos no bundle:

```jsx
// ✅ Bom - apenas Camera é incluído
import { Camera } from 'lucide-react';

// ❌ Evite - importa todos os ícones
import * as icons from 'lucide-react';
```

### Importação Otimizada

Para builds ainda menores, use importação direta:

```jsx
// Importação direta do ícone
import Camera from 'lucide-react/icons/camera';
```

## Ícones do Lucide Lab

Lucide Lab contém ícones experimentais:

```jsx
import { Icon } from 'lucide-react';
import { coconut, sausage } from '@lucide/lab';

function App() {
  return (
    <div>
      <Icon iconNode={coconut} />
      <Icon iconNode={sausage} color="red" />
    </div>
  );
}
```

## Acessibilidade

### Adicionar Labels

```jsx
<Camera
  aria-label="Camera icon"
  role="img"
/>
```

### Em Botões

```jsx
<button aria-label="Take photo">
  <Camera size={20} aria-hidden="true" />
</button>
```

## Lista de Ícones Comuns

Alguns ícones populares:

- `Home`, `User`, `Settings`, `Search`
- `Heart`, `Star`, `Bookmark`, `Share`
- `Download`, `Upload`, `Save`, `Edit`
- `Trash2`, `X`, `Check`, `AlertCircle`
- `Menu`, `ArrowRight`, `ArrowLeft`, `ChevronDown`
- `Camera`, `Image`, `File`, `Folder`

## Recursos

- Mais de 1000 ícones disponíveis
- Tree-shakable
- TypeScript support
- Customizável (cor, tamanho, stroke)
- Acessível
- Leve e performático

## Documentação Oficial

- Website: https://lucide.dev/
- GitHub: https://github.com/lucide-icons/lucide
- Ícones: https://lucide.dev/icons/
- Guia React: https://lucide.dev/guide/packages/lucide-react

