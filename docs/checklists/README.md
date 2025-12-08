# Checklists de Refatoração Massiva

Este diretório contém checklists detalhados para implementação da refatoração massiva do frontend.

## 📋 Estrutura

### Checklist Geral
- **[00-checklist-geral.md](./00-checklist-geral.md)** - Visão geral e progresso de todas as fases

### Checklists por Fase

1. **[01-infraestrutura-react-query.md](./01-infraestrutura-react-query.md)**
   - Instalação e configuração do React Query
   - Criação de hooks base
   - Configuração de cache
   - **Prioridade:** 🔴 CRÍTICA
   - **Estimativa:** 2-3 dias

2. **[02-componentizacao-produtos.md](./02-componentizacao-produtos.md)**
   - Refatoração da página de produtos (1.532 → ~200 linhas)
   - Extração de componentes
   - Implementação de React Query
   - **Prioridade:** 🔴 CRÍTICA
   - **Estimativa:** 1 semana

3. **[03-componentizacao-pedidos.md](./03-componentizacao-pedidos.md)**
   - Refatoração de páginas de pedidos (compras, vendas, orçamentos)
   - Componentes compartilhados
   - OrderFormProvider
   - **Prioridade:** 🔴 CRÍTICA
   - **Estimativa:** 2-3 semanas

4. **[04-migracao-sdk.md](./04-migracao-sdk.md)**
   - Migração de todos os serviços para SDK
   - Remoção de `apiService`
   - Atualização de hooks
   - **Prioridade:** 🟡 IMPORTANTE
   - **Estimativa:** 2-3 semanas

5. **[05-componentes-reutilizaveis.md](./05-componentes-reutilizaveis.md)**
   - DataTable, StatsCards, Forms, Modals
   - Empty/Loading/Error states
   - Componentes compartilhados
   - **Prioridade:** 🟡 IMPORTANTE
   - **Estimativa:** 1-2 semanas

6. **[06-otimizacoes-performance.md](./06-otimizacoes-performance.md)**
   - Code splitting
   - Memoização
   - Virtualização
   - Bundle optimization
   - **Prioridade:** 🟡 IMPORTANTE
   - **Estimativa:** 1 semana

7. **[07-ux-acessibilidade.md](./07-ux-acessibilidade.md)**
   - Loading states consistentes
   - Error handling
   - Acessibilidade (WCAG)
   - Responsividade
   - **Prioridade:** 🟡 IMPORTANTE
   - **Estimativa:** 1 semana

## 🚀 Como Usar

1. **Comece pelo Checklist Geral** para entender o panorama completo
2. **Siga a ordem de prioridade** (🔴 CRÍTICA primeiro)
3. **Marque os itens** conforme for completando
4. **Atualize o progresso** no checklist geral
5. **Documente problemas** e soluções encontradas

## 📊 Ordem Recomendada de Implementação

### Semana 1-2: Infraestrutura
- ✅ Checklist 01: React Query
- ✅ Checklist 05: Componentes Base (parcial)

### Semana 3-4: Componentização (Exemplo)
- ✅ Checklist 02: Produtos
- ✅ Checklist 05: Componentes Reutilizáveis (completar)

### Semana 5-7: Componentização (Pedidos)
- ✅ Checklist 03: Pedidos

### Semana 8-10: Migração SDK
- ✅ Checklist 04: SDK

### Semana 11: Otimizações
- ✅ Checklist 06: Performance

### Semana 12: Polimento
- ✅ Checklist 07: UX/Acessibilidade

## 🎯 Critérios de Sucesso

Cada checklist tem seus próprios critérios de aceitação. Em geral:

- ✅ Funcionalidade mantida ou melhorada
- ✅ Código mais limpo e manutenível
- ✅ Performance mantida ou melhorada
- ✅ Testes passando
- ✅ Documentação atualizada

## 📝 Notas

- Os checklists são guias, não regras rígidas
- Adapte conforme necessário para o seu contexto
- Priorize itens críticos primeiro
- Documente decisões e trade-offs

## 🔗 Referências

- [Documento Principal de Refatoração](../refatoracao-massiva.md)
- [Plano de Implementação](../refatoracao-massiva.md#-plano-de-implementação)

---

**Última atualização:** Janeiro 2025

