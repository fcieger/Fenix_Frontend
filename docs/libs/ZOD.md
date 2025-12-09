# Zod

## Visão Geral

Zod é uma biblioteca TypeScript-first para declaração e validação de schemas. Ela permite definir e validar estruturas de dados com inferência de tipo estático, fornecendo dados fortemente tipados e validados.

## Instalação

```bash
npm install zod
```

## Conceitos Básicos

### Schemas Simples

```typescript
import { z } from 'zod'

// String
const nameSchema = z.string()

// Number
const ageSchema = z.number()

// Boolean
const isActiveSchema = z.boolean()

// Date
const dateSchema = z.date()
```

### Object Schema

```typescript
const User = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
})

// Inferir tipo TypeScript
type User = z.infer<typeof User>
// { name: string; age: number; email: string }
```

### Parsing

```typescript
// Parse (lança erro se inválido)
const user = User.parse({ name: 'John', age: 30, email: 'john@example.com' })

// Safe parse (retorna resultado)
const result = User.safeParse({ name: 'John', age: 30 })

if (result.success) {
  console.log(result.data)
} else {
  console.log(result.error)
}
```

## Validações Comuns

### Strings

```typescript
z.string()
  .min(5, 'Mínimo 5 caracteres')
  .max(100, 'Máximo 100 caracteres')
  .email('Email inválido')
  .url('URL inválida')
  .regex(/^[A-Z]/, 'Deve começar com maiúscula')
```

### Numbers

```typescript
z.number()
  .min(0, 'Deve ser positivo')
  .max(100, 'Máximo 100')
  .int('Deve ser inteiro')
  .positive('Deve ser positivo')
```

### Arrays

```typescript
z.array(z.string())
  .min(1, 'Array não pode estar vazio')
  .max(10, 'Máximo 10 itens')
```

## Propriedades Opcionais e Nullable

```typescript
const User = z.object({
  name: z.string(),
  age: z.number().optional(), // opcional
  email: z.string().nullable(), // pode ser null
  phone: z.string().nullish(), // pode ser null ou undefined
})
```

## Transformações

```typescript
const stringToLength = z.string().transform(val => val.length)

stringToLength.parse('hello') // => 5
```

### Transformações Assíncronas

```typescript
const idToUser = z.string().transform(async (id) => {
  return await db.getUserById(id)
})

const user = await idToUser.parseAsync('abc123')
```

## Refinements

```typescript
const password = z.string()
  .min(8)
  .refine((val) => val.includes('!'), {
    message: 'Password must contain !',
  })
  .refine((val) => val === val.toLowerCase(), {
    message: 'Must be lowercase',
  })
```

## Unions e Discriminated Unions

```typescript
// Union simples
const stringOrNumber = z.union([z.string(), z.number()])

// Discriminated union (mais eficiente)
const Result = z.discriminatedUnion('status', [
  z.object({ status: z.literal('success'), data: z.string() }),
  z.object({ status: z.literal('error'), error: z.string() }),
])
```

## Enums

```typescript
const Status = z.enum(['pending', 'approved', 'rejected'])

// Ou criar de um TypeScript enum
enum StatusEnum {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}
const Status = z.nativeEnum(StatusEnum)
```

## Literals

```typescript
const Theme = z.literal('dark')
const Themes = z.union([z.literal('dark'), z.literal('light')])
```

## Defaults

```typescript
const name = z.string().default('Anonymous')
name.parse(undefined) // => 'Anonymous'
```

## Extend e Merge

```typescript
const BaseUser = z.object({
  name: z.string(),
  age: z.number(),
})

// Extend
const UserWithEmail = BaseUser.extend({
  email: z.string().email(),
})

// Merge (spread)
const UserWithPhone = z.object({
  ...BaseUser.shape,
  phone: z.string(),
})
```

## Pick e Omit

```typescript
const User = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string(),
})

// Pick
const NameOnly = User.pick({ name: true })

// Omit
const WithoutEmail = User.omit({ email: true })
```

## Partial e Required

```typescript
const User = z.object({
  name: z.string(),
  age: z.number(),
})

// Todas as propriedades opcionais
const PartialUser = User.partial()

// Todas as propriedades obrigatórias
const RequiredUser = User.required()
```

## Arrays e Tuples

```typescript
// Array
const StringArray = z.array(z.string())

// Tuple
const Point = z.tuple([z.number(), z.number()])

// Tuple com rest
const PointWithLabel = z.tuple([z.number(), z.number()]).rest(z.string())
```

## Records

```typescript
// Record com chaves string
const StringRecord = z.record(z.string(), z.number())

// Record com chaves específicas
const UserRecord = z.record(z.enum(['name', 'age']), z.string())
```

## Error Handling

```typescript
const result = User.safeParse(invalidData)

if (!result.success) {
  // Formato simples
  console.log(result.error.flatten())
  /*
  {
    formErrors: [],
    fieldErrors: {
      name: ['Expected string, received null'],
      email: ['Invalid email']
    }
  }
  */

  // Formato completo
  console.log(result.error.issues)
  /*
  [
    {
      code: 'invalid_type',
      expected: 'string',
      received: 'null',
      path: ['name'],
      message: 'Expected string, received null'
    }
  ]
  */
}
```

## Metadata

```typescript
const emailSchema = z.string().email().meta({
  title: 'Email address',
  description: 'Your email address',
  examples: ['user@example.com'],
})
```

## Zod Mini

Versão otimizada para bundle size menor.

```typescript
import * as z from 'zod/mini'

const schema = z.object({
  name: z.string(),
  age: z.number(),
})
```

## Integração com Formulários

### React Hook Form

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

const form = useForm({
  resolver: zodResolver(schema),
})
```

## Versão Utilizada no Projeto

- **zod**: ^4.1.12

## Documentação Oficial

- [Zod Documentation](https://zod.dev)
- [Zod GitHub](https://github.com/colinhacks/zod)

