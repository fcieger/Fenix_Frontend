# Modal Components

Componentes de modal padronizados e reutilizáveis para diálogos, confirmações e formulários.

## Visão Geral

Os componentes de modal fornecem uma interface consistente para exibição de diálogos modais, com suporte a acessibilidade, animações e diferentes tamanhos.

## Componentes

### Modal

Componente base de modal reutilizável com suporte a tamanhos, animações e acessibilidade.

#### Props

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl";
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}
```

#### Exemplo de Uso

```tsx
import { Modal } from "@/components/shared/Modals";
import { AlertCircle } from "lucide-react";

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Título do Modal"
  description="Descrição opcional"
  icon={AlertCircle}
  maxWidth="lg"
  footer={
    <div className="flex justify-end">
      <Button onClick={() => setIsOpen(false)}>Fechar</Button>
    </div>
  }
>
  <p>Conteúdo do modal</p>
</Modal>;
```

#### Características de Acessibilidade

- **Focus Trap**: O foco fica preso dentro do modal
- **ESC Key**: Fecha o modal ao pressionar ESC
- **ARIA Labels**: Atributos ARIA apropriados para leitores de tela
- **Backdrop Click**: Fecha ao clicar no backdrop (pode ser desabilitado com `disabled`)

---

### ConfirmModal

Modal de confirmação genérico com variantes (danger, warning, info, success).

#### Props

```typescript
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "danger" | "warning" | "info" | "success";
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl";
}
```

#### Exemplo de Uso

```tsx
import { ConfirmModal } from "@/components/shared/Modals";

<ConfirmModal
  isOpen={isDeleteOpen}
  onClose={() => setIsDeleteOpen(false)}
  title="Confirmar Exclusão"
  message="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
  onConfirm={handleDelete}
  variant="danger"
  confirmLabel="Excluir"
  cancelLabel="Cancelar"
  isLoading={isDeleting}
/>;
```

#### Variantes

- **danger**: Para ações destrutivas (exclusão, remoção)
- **warning**: Para ações que requerem atenção
- **info**: Para informações gerais
- **success**: Para confirmações positivas

---

### FormModal

Modal com formulário integrado, incluindo estados de loading e validação.

#### Props

```typescript
interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl";
  className?: string;
}
```

#### Exemplo de Uso

```tsx
import { FormModal } from "@/components/shared/Modals";
import { FormField, FormCurrencyInput } from "@/components/shared/Forms";

<FormModal
  isOpen={isFormOpen}
  onClose={() => setIsFormOpen(false)}
  title="Criar Produto"
  description="Preencha os dados do novo produto"
  onSubmit={handleSubmit}
  isLoading={isSubmitting}
  submitLabel="Salvar"
  cancelLabel="Cancelar"
>
  <FormField label="Nome" required>
    <Input
      value={formData.nome}
      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
    />
  </FormField>

  <FormCurrencyInput
    label="Preço"
    value={formData.preco}
    onChange={(value) => setFormData({ ...formData, preco: value })}
  />
</FormModal>;
```

---

## Tamanhos Disponíveis

- **sm**: Pequeno (max-w-sm)
- **md**: Médio (max-w-md) - padrão
- **lg**: Grande (max-w-lg)
- **xl**: Extra grande (max-w-xl)
- **2xl**: 2x Extra grande (max-w-2xl)
- **4xl**: 4x Extra grande (max-w-4xl)
- **6xl**: 6x Extra grande (max-w-6xl)

## Quando Usar

- **Modal**: Use para diálogos customizados com conteúdo complexo
- **ConfirmModal**: Use para confirmações de ações (exclusão, salvamento, etc.)
- **FormModal**: Use para formulários dentro de modais

## Boas Práticas

1. **Sempre forneça um título claro** para o modal
2. **Use variantes apropriadas** no ConfirmModal (danger para ações destrutivas)
3. **Mantenha o conteúdo conciso** - modais devem ser focados
4. **Forneça feedback visual** durante operações assíncronas (isLoading)
5. **Permita fechamento fácil** - sempre tenha um botão de cancelar/fechar
6. **Use tamanhos apropriados** - não use modais muito grandes para conteúdo simples

## Acessibilidade

Todos os modais incluem:

- **Focus trap**: Foco preso dentro do modal
- **ESC key**: Fecha ao pressionar ESC
- **ARIA attributes**: Atributos apropriados para leitores de tela
- **Keyboard navigation**: Navegação completa por teclado
- **Backdrop click**: Fecha ao clicar fora (quando não disabled)

## Animações

Os modais usam Framer Motion para animações suaves:

- **Entrada**: Fade in + scale up + slide up
- **Saída**: Fade out + scale down + slide down
- **Backdrop**: Fade in/out
