# Checklist: Otimizações de Performance

## 🎯 Objetivo
Implementar otimizações de performance para melhorar tempo de carregamento, reduzir re-renders e otimizar bundle size.

---

## 📦 Code Splitting

### Dynamic Imports
- [ ] Identificar componentes pesados
- [ ] Identificar componentes usados condicionalmente
- [ ] Identificar componentes de modais
- [ ] Identificar componentes de formulários complexos

### Implementar Dynamic Imports
- [ ] Usar `next/dynamic` para componentes pesados
  - [ ] Componentes de gráficos/charts
  - [ ] Componentes de tabela complexos
  - [ ] Componentes de formulários grandes
  - [ ] Componentes de modais
- [ ] Configurar `loading` state para cada dynamic import
- [ ] Configurar `ssr: false` quando apropriado
- [ ] Testar se code splitting está funcionando (verificar Network tab)

### Exemplos
- [ ] `ProductsList` - Dynamic import se for pesado
- [ ] `OrderForm` - Dynamic import (formulário complexo)
- [ ] `Charts/Reports` - Dynamic import (bibliotecas pesadas)
- [ ] `Modals` - Dynamic import (carregar sob demanda)

---

## 🧠 Memoização

### React.memo
- [ ] Identificar componentes que re-renderizam desnecessariamente
- [ ] Aplicar `React.memo` em componentes de lista (ProductCard, OrderItemRow, etc.)
- [ ] Criar função de comparação customizada quando necessário
- [ ] Verificar se memoização está funcionando (React DevTools Profiler)

### useMemo
- [ ] Identificar cálculos pesados
- [ ] Aplicar `useMemo` em:
  - [ ] Cálculos de totais
  - [ ] Filtros e ordenação de listas
  - [ ] Transformações de dados
- [ ] Verificar dependências corretas

### useCallback
- [ ] Identificar funções passadas como props
- [ ] Aplicar `useCallback` em:
  - [ ] Handlers de eventos
  - [ ] Funções passadas para componentes filhos
  - [ ] Funções em dependências de hooks
- [ ] Verificar dependências corretas

### Exemplos Específicos
- [ ] `ProductCard` - Memoizar com comparação por ID e updatedAt
- [ ] `OrderItemRow` - Memoizar com comparação por item ID
- [ ] `calculateTotals` - useMemo com dependência de items
- [ ] `handleSubmit` - useCallback

---

## 📊 Virtualização

### Identificar Necessidade
- [ ] Identificar listas com muitos itens (>100)
- [ ] Verificar performance de scroll
- [ ] Medir tempo de renderização

### Implementar Virtualização
- [ ] Instalar `@tanstack/react-virtual`
- [ ] Criar componente virtualizado genérico
- [ ] Aplicar em listas grandes:
  - [ ] Lista de produtos (se >100)
  - [ ] Lista de pedidos
  - [ ] Lista de itens em pedido (se muitos itens)
- [ ] Configurar `estimateSize` adequadamente
- [ ] Configurar `overscan` para smooth scroll

### Testes
- [ ] Testar scroll suave
- [ ] Testar com diferentes quantidades de itens
- [ ] Medir performance antes/depois

---

## 🗜️ Bundle Optimization

### Análise de Bundle
- [ ] Executar `next build` e analisar output
- [ ] Identificar bibliotecas grandes
- [ ] Identificar código duplicado
- [ ] Verificar tree-shaking

### Otimizações
- [ ] Verificar se todas as importações são necessárias
- [ ] Usar importações nomeadas quando possível
- [ ] Remover bibliotecas não usadas
- [ ] Considerar alternativas mais leves para bibliotecas pesadas
- [ ] Verificar se polyfills são necessários

### Lazy Loading de Bibliotecas
- [ ] Identificar bibliotecas pesadas usadas condicionalmente
- [ ] Implementar lazy loading:
  - [ ] Bibliotecas de gráficos (só carregar quando necessário)
  - [ ] Bibliotecas de PDF (só carregar quando necessário)
  - [ ] Bibliotecas de validação (só carregar em formulários)

---

## 🖼️ Otimização de Imagens

### Next.js Image
- [ ] Verificar se está usando `next/image`
- [ ] Configurar `width` e `height` quando possível
- [ ] Usar `priority` apenas para imagens acima da dobra
- [ ] Configurar `loading="lazy"` para imagens abaixo da dobra
- [ ] Configurar `sizes` adequadamente

### Otimizações Adicionais
- [ ] Comprimir imagens antes de fazer upload
- [ ] Usar formatos modernos (WebP, AVIF) quando possível
- [ ] Considerar CDN para imagens

---

## 🔄 Otimização de Queries

### React Query Optimization
- [ ] Configurar `staleTime` adequadamente por query
- [ ] Configurar `cacheTime` adequadamente
- [ ] Usar `keepPreviousData` para paginação
- [ ] Implementar `prefetchQuery` onde apropriado
- [ ] Usar `useInfiniteQuery` para listas infinitas

### Reduzir Re-fetches
- [ ] Verificar se queries estão sendo invalidadas desnecessariamente
- [ ] Usar `refetchOnWindowFocus: false` quando apropriado
- [ ] Usar `refetchOnMount: false` quando apropriado
- [ ] Implementar background refetch apenas quando necessário

---

## 📱 Performance Mobile

### Otimizações Mobile
- [ ] Testar performance em dispositivos móveis
- [ ] Reduzir JavaScript inicial (code splitting)
- [ ] Otimizar imagens para mobile
- [ ] Considerar lazy loading de componentes abaixo da dobra
- [ ] Verificar tamanho de bundle mobile

---

## 🧪 Medição e Monitoramento

### Ferramentas
- [ ] Configurar React DevTools Profiler
- [ ] Usar Lighthouse para auditoria
- [ ] Usar Web Vitals (Next.js já inclui)
- [ ] Monitorar Core Web Vitals:
  - [ ] LCP (Largest Contentful Paint)
  - [ ] FID (First Input Delay)
  - [ ] CLS (Cumulative Layout Shift)

### Métricas Antes
- [ ] Medir tempo de carregamento inicial
- [ ] Medir tamanho de bundle
- [ ] Medir tempo de interação
- [ ] Documentar métricas baseline

### Métricas Depois
- [ ] Medir novamente após otimizações
- [ ] Comparar com baseline
- [ ] Verificar melhorias
- [ ] Documentar ganhos

---

## ✅ Critérios de Aceitação

### Performance
- [ ] Lighthouse score > 90 (Performance)
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle size reduzido em pelo menos 20%

### Funcionalidade
- [ ] Todas as funcionalidades ainda funcionando
- [ ] UX mantida ou melhorada
- [ ] Sem regressões visuais

---

## 🎯 Priorização

### 🔴 Alta Prioridade
1. Code splitting de componentes pesados
2. Memoização de componentes de lista
3. Otimização de React Query (staleTime, cacheTime)
4. Bundle analysis e remoção de código não usado

### 🟡 Média Prioridade
1. Virtualização de listas grandes
2. useMemo/useCallback em cálculos pesados
3. Lazy loading de bibliotecas

### 🟢 Baixa Prioridade
1. Otimização de imagens (se não houver muitas)
2. Otimizações mobile específicas

---

## 📊 Checklist de Verificação

### Antes de Considerar Completo
- [ ] Code splitting implementado
- [ ] Memoização aplicada onde necessário
- [ ] Bundle analisado e otimizado
- [ ] React Query otimizado
- [ ] Performance medida (Lighthouse)
- [ ] Métricas documentadas
- [ ] Testes passando
- [ ] Sem regressões

---

**Prioridade:** 🟡 IMPORTANTE
**Estimativa:** 1 semana
**Dependências:** Checklists anteriores (componentes criados)

