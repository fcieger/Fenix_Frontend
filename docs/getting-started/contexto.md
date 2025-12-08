# 🏢 FENIX ERP - CONTEXTO DO PROJETO

## 🎯 **MISSÃO**
Desenvolver um ERP completo focado em **pequenas empresas**, com ênfase em gestão fiscal, emissão de NFe e automação de processos contábeis.

---

## 📋 **VISÃO GERAL DO SISTEMA**

### **O que é o Fenix?**
O **Fenix** é um sistema ERP moderno desenvolvido para pequenas empresas, oferecendo:
- ✅ Gestão completa
- ✅ Emissão automática de Notas Fiscais Eletrônicas (NFe)
- ✅ Cálculo automático de impostos (IPI, ICMS, etc.)
- ✅ **Múltiplas IAs integradas** para automação de lançamentos
- ✅ **Sistema multi-empresa** para gestão de múltiplas empresas
- ✅ **API externa** para integrações e conexões
- ✅ Dashboard com métricas em tempo real
- ✅ Sistema de autenticação e controle de acesso

---

## 🏗️ **ARQUITETURA TÉCNICA**

### **Frontend (Next.js 15.5.4)**
```
Porta: 3004
Tecnologias:
├── Next.js 15.5.4 (React 19.1.0)
├── TypeScript (tipagem estática)
├── TailwindCSS 4 (styling moderno)
├── Radix UI (componentes acessíveis)
├── Framer Motion (animações)
├── Axios (HTTP client)
└── Context API (estado global)
```

### **Backend (NestJS 11.0.1)**
```
Porta: 3001
Tecnologias:
├── NestJS 11.0.1 (framework Node.js)
├── PostgreSQL (banco de dados)
├── TypeORM (ORM para banco)
├── JWT (autenticação segura)
├── Passport (estratégias de auth)
├── CORS (comunicação frontend)
└── Validação (class-validator)
```

### **Containerização (Docker)**
```
Docker Compose:
├── Frontend Container (Next.js)
├── Backend Container (NestJS)
├── Database Container (PostgreSQL)
├── Redis Container (Cache)
└── Nginx Container (Proxy Reverso)
```

---

## 📁 **ESTRUTURA DE DIRETÓRIOS**

### **Frontend (`/home/fabio/projetos/fenix/`)**
```
src/
├── app/                    # Páginas Next.js (App Router)
│   ├── dashboard/         # Dashboard principal
│   ├── vendas/           # Gestão de vendas
│   ├── produtos/         # Cadastro de produtos
│   ├── nfe/              # Emissão de NFe
│   ├── cadastros/        # Clientes, fornecedores
│   ├── impostos/         # Gestão de impostos
│   ├── configuracoes/    # Configurações do sistema
│   └── login/            # Autenticação
├── components/           # Componentes reutilizáveis
├── contexts/            # Context API (estado global)
├── hooks/               # Custom hooks
├── lib/                 # Utilitários
├── services/            # Serviços de API
└── config/              # Configurações
```

### **Backend (`/home/fabio/projetos/fenix-backend/`)**
```
src/
├── auth/                # Autenticação e autorização
├── nfe/                 # Gestão de NFe
├── nfe-integration/     # Integração com API externa
├── produtos/            # Gestão de produtos
├── pedidos-venda/       # Gestão de vendas
├── impostos/            # Cálculo de impostos
├── certificados/        # Gestão de certificados digitais
├── companies/           # Gestão de empresas
├── users/               # Gestão de usuários
├── financeiro/          # Gestão financeira
├── shared/              # Utilitários compartilhados
└── migrations/          # Migrações do banco
```

---

## 🤖 **INTELIGÊNCIA ARTIFICIAL INTEGRADA**

### **IAs Disponíveis no Sistema**
- ✅ **IA de Lançamentos Contábeis** - Automação de lançamentos baseada em regras
- ✅ **IA de Classificação de Produtos** - Categorização automática de produtos
- ✅ **IA de Análise de Vendas** - Insights e previsões de vendas
- ✅ **IA de Gestão de Estoque** - Otimização automática de estoque
- ✅ **IA de Cobrança** - Análise de inadimplência e estratégias de cobrança
- ✅ **IA de Relatórios** - Geração automática de relatórios personalizados

### **Benefícios das IAs**
- 🚀 **Automação** - Reduz trabalho manual em 80%
- 📊 **Insights** - Análises inteligentes para tomada de decisão
- ⚡ **Eficiência** - Processos mais rápidos e precisos
- 🎯 **Personalização** - Adaptação às necessidades de cada empresa

---

## 🏢 **SISTEMA MULTI-EMPRESA**

### **Funcionalidades Multi-Empresa**
- ✅ **Gestão de Múltiplas Empresas** - Uma conta, várias empresas
- ✅ **Isolamento de Dados** - Cada empresa tem seus dados separados
- ✅ **Usuários Compartilhados** - Acesso a múltiplas empresas
- ✅ **Configurações Individuais** - Cada empresa com suas configurações
- ✅ **Relatórios Consolidados** - Visão unificada de todas as empresas
- ✅ **Controle de Acesso** - Permissões por empresa e usuário

### **Benefícios Multi-Empresa**
- 💼 **Escalabilidade** - Cresça com múltiplas empresas
- 🔒 **Segurança** - Dados isolados e seguros
- 📈 **Eficiência** - Gestão centralizada
- 💰 **Custo-Benefício** - Uma solução para várias empresas

---

## 🔌 **API EXTERNA PARA INTEGRAÇÕES**

### **Recursos da API**
- ✅ **REST API Completa** - Endpoints para todas as funcionalidades
- ✅ **Autenticação JWT** - Segurança robusta
- ✅ **Documentação Swagger** - API documentada e testável
- ✅ **Rate Limiting** - Controle de requisições
- ✅ **Webhooks** - Notificações em tempo real
- ✅ **SDKs** - Bibliotecas para integração fácil

### Endpoints Orçamentos (interno)
- POST `/api/orcamentos` — criar orçamento (status pendente)
- GET `/api/orcamentos` — listar (filtros: status, clienteId, companyId, período)
- GET `/api/orcamentos/:id` — detalhes
- PUT `/api/orcamentos/:id` — editar (se pendente)
- PATCH `/api/orcamentos/:id/status` — pendente/concluido
- POST `/api/orcamentos/:id/recalcular-impostos` — recalcular (stub fiscal)
- DELETE `/api/orcamentos/:id` — excluir

### **Casos de Uso da API**
- 🔗 **Integração com E-commerce** - Shopify, WooCommerce, Magento
- 🔗 **Sistemas de Pagamento** - Stripe, PagSeguro, Mercado Pago
- 🔗 **ERPs Externos** - SAP, Oracle, Microsoft Dynamics
- 🔗 **Sistemas Fiscais** - SEFAZ, Receita Federal
- 🔗 **Aplicativos Mobile** - Apps nativos e híbridos
- 🔗 **Ferramentas de BI** - Power BI, Tableau, Looker

---

## 🎯 **FUNCIONALIDADES PRINCIPAIS**

### **1. Gestão de Vendas**
- ✅ Criação de pedidos de venda
- ✅ Controle de status (rascunho, confirmado, faturado)
- ✅ Cálculo automático de impostos
- ✅ Integração com emissão de NFe

### **2. Gestão de Produtos**
- ✅ Cadastro completo de produtos
- ✅ Controle de estoque
- ✅ Categorização e busca
- ✅ Preços e margens

### **3. Sistema NFe**
- ✅ Emissão automática de NFe
- ✅ Integração com API externa
- ✅ Download de XML, PDF, DANFE
- ✅ Cancelamento com justificativa
- ✅ Consulta de status em tempo real

### **4. Gestão Fiscal**
- ✅ Cálculo automático de IPI, ICMS
- ✅ Configuração de impostos por estado
- ✅ Relatórios fiscais
- ✅ Certificados digitais

### **5. Cadastros**
- ✅ Clientes e fornecedores
- ✅ Dados da empresa
- ✅ Configurações fiscais
- ✅ Usuários e permissões

---

## 🎯 **PÚBLICO-ALVO**

### **Pequenas Empresas que precisam de:**
- ✅ Emissão de NFe de forma simples
- ✅ Controle de vendas e produtos
- ✅ Cálculo automático de impostos
- ✅ **Automação com IA** para lançamentos e análises
- ✅ **Gestão multi-empresa** para crescimento
- ✅ **API externa** para integrações
- ✅ Dashboard com métricas importantes
- ✅ Interface intuitiva e moderna
- ✅ Custo-benefício atrativo

### **Setores de Atuação:**
- 🏪 Comércio varejista
- 🏭 Pequenas indústrias
- 💼 Prestação de serviços
- 🛒 E-commerce
- 📦 Distribuidoras

---

## 📊 **MÉTRICAS E KPIs**

### **Dashboard Principal**
- 📈 Vendas do mês
- 📦 Produtos em estoque baixo
- 🧾 NFe emitidas hoje
- 💰 Faturamento mensal
- ⚠️ Pendências fiscais

### **Relatórios Disponíveis**
- 📋 Relatório de vendas
- 📊 Análise de produtos
- 🧾 Relatório fiscal
- 👥 Relatório de clientes
- 💰 Análise financeira

---

## 📈 **ROADMAP FUTURO**

### **Próximas Funcionalidades**
- 🔄 **IAs Avançadas** - Machine Learning para previsões
- 🔄 **Relatórios avançados** - BI e analytics
- 🔄 **Integração com e-commerce** - Shopify, WooCommerce
- 🔄 **App mobile** - React Native
- 🔄 **API pública** - Para integrações
- 🔄 **Multi-tenant** - Múltiplas empresas
- 🔄 **Automação fiscal** - SPED, EFD
- 🔄 **Chatbot IA** - Suporte automatizado

### **Melhorias Técnicas**
- 🔄 **Performance** - Otimização de queries
- 🔄 **Cache** - Redis para performance
- 🔄 **Monitoramento** - Logs e métricas
- 🔄 **CI/CD** - Deploy automatizado
- 🔄 **Docker** - Containerização completa
- 🔄 **Kubernetes** - Orquestração em produção

---

**Última atualização**: 2024-12-24
**Versão**: 1.1.0
**Status**: ✅ Produção - Funcional (Configuração Híbrida)

---

*Este documento serve como referência completa do projeto Fenix ERP. Mantenha-o atualizado conforme o desenvolvimento progride.*





