# Radix UI

## Visão Geral

Radix UI é uma biblioteca de componentes primitivos acessíveis e não estilizados para React. Ela fornece componentes de baixo nível focados em acessibilidade, customização e experiência do desenvolvedor, permitindo construir sistemas de design de alta qualidade.

## Instalação

### Instalar pacote principal

```bash
npm install radix-ui
```

### Instalar componentes individuais

```bash
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-tabs
npm install @radix-ui/react-checkbox
npm install @radix-ui/react-progress
```

## Radix Themes

Radix Themes é uma biblioteca de componentes estilizados construída sobre Radix Primitives.

### Instalação

```bash
npm install @radix-ui/themes
```

### Configuração Básica

```tsx
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

export default function App() {
  return (
    <Theme>
      <MyApp />
    </Theme>
  );
}
```

### Componentes Básicos

```tsx
import { Flex, Text, Button } from "@radix-ui/themes";

export default function MyApp() {
  return (
    <Flex direction="column" gap="2">
      <Text>Hello from Radix Themes :)</Text>
      <Button>Let's go</Button>
    </Flex>
  );
}
```

## Componentes Primitivos

### Dialog

```tsx
import * as Dialog from "@radix-ui/react-dialog";

const DialogDemo = () => (
  <Dialog.Root>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>
        <Dialog.Title>Title</Dialog.Title>
        <Dialog.Description>Description</Dialog.Description>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
```

### Dropdown Menu

```tsx
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const DropdownMenuDemo = () => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Item 1</DropdownMenu.Item>
        <DropdownMenu.Item>Item 2</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>Item 3</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);
```

### Select

```tsx
import * as Select from "@radix-ui/react-select";

const SelectDemo = () => (
  <Select.Root>
    <Select.Trigger />
    <Select.Portal>
      <Select.Content>
        <Select.Item value="option1">Option 1</Select.Item>
        <Select.Item value="option2">Option 2</Select.Item>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);
```

### Tabs

```tsx
import * as Tabs from "@radix-ui/react-tabs";

const TabsDemo = () => (
  <Tabs.Root defaultValue="tab1">
    <Tabs.List>
      <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
      <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="tab1">Content 1</Tabs.Content>
    <Tabs.Content value="tab2">Content 2</Tabs.Content>
  </Tabs.Root>
);
```

### Checkbox

```tsx
import * as Checkbox from "@radix-ui/react-checkbox";

const CheckboxDemo = () => (
  <Checkbox.Root>
    <Checkbox.Indicator />
  </Checkbox.Root>
);
```

### Progress

```tsx
import * as Progress from "@radix-ui/react-progress";

const ProgressDemo = () => (
  <Progress.Root>
    <Progress.Indicator />
  </Progress.Root>
);
```

## Customização de Tema

```tsx
<Theme
  accentColor="crimson"
  grayColor="sand"
  radius="large"
  scaling="95%"
>
  <MyApp />
</Theme>
```

### Opções de Tema

- **accentColor**: `crimson`, `mint`, `blue`, etc.
- **grayColor**: `gray`, `sand`, `slate`, etc.
- **radius**: `none`, `small`, `medium`, `large`, `full`
- **scaling**: `90%`, `95%`, `100%`, `105%`, `110%`

## Estilização

### Com CSS

```css
.PopoverTrigger {
  background-color: white;
  border-radius: 4px;
}

.PopoverContent {
  border-radius: 4px;
  padding: 20px;
  width: 260px;
  background-color: white;
}
```

```tsx
<Popover.Root>
  <Popover.Trigger className="PopoverTrigger">Show info</Popover.Trigger>
  <Popover.Portal>
    <Popover.Content className="PopoverContent">
      Some content
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
```

## Data Attributes

Radix UI expõe data attributes para estilização baseada em estado:

```css
[data-state="open"] {
  /* estilos quando aberto */
}

[data-state="closed"] {
  /* estilos quando fechado */
}

[data-side="top"] {
  /* estilos quando posicionado no topo */
}
```

## Acessibilidade

Radix UI fornece:

- Suporte completo a teclado
- Gerenciamento de foco
- ARIA attributes
- Suporte a leitores de tela
- Gerenciamento de portal

## Componentes Utilizados no Projeto

- `@radix-ui/react-checkbox`: ^1.3.3
- `@radix-ui/react-dialog`: ^1.1.15
- `@radix-ui/react-dropdown-menu`: ^2.1.16
- `@radix-ui/react-navigation-menu`: ^1.2.14
- `@radix-ui/react-progress`: ^1.1.7
- `@radix-ui/react-select`: ^2.2.6
- `@radix-ui/react-slot`: ^1.2.3
- `@radix-ui/react-tabs`: ^1.1.13

## Documentação Oficial

- [Radix UI Documentation](https://www.radix-ui.com)
- [Radix UI GitHub](https://github.com/radix-ui/primitives)

