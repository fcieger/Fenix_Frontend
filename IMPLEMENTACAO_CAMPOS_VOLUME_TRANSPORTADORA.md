# Implementação dos Campos de Volume na Aba Transportadora

## Resumo
Implementados campos de volume, peso e dimensões na aba transportadora do pedido de venda, seguindo os padrões da NFe para informações de transporte.

## Campos Implementados

### 1. Dados de Volume e Peso
- **Peso Líquido (kg)**: Peso líquido total da mercadoria
- **Peso Bruto (kg)**: Peso bruto total incluindo embalagens
- **Volume (m³)**: Volume total em metros cúbicos
- **Quantidade de Volumes**: Número total de volumes/embalagens
- **Espécie**: Tipo de embalagem (ex: Caixas, Pallets, etc.)
- **Marca**: Marca dos volumes
- **Numeração**: Numeração dos volumes

## Arquivos Modificados

### `src/app/vendas/novo/page.tsx`
- Adicionados novos campos ao `formData` inicial
- Atualizada função de carregamento de pedidos existentes
- Atualizadas funções `handleSalvar` e `handleFinalizar` para incluir os novos campos no payload
- Adicionada nova seção "Dados de Volume e Peso" na aba transportadora

## Estrutura dos Campos

```typescript
// Dados de Volume e Peso
pesoLiquido: 0,
pesoBruto: 0,
volume: 0,
especie: '',
marca: '',
numeracao: '',
quantidadeVolumes: 1,
```

## Interface do Usuário

### Nova Seção na Aba Transportadora
- **Título**: "Dados de Volume e Peso"
- **Ícone**: Package
- **Cor**: Laranja (bg-orange-50, border-orange-200)
- **Layout**: Grid responsivo 2 colunas
- **Campos**: 7 campos organizados em grid

### Campos de Entrada
- **Peso Líquido**: Input numérico com step 0.001
- **Peso Bruto**: Input numérico com step 0.001
- **Volume**: Input numérico com step 0.001
- **Quantidade de Volumes**: Input numérico com min 1
- **Espécie**: Input de texto
- **Marca**: Input de texto
- **Numeração**: Input de texto (ocupa 2 colunas)

## Funcionalidades

### 1. Persistência de Dados
- Campos são salvos no banco de dados
- Valores são carregados ao editar pedidos existentes
- Integração completa com funções de salvar e finalizar

### 2. Validação
- Campos numéricos com validação de tipo
- Valores mínimos apropriados
- Step de 0.001 para precisão decimal

### 3. Interface Responsiva
- Layout adaptável para diferentes tamanhos de tela
- Grid responsivo que se ajusta automaticamente
- Campos organizados de forma lógica

## Integração com NFe

### Campos NFe Correspondentes
- **Peso Líquido**: `pesoLiq` na NFe
- **Peso Bruto**: `pesoBruto` na NFe
- **Volume**: `volume` na NFe
- **Quantidade de Volumes**: `qVol` na NFe
- **Espécie**: `esp` na NFe
- **Marca**: `marca` na NFe
- **Numeração**: `nVol` na NFe

### Benefícios
- Informações completas para geração da NFe
- Dados de transporte padronizados
- Facilita cálculos de frete e logística
- Melhora rastreabilidade da mercadoria

## Status
✅ **Implementado e Funcional**

### Próximos Passos Sugeridos
1. Validação de campos obrigatórios
2. Cálculo automático de peso bruto baseado no líquido
3. Integração com calculadora de frete
4. Validação de limites de peso/volume por transportadora
5. Histórico de volumes por pedido

## Exemplo de Uso

```typescript
// Exemplo de preenchimento
const dadosVolume = {
  pesoLiquido: 150.500,      // 150,5 kg
  pesoBruto: 165.750,        // 165,75 kg
  volume: 2.5,               // 2,5 m³
  quantidadeVolumes: 3,      // 3 volumes
  especie: 'Caixas',         // Tipo de embalagem
  marca: 'ABC Logística',    // Marca dos volumes
  numeracao: 'VOL-001, VOL-002, VOL-003' // Numeração
};
```

## Conclusão
A implementação dos campos de volume na aba transportadora está completa e funcional, proporcionando uma interface intuitiva para o preenchimento de informações essenciais para a NFe e logística de transporte.





