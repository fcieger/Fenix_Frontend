# DataTable Component

Componente de tabela de dados genérico e reutilizável.

## Visão Geral

O DataTable fornece uma interface consistente para exibição de dados tabulares com suporte a ações, paginação e estados de loading.

## Props

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  className?: string;
}

interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  className?: string;
}
```

## Exemplo de Uso

```tsx
import { DataTable } from "@/components/shared/DataTable";

interface Product {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
}

const columns: ColumnDef<Product>[] = [
  {
    header: "Nome",
    accessorKey: "nome",
  },
  {
    header: "Preço",
    accessorKey: "preco",
    cell: (row) => `R$ ${row.preco.toFixed(2)}`,
  },
  {
    header: "Estoque",
    accessorKey: "estoque",
  },
];

<DataTable
  data={products}
  columns={columns}
  onEdit={(product) => handleEdit(product)}
  onDelete={(product) => handleDelete(product)}
  loading={isLoading}
  pagination={{
    page: currentPage,
    pageSize: 10,
    total: totalProducts,
    onPageChange: setCurrentPage,
  }}
/>;
```

## Configuração de Colunas

### Usando accessorKey

Para colunas simples que exibem diretamente uma propriedade do objeto:

```tsx
{
  header: "Nome",
  accessorKey: "nome",
}
```

### Usando cell (custom render)

Para colunas com formatação customizada:

```tsx
{
  header: "Preço",
  cell: (row) => (
    <span className="font-semibold">
      R$ {row.preco.toFixed(2)}
    </span>
  ),
}
```

### Adicionando className

Para estilização customizada:

```tsx
{
  header: "Status",
  accessorKey: "status",
  className: "text-center",
}
```

## Paginação

A paginação é opcional e controlada externamente:

```tsx
const [page, setPage] = useState(1);
const pageSize = 10;

<DataTable
  data={data}
  columns={columns}
  pagination={{
    page,
    pageSize,
    total: totalItems,
    onPageChange: setPage,
  }}
/>;
```

## Ações (Editar/Excluir)

As ações são opcionais e aparecem automaticamente quando fornecidas:

```tsx
<DataTable
  data={data}
  columns={columns}
  onEdit={(item) => {
    // Lógica de edição
  }}
  onDelete={(item) => {
    // Lógica de exclusão
  }}
/>
```

## Estado de Loading

Quando `loading` é `true`, o DataTable exibe um spinner:

```tsx
<DataTable data={data} columns={columns} loading={isLoading} />
```

## Quando Usar

- Use DataTable para exibir listas de dados estruturados
- Use quando precisar de paginação
- Use quando precisar de ações por linha (editar/excluir)
- Use para dados que se beneficiam de visualização tabular

## Boas Práticas

1. **Defina tipos claros** para os dados (ex: `Product`, `Order`)
2. **Use cell customizado** para formatação complexa
3. **Mantenha colunas relevantes** - não exiba mais colunas do que necessário
4. **Forneça feedback visual** durante loading
5. **Implemente paginação** para grandes volumes de dados
