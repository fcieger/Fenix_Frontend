# Form Components

Componentes de formulário padronizados e reutilizáveis para uso em toda a aplicação.

## Visão Geral

Os componentes de formulário fornecem uma interface consistente para criação de formulários, com suporte a labels, erros, validação e estados de loading.

## Componentes

### FormField

Wrapper genérico para campos de formulário que fornece label, mensagem de erro e texto de ajuda.

#### Props

```typescript
interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}
```

#### Exemplo de Uso

```tsx
import { FormField } from "@/components/shared/Forms";
import { Input } from "@/components/ui/input";

<FormField
  label="Nome do Produto"
  error={errors.nome}
  helperText="Digite o nome completo do produto"
  required
>
  <Input
    id="nome"
    value={formData.nome}
    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
  />
</FormField>;
```

---

### FormSelect

Componente de seleção com suporte a busca opcional e seleção múltipla.

#### Props

```typescript
interface FormSelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  searchable?: boolean;
  multiple?: boolean;
  loading?: boolean;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  emptyMessage?: string;
}

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

#### Exemplo de Uso

```tsx
import { FormSelect } from "@/components/shared/Forms";

const options = [
  { value: "1", label: "Opção 1" },
  { value: "2", label: "Opção 2" },
  { value: "3", label: "Opção 3" },
];

<FormSelect
  label="Categoria"
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  searchable
  required
  error={errors.categoria}
/>;
```

---

### FormDatePicker

Componente de seleção de data reutilizável baseado no DateInput existente.

#### Props

```typescript
interface FormDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  range?: boolean; // Not yet implemented
  className?: string;
  icon?: React.ReactNode;
}
```

#### Exemplo de Uso

```tsx
import { FormDatePicker } from "@/components/shared/Forms";

<FormDatePicker
  label="Data de Vencimento"
  value={formData.dataVencimento}
  onChange={(value) => setFormData({ ...formData, dataVencimento: value })}
  required
  error={errors.dataVencimento}
/>;
```

---

### FormCurrencyInput

Input de moeda formatado com máscara brasileira (R$).

#### Props

```typescript
interface FormCurrencyInputProps {
  value: number | string;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  currency?: string; // Default: "BRL"
  className?: string;
}
```

#### Exemplo de Uso

```tsx
import { FormCurrencyInput } from "@/components/shared/Forms";

<FormCurrencyInput
  label="Preço de Venda"
  value={formData.preco}
  onChange={(value) => setFormData({ ...formData, preco: value })}
  min={0}
  required
  error={errors.preco}
/>;
```

---

### FormNumberInput

Input numérico com validação de min/max.

#### Props

```typescript
interface FormNumberInputProps {
  value: number | string;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  format?: "integer" | "decimal" | "percentage";
  className?: string;
}
```

#### Exemplo de Uso

```tsx
import { FormNumberInput } from "@/components/shared/Forms";

<FormNumberInput
  label="Quantidade"
  value={formData.quantidade}
  onChange={(value) => setFormData({ ...formData, quantidade: value })}
  min={0}
  max={1000}
  step={1}
  format="integer"
  required
/>;
```

---

### FormTextarea

Textarea com contador de caracteres e auto-resize opcional.

#### Props

```typescript
interface FormTextareaProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  autoResize?: boolean;
  rows?: number;
  className?: string;
}
```

#### Exemplo de Uso

```tsx
import { FormTextarea } from "@/components/shared/Forms";

<FormTextarea
  label="Descrição"
  value={formData.descricao}
  onChange={(value) => setFormData({ ...formData, descricao: value })}
  maxLength={500}
  autoResize
  helperText="Máximo de 500 caracteres"
/>;
```

---

## Integração com react-hook-form

Os componentes podem ser usados com react-hook-form através do `Controller`:

```tsx
import { useForm, Controller } from "react-hook-form";
import { FormCurrencyInput } from "@/components/shared/Forms";

const { control, handleSubmit } = useForm();

<Controller
  name="preco"
  control={control}
  rules={{ required: "Preço é obrigatório", min: 0 }}
  render={({ field, fieldState }) => (
    <FormCurrencyInput
      label="Preço"
      value={field.value}
      onChange={field.onChange}
      error={fieldState.error?.message}
    />
  )}
/>;
```

## Quando Usar

- **FormField**: Use quando precisar de um wrapper consistente com label e mensagens de erro
- **FormSelect**: Use para seleção de opções, especialmente quando há muitas opções (com searchable)
- **FormDatePicker**: Use para seleção de datas
- **FormCurrencyInput**: Use para valores monetários
- **FormNumberInput**: Use para valores numéricos com validação
- **FormTextarea**: Use para textos longos com limite de caracteres

## Boas Práticas

1. Sempre use `FormField` ou os componentes que já incluem `FormField` para consistência
2. Forneça mensagens de erro claras e específicas
3. Use `required` para campos obrigatórios
4. Forneça `helperText` para orientar o usuário
5. Valide valores min/max quando apropriado
