# Tailwind CSS

## Visão Geral

Tailwind CSS é um framework CSS utility-first para construir rapidamente interfaces de usuário customizadas. Ele funciona escaneando todos os seus arquivos HTML, componentes JavaScript e outros templates para nomes de classes, gerando os estilos correspondentes e então escrevendo-os em um arquivo CSS estático.

## Instalação

### Com Next.js

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Configuração do tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Adicionar ao CSS

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Conceitos Principais

### Utility Classes

Classes utilitárias para estilização rápida.

```html
<div class="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg">
  Content
</div>
```

### Responsive Design

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Dark Mode

```html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

### Hover e Estados

```html
<button class="bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
  Click me
</button>
```

## Layout

### Flexbox

```html
<div class="flex items-center justify-between gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Grid

```html
<div class="grid grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Positioning

```html
<div class="relative">
  <div class="absolute top-0 right-0">Absolute</div>
</div>
```

## Espaçamento

```html
<!-- Padding -->
<div class="p-4">Padding em todos os lados</div>
<div class="px-4 py-2">Padding horizontal e vertical</div>

<!-- Margin -->
<div class="m-4">Margin em todos os lados</div>
<div class="mx-auto">Margin horizontal automático</div>

<!-- Gap (para flex e grid) -->
<div class="flex gap-4">Items com gap</div>
```

## Tipografia

```html
<h1 class="text-4xl font-bold text-gray-900">Heading</h1>
<p class="text-base text-gray-600 leading-relaxed">Paragraph</p>
<span class="text-sm font-medium uppercase tracking-wide">Label</span>
```

## Cores

```html
<div class="bg-blue-500 text-white border-2 border-blue-700">
  Colored content
</div>
```

### Opacidade

```html
<div class="bg-blue-500/50">50% opacity</div>
<div class="bg-blue-500/75">75% opacity</div>
```

## Bordas e Sombras

```html
<div class="border border-gray-300 rounded-lg shadow-md">
  Content with border and shadow
</div>
```

## Arbitrary Values

Valores customizados usando colchetes.

```html
<div class="top-[117px] w-[500px] bg-[#1da1f2]">
  Custom values
</div>
```

## Variants Arbitrárias

```html
<div class="[@supports(backdrop-filter:blur(0))]:bg-white/50 [@supports(backdrop-filter:blur(0))]:backdrop-blur">
  Conditional styles
</div>
```

## Componentes Customizados

### Usando @apply

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700;
  }
}
```

## Plugins Úteis

### Tailwind CSS Forms

```bash
npm install @tailwindcss/forms
```

```javascript
module.exports = {
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

### Tailwind CSS Typography

```bash
npm install @tailwindcss/typography
```

```html
<article class="prose prose-lg">
  <h1>Article Title</h1>
  <p>Article content...</p>
</article>
```

## Tailwind Merge

Para mesclar classes Tailwind corretamente.

```bash
npm install tailwind-merge
```

```tsx
import { twMerge } from 'tailwind-merge'

const className = twMerge('px-2 py-1', 'px-4')
// Result: 'py-1 px-4'
```

## Class Variance Authority

Para criar variantes de componentes.

```bash
npm install class-variance-authority
```

```tsx
import { cva } from 'class-variance-authority'

const button = cva('base-classes', {
  variants: {
    variant: {
      primary: 'bg-blue-500',
      secondary: 'bg-gray-500',
    },
    size: {
      sm: 'text-sm',
      lg: 'text-lg',
    },
  },
})
```

## Versão Utilizada no Projeto

- **tailwindcss**: ^4
- **tailwind-merge**: ^3.3.1
- **class-variance-authority**: ^0.7.1

## Documentação Oficial

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS GitHub](https://github.com/tailwindlabs/tailwindcss)

