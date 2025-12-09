# Sonner

Biblioteca de toast notifications para React, leve e customizável.

## Instalação

```bash
npm install sonner
# ou
yarn add sonner
# ou
pnpm add sonner
# ou
bun add sonner
```

## Configuração Básica

### Adicionar Toaster ao Layout

```jsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

### Uso Básico

```jsx
import { toast } from 'sonner';

function MyComponent() {
  return (
    <button onClick={() => toast('My first toast')}>
      Give me a toast
    </button>
  );
}
```

## Tipos de Toast

### Toast Simples

```jsx
import { toast } from 'sonner';

toast('Event has been created');
```

### Success Toast

```jsx
toast.success('Data saved successfully');
```

### Error Toast

```jsx
toast.error('Failed to save data');
```

### Info Toast

```jsx
toast.info('Be at the area 10 minutes before the event time');
```

### Warning Toast

```jsx
toast.warning('Event start time cannot be earlier than 8am');
```

### Loading Toast

```jsx
toast.loading('Loading data');
```

## Toast com Descrição

```jsx
toast('Event has been created', {
  description: 'Monday, January 3rd at 6:00pm',
});
```

## Toast com Ações

### Action Button

```jsx
toast('Event has been created', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo')
  },
});
```

### Action e Cancel

```jsx
toast('Are you sure?', {
  description: 'This action cannot be undone',
  action: {
    label: 'Delete',
    onClick: () => console.log('Delete')
  },
  cancel: {
    label: 'Cancel',
    onClick: () => console.log('Cancel')
  },
});
```

## Promise Toasts

### Básico

```jsx
toast.promise(myPromise, {
  loading: 'Loading...',
  success: (data) => `${data.name} toast has been added`,
  error: 'Error',
});
```

### Com Opções Estendidas

```jsx
toast.promise(fetchUser, {
  loading: 'Loading user...',
  success: (data) => ({
    message: `Welcome ${data.name}!`,
    description: data.email,
    duration: 5000,
  }),
  error: (error) => ({
    message: 'Failed to load user',
    description: error.message,
  }),
});
```

## Loading e Update

```jsx
const toastId = toast.loading('Uploading file...');

try {
  await uploadFile();
  toast.success('File uploaded', { id: toastId });
} catch (error) {
  toast.error('Upload failed', { id: toastId });
}
```

## Customização

### Duração Customizada

```jsx
toast('This will disappear in 10 seconds', {
  duration: 10000,
});
```

### Toast Persistente

```jsx
toast('This toast will stay on screen forever', {
  duration: Infinity,
});
```

### Ícone Customizado

```jsx
toast('Hello World', {
  icon: <Icon />,
});
```

### Estilo Customizado

```jsx
toast('Hello World', {
  style: {
    background: 'red',
  },
  className: 'class',
});
```

### Com Tailwind CSS

```jsx
toast('Hello World', {
  unstyled: true,
  classNames: {
    toast: 'bg-blue-400',
    title: 'text-red-400 text-2xl',
    description: 'text-red-400',
    actionButton: 'bg-zinc-400',
    cancelButton: 'bg-orange-400',
    closeButton: 'bg-lime-400',
  },
});
```

## Renderização Customizada

### Custom Content

```jsx
toast(<div>A custom toast with default styling</div>, {
  duration: 5000
});
```

### Custom Component

```jsx
toast.custom((t) => (
  <div>
    This is a custom component
    <button onClick={() => toast.dismiss(t)}>close</button>
  </div>
));
```

### Custom Elements

```jsx
toast(
  () => (
    <>
      View{' '}
      <a href="https://google.com" target="_blank">
        Animation on the Web
      </a>
    </>
  ),
  {
    description: () => <button>This is a button element!</button>,
  },
);
```

## Configuração do Toaster

### Posição

```jsx
<Toaster position="top-center" />
// Posições disponíveis:
// top-left, top-center, top-right
// bottom-left, bottom-center, bottom-right
```

### Expand e Visible Toasts

```jsx
<Toaster expand visibleToasts={9} />
```

### Tema

```jsx
<Toaster theme="dark" />
// Opções: 'light', 'dark', 'system'
```

### Rich Colors

```jsx
<Toaster richColors={true} />
```

### Close Button

```jsx
<Toaster closeButton={true} />
```

### Offset e Gap

```jsx
<Toaster
  offset={32}
  mobileOffset={16}
  gap={12}
/>
```

### RTL Support

```jsx
<Toaster dir="rtl" />
// Opções: 'ltr', 'rtl', 'auto'
```

### Keyboard Shortcuts

```jsx
<Toaster hotkey={['altKey', 'KeyT']} />
// Pressione Alt+T para focar nos toasts
```

## Múltiplos Toasters

```jsx
<Toaster id="global" position="top-right" />
<Toaster id="canvas" position="bottom-left" />

// Usar
toast('Global toast', { toasterId: 'global' });
toast('Canvas toast', { toasterId: 'canvas' });
```

## Callbacks

### onDismiss e onAutoClose

```jsx
toast('Event has been created', {
  onDismiss: (t) => console.log(`Toast ${t.id} has been dismissed`),
  onAutoClose: (t) => console.log(`Toast ${t.id} has been closed automatically`),
});
```

## Dismiss Programático

### Dismiss Específico

```jsx
const toastId = toast('Event has been created');
toast.dismiss(toastId);
```

### Dismiss Todos

```jsx
toast.dismiss();
```

## Update Toast

```jsx
const toastId = toast('Sonner');
toast.success('Toast has been updated', {
  id: toastId,
});
```

## Configuração Global

```jsx
<Toaster
  toastOptions={{
    style: {
      background: 'red',
    },
    className: 'class',
  }}
/>
```

### Custom Icons Globais

```jsx
<Toaster
  icons={{
    success: <SuccessIcon />,
    info: <InfoIcon />,
    warning: <WarningIcon />,
    error: <ErrorIcon />,
    loading: <LoadingIcon />,
  }}
/>
```

## Hooks

### useSonner

```jsx
import { useSonner } from 'sonner';

function ToastMonitor() {
  const { toasts } = useSonner();

  return (
    <div>
      <p>Active toasts: {toasts.length}</p>
      <ul>
        {toasts.map(toast => (
          <li key={toast.id}>{toast.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## API Reference

### toast()

| Propriedade | Descrição | Padrão |
|------------|-----------|--------|
| `description` | Descrição do toast | `-` |
| `closeButton` | Adiciona botão de fechar | `false` |
| `invert` | Toast escuro em modo claro e vice-versa | `false` |
| `duration` | Tempo em ms antes de fechar | `4000` |
| `position` | Posição do toast | `bottom-right` |
| `dismissible` | Se `false`, impede o usuário de fechar | `true` |
| `icon` | Ícone exibido na frente do texto | `-` |
| `action` | Renderiza botão primário | `-` |
| `cancel` | Renderiza botão secundário | `-` |
| `id` | ID customizado para o toast | `-` |
| `onDismiss` | Função chamada quando o toast é fechado | `-` |
| `onAutoClose` | Função chamada quando o toast fecha automaticamente | `-` |

## Recursos

- Leve e performático
- Acessível (ARIA labels)
- TypeScript support
- Customizável
- Suporte a RTL
- Keyboard shortcuts
- Múltiplos toasters
- Promise support

## Documentação Oficial

- GitHub: https://github.com/emilkowalski/sonner
- Documentação: https://sonner.emilkowal.ski/
- Exemplos: https://sonner.emilkowal.ski/

