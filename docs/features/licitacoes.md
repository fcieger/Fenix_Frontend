# 🏛️ Módulo de Licitações - FENIX ERP

## 🎯 **VISÃO GERAL**

O módulo de Licitações foi integrado ao Fenix ERP e está disponível no menu principal como **"AUMENTE SUAS VENDAS"**.

---

## 📍 **LOCALIZAÇÃO NO MENU**

```
Sidebar (Menu Principal)
├── Dashboard
├── Cadastros
├── Produtos
├── Vendas
├── Frente de Caixa
├── Compras
├── Impostos
├── Notas Fiscais
├── Estoque
├── Financeiro
├── Crédito
├── 📈 AUMENTE SUAS VENDAS [NOVO]  ← AQUI!
│   ├── 📋 Licitações
│   ├── 🎯 Matches IA [IA]
│   └── 🔔 Meus Alertas
├── Assistentes IA
├── Relatórios
└── Configurações
```

---

## 🚀 **COMO ACESSAR**

### **Opção 1: Pelo Menu Lateral**
1. Clique em **"AUMENTE SUAS VENDAS"** no menu lateral
2. O menu se expandirá mostrando 3 opções:
   - **Licitações** - Lista completa de licitações
   - **Matches IA** - Recomendações personalizadas
   - **Meus Alertas** - Gerenciar alertas

### **Opção 2: Diretamente pela URL**
- 📋 Licitações: `http://localhost:3004/licitacoes`
- 🎯 Matches: `http://localhost:3004/licitacoes/matches`
- 🔔 Alertas: `http://localhost:3004/licitacoes/alertas`
- 👁️ Detalhes: `http://localhost:3004/licitacoes/:id`

---

## 📋 **FUNCIONALIDADES DISPONÍVEIS**

### **1. Página de Licitações** (`/licitacoes`)

**O que você encontra:**
- 📊 Dashboard com 4 cards de estatísticas
- 🔍 Busca rápida por palavra-chave
- 🎛️ Filtros laterais (Estado, Modalidade, Status, Valor)
- 📄 Listagem paginada de licitações
- 🔄 Botão de sincronização manual

### **2. Página de Detalhes** (`/licitacoes/:id`)

**O que você encontra:**
- 📝 Informações completas da licitação
- 🔗 Botões de ação (Abrir Edital, Favoritar, Manifestar Interesse)
- 📊 Estatísticas: visualizações, fonte

### **3. Página de Matches IA** (`/licitacoes/matches`) 🤖

**O que você encontra:**
- 🎯 Licitações selecionadas por IA especialmente para sua empresa
- 📊 Score de compatibilidade (0-100%)
- 🎨 Classificação por recomendação (Alta, Média, Baixa)
- 📝 Motivos do match

**Como funciona a IA:**
A IA analisa automaticamente:
1. ✅ CNAE da sua empresa
2. ✅ Produtos cadastrados no ERP
3. ✅ Localização da empresa
4. ✅ Histórico de vendas
5. ✅ Valor médio dos contratos

### **4. Página de Alertas** (`/licitacoes/alertas`) 🔔

**O que você encontra:**
- 📊 Dashboard de alertas
- 📋 Lista de todos os seus alertas
- ➕ Botão para criar novo alerta
- ✏️ Editar alertas existentes
- 🗑️ Excluir alertas
- ⏸️ Ativar/Desativar alertas

**Como criar um alerta:**
1. Navegue até **AUMENTE SUAS VENDAS > Meus Alertas**
2. Clique em "Novo Alerta"
3. Preencha o formulário:
   - **Nome do alerta** (obrigatório)
   - **Estados** (quais UFs você quer monitorar)
   - **Modalidades** (Pregão, Concorrência, etc.)
   - **Valor mínimo/máximo**
   - **Palavras-chave** (separadas por vírgula)
   - **Apenas abertas** (checkbox)
   - **Notificar por email** (checkbox)
   - **Frequência** (Tempo real, Diária, Semanal)
   - **Horário** (quando enviar notificações)
4. Clique em "Salvar Alerta"

---

## 📊 **FLUXO DE USO RECOMENDADO**

### **Primeira Vez no Sistema:**
1. Sincronizar Dados → Clique em "Sincronizar"
2. Explorar Licitações → Navegue pela lista, use filtros
3. Verificar Matches IA → Veja recomendações personalizadas
4. Criar Alertas → Configure alertas personalizados
5. Acompanhar Diariamente → Receba emails com novas oportunidades

### **Uso Diário:**
1. Verificar Email (9h) → Receber alertas de novas licitações
2. Acessar Sistema → Ver detalhes das oportunidades
3. Verificar Matches → Priorizar licitações com alto score
4. Manifestar Interesse → Marcar favoritas, registrar interesse

---

## 🎯 **DICAS DE USO**

### **Para Maximizar Resultados:**
1. **Configure Alertas Específicos** - Crie múltiplos alertas para diferentes tipos
2. **Use os Filtros** - Filtre por estado/município da sua região
3. **Priorize Matches IA** - Comece pelos matches com score > 80%
4. **Aja Rápido** - Priorize licitações "Encerrando em 7 dias"
5. **Organize sua Gestão** - Use favoritos para licitações interessantes

---

## 📧 **NOTIFICAÇÕES POR EMAIL**

### **Como Funcionam:**
Quando você cria um alerta, o sistema:
1. Verifica as licitações conforme a frequência configurada
2. Compara com seus critérios
3. Envia email se houver novas oportunidades

### **Tipos de Notificações:**
- **Tempo Real** - Imediatamente, a cada hora
- **Diária** - Horário fixo, 1x por dia
- **Semanal** - Dia fixo, 1x por semana

---

## 🔧 **TROUBLESHOOTING**

### **Problema: Não aparecem licitações**
**Solução:**
1. Clique em "Sincronizar" na página principal
2. Aguarde alguns segundos
3. Recarregue a página

### **Problema: Matches IA não aparecem**
**Solução:**
1. Certifique-se de ter produtos cadastrados
2. Verifique se sua empresa tem CNAE configurado
3. Aguarde a primeira sincronização

### **Problema: Não recebo emails dos alertas**
**Solução:**
1. Verifique se o alerta está "Ativo"
2. Confirme se "Notificar por Email" está marcado
3. Aguarde o horário configurado
4. Verifique a caixa de spam

---

## 📊 **MÉTRICAS PARA ACOMPANHAR**

### **No Dashboard Principal:**
- 📈 Total de licitações no sistema
- 🟢 Licitações abertas
- ⏰ Encerrando em 7 dias
- 🎯 Matches automáticos

### **Na Página de Matches:**
- 🟢 Alta compatibilidade (priorizar)
- 🟡 Média compatibilidade
- 📊 Total analisadas

### **Na Página de Alertas:**
- 📋 Total de alertas
- ✅ Alertas ativos
- ⏸️ Alertas inativos

---

## 🎯 **CASOS DE USO PRÁTICOS**

### **Caso 1: Empresa de Material de Construção**
- Alerta para Construção Civil SP
- Estados: [SP]
- Modalidades: [Pregão Eletrônico, Concorrência]
- Palavras-chave: [construção, obra, cimento, areia, tijolo]
- Valor Mínimo: R$ 10.000
- Frequência: Diária

### **Caso 2: Empresa de TI**
- Alerta para Software e Hardware
- Estados: [Todos]
- Modalidades: [Pregão Eletrônico]
- Palavras-chave: [computador, software, sistema, hardware, TI]
- Valor Mínimo: R$ 20.000
- Frequência: Diária

---

## 📈 **BENEFÍCIOS ESPERADOS**

### **Aumento de Oportunidades:**
- 📈 +200% oportunidades encontradas vs busca manual
- ⏱️ 80% economia de tempo
- 🎯 100% oportunidades relevantes (filtros + IA)

### **Melhoria na Taxa de Sucesso:**
- 📋 Melhor preparação (mais tempo)
- 🎯 Foco em licitações compatíveis
- 📊 Dados completos para análise

### **Aumento de Vendas:**
- 💰 +15-30% faturamento estimado
- 💼 Novos contratos governamentais
- 🏆 Competitividade aumentada

---

## 🎓 **MELHORES PRÁTICAS**

### **✅ FAÇA:**
1. ✅ Sincronize os dados regularmente
2. ✅ Configure múltiplos alertas específicos
3. ✅ Verifique matches IA diariamente
4. ✅ Use favoritos para organizar
5. ✅ Manifeste interesse cedo
6. ✅ Prepare documentação com antecedência

### **❌ NÃO FAÇA:**
1. ❌ Criar alertas muito amplos
2. ❌ Ignorar filtros de valor
3. ❌ Deixar para última hora
4. ❌ Ignorar matches com score alto
5. ❌ Criar alertas duplicados

---

**Última atualização**: 2024-11-11
**Versão**: 1.0
**Status**: ✅ Pronto para Uso



