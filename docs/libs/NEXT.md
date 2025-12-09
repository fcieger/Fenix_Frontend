# Next.js

## Visão Geral

Next.js é um framework React para construir aplicações web full-stack. Ele fornece recursos adicionais e otimizações, configurando automaticamente ferramentas de nível inferior para ajudar os desenvolvedores a focar na construção de produtos rapidamente.

## Instalação

### Criar um novo projeto Next.js

```bash
# Com npm
npx create-next-app@latest my-app --yes
cd my-app
npm run dev

# Com pnpm
pnpm create next-app@latest my-app --yes
cd my-app
pnpm dev

# Com yarn
yarn create next-app@latest my-app --yes
cd my-app
yarn dev

# Com bun
bun create next-app@latest my-app --yes
cd my-app
bun dev
```

## Conceitos Principais

### App Router

O Next.js App Router fornece uma nova forma de construir aplicações Next.js com foco em componentes de servidor, layouts e melhor busca de dados.

### Route Handlers

Route Handlers permitem criar endpoints de API usando a convenção de arquivo `route.ts` ou `route.js` dentro do diretório `app`.

#### Exemplo básico de GET Route Handler

```typescript
export async function GET(request: Request) {
  return Response.json({ message: 'Hello World' })
}
```

#### Route Handler com cache estático

```typescript
export const dynamic = 'force-static'

export async function GET() {
  const res = await fetch('https://data.mongodb-api.com/...', {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  })
  const data = await res.json()

  return Response.json({ data })
}
```

### Server Components e Client Components

Por padrão, todos os componentes no App Router são Server Components. Para usar recursos do cliente (como hooks, event handlers, etc.), você precisa adicionar a diretiva `'use client'` no topo do arquivo.

```tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### Fetching de Dados

#### Em Server Components

```typescript
import { db, posts } from '@/lib/db'

export default async function Page() {
  const allPosts = await db.select().from(posts)
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### Layouts

O layout é compartilhado entre múltiplas páginas. Você pode criar um layout aninhado adicionando um arquivo `layout.tsx` dentro de uma pasta.

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
```

### Metadata API

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Page Title',
  description: 'My page description',
}
```

### Cookies

```typescript
'use server'

import { cookies } from 'next/headers'

export async function exampleAction() {
  const cookieStore = await cookies()

  // Get cookie
  cookieStore.get('name')?.value

  // Set cookie
  cookieStore.set('name', 'Delba')

  // Delete cookie
  cookieStore.delete('name')
}
```

## Scripts do package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

## Recursos Avançados

### Draft Mode

```typescript
export async function GET(request: Request) {
  return new Response('')
}
```

### Preview Mode

```javascript
export default function handler(req, res) {
  res.setPreviewData({})
  res.end('Preview mode enabled')
}
```

### Internacionalização (i18n)

Usando segmentos de rota dinâmicos com `[lang]` e `generateStaticParams` para criar versões localizadas de páginas.

## Deploy

### Configuração para Node.js

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

## Recursos Adicionais

- **Server-Side Rendering (SSR)**: Renderização no servidor para melhor SEO
- **Static Site Generation (SSG)**: Geração de páginas estáticas em build time
- **Image Optimization**: Componente `Image` otimizado para performance
- **Font Optimization**: Otimização automática de fontes
- **API Routes**: Criação de endpoints de API dentro do projeto

## Versão Utilizada no Projeto

- **Next.js**: ^16.0.3

## Documentação Oficial

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js GitHub](https://github.com/vercel/next.js)

