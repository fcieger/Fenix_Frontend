# React

## Visão Geral

React é uma biblioteca JavaScript para construir interfaces de usuário. Ela permite aos desenvolvedores criar aplicações web e nativas interativas usando componentes reutilizáveis, permitindo desenvolvimento de UI eficiente e escalável.

## Instalação

### Criar um novo projeto React

```bash
# Com Next.js (recomendado)
npx create-next-app@latest

# Com Vite
npm create vite@latest

# Com React Router
npx create-react-router@latest
```

## Conceitos Fundamentais

### Componentes

Componentes são funções JavaScript que retornam marcação JSX.

```javascript
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}

export default function App() {
  return <Greeting name="world" />
}
```

### JSX

JSX permite escrever marcação HTML dentro de JavaScript.

```javascript
function AboutPage() {
  return (
    <>
      <h1>About</h1>
      <p>Hello there.<br />How do you do?</p>
    </>
  );
}
```

### Props

Props são argumentos passados para componentes React.

```javascript
function Profile({ name, imageUrl }) {
  return (
    <img
      src={imageUrl}
      alt={name}
    />
  );
}

export default function Gallery() {
  return (
    <section>
      <h1>Amazing scientists</h1>
      <Profile name="Katherine Johnson" imageUrl="https://i.imgur.com/MK3eW3As.jpg" />
      <Profile name="Katherine Johnson" imageUrl="https://i.imgur.com/MK3eW3As.jpg" />
    </section>
  );
}
```

### Estado (State)

Use o hook `useState` para adicionar estado aos componentes.

```javascript
import { useState } from 'react';

function MyButton() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <button onClick={handleClick}>
      Clicked {count} times
    </button>
  );
}
```

### Renderização Condicional

```javascript
// Com operador ternário
<div>
  {isLoggedIn ? (
    <AdminPanel />
  ) : (
    <LoginForm />
  )}
</div>

// Com operador lógico &&
<div>
  {isLoggedIn && <AdminPanel />}
</div>
```

### Renderização de Listas

```javascript
const products = [
  { title: 'Cabbage', id: 1 },
  { title: 'Garlic', id: 2 },
  { title: 'Apple', id: 3 }
];

const listItems = products.map(product =>
  <li key={product.id}>
    {product.title}
  </li>
);

return (
  <ul>{listItems}</ul>
);
```

### Event Handlers

```javascript
function MyButton() {
  function handleClick() {
    alert('You clicked me!');
  }

  return (
    <button onClick={handleClick}>
      Click me
    </button>
  );
}
```

### Lifting State Up

Mover o estado de componentes filhos para o componente pai para compartilhar dados.

```javascript
import { useState } from 'react';

export default function MyApp() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div>
      <h1>Counters that update together</h1>
      <MyButton count={count} onClick={handleClick} />
      <MyButton count={count} onClick={handleClick} />
    </div>
  );
}

function MyButton({ count, onClick }) {
  return (
    <button onClick={onClick}>
      Clicked {count} times
    </button>
  );
}
```

## Hooks Principais

### useState

Gerencia estado local do componente.

```javascript
const [state, setState] = useState(initialValue);
```

### useEffect

Executa efeitos colaterais após a renderização.

```javascript
import { useEffect } from 'react';

useEffect(() => {
  // Código do efeito
  return () => {
    // Cleanup (opcional)
  };
}, [dependencies]);
```

### useRef

Acessa elementos DOM ou mantém valores mutáveis.

```javascript
import { useRef } from 'react';

const inputRef = useRef(null);

<input ref={inputRef} />
```

## Inicialização da Aplicação

```javascript
import { createRoot } from 'react-dom/client';
import App from './App.js';
import './styles.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

## Estilização

### Com className

```javascript
<img className="avatar" />
```

```css
.avatar {
  border-radius: 50%;
}
```

### Com inline styles

```javascript
<li
  key={product.id}
  style={{
    color: product.isFruit ? 'magenta' : 'darkgreen'
  }}
>
  {product.title}
</li>
```

## Recursos Avançados

### Suspense

Para lidar com estados de carregamento.

```jsx
import { Suspense } from 'react';

<Suspense fallback={<h1>🌀 Loading...</h1>}>
  <Posts />
</Suspense>
```

### Error Boundaries

Para capturar erros em componentes.

```jsx
<ErrorBoundary fallback={<div>Something went wrong!</div>}>
  <MyComponent />
</ErrorBoundary>
```

## Versão Utilizada no Projeto

- **React**: ^19.2.0
- **React DOM**: ^19.2.0

## Documentação Oficial

- [React Documentation](https://react.dev)
- [React GitHub](https://github.com/facebook/react)

