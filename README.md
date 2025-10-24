# 🏢 FENIX ERP - Frontend

Sistema ERP completo focado em **pequenas empresas**, com ênfase em gestão fiscal, emissão de NFe e automação de processos contábeis.

## 🎯 **VISÃO GERAL**

O **Fenix** é um sistema ERP moderno desenvolvido para pequenas empresas, oferecendo:
- ✅ Gestão completa de produtos, clientes e vendas
- ✅ Emissão automática de Notas Fiscais Eletrônicas (NFe)
- ✅ Cálculo automático de impostos (IPI, ICMS, etc.)
- ✅ **Múltiplas IAs integradas** para automação de lançamentos
- ✅ **Sistema multi-empresa** para gestão de múltiplas empresas
- ✅ **API externa** para integrações e conexões
- ✅ Dashboard com métricas em tempo real
- ✅ Sistema de autenticação e controle de acesso

## 🚀 **TECNOLOGIAS**

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

## 📁 **ESTRUTURA DO PROJETO**

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

## 🐳 **CONFIGURAÇÃO HÍBRIDA**

O projeto utiliza uma **configuração híbrida** otimizada:

```
🐳 Docker (Infraestrutura):
├── PostgreSQL 15 (porta 5432)
├── Redis 7 (porta 6379)
└── Nginx (proxy reverso - opcional)

💻 Nativo (Aplicações):
├── Backend NestJS (porta 3001)
└── Frontend Next.js (porta 3004)
```

## 🚀 **COMO EXECUTAR**

### **1. Iniciar Infraestrutura (Docker)**
```bash
# Iniciar PostgreSQL e Redis
./start-db-redis.sh

# Ou manualmente:
docker-compose up -d db redis
```

### **2. Iniciar Backend (Nativo)**
```bash
# Iniciar backend nativo
./start-backend-native.sh
```

### **3. Iniciar Frontend (Nativo)**
```bash
# Instalar dependências
npm install

# Iniciar frontend
npm run dev:3004
```

## 🌐 **ACESSO AO SISTEMA**

- **Frontend**: http://localhost:3004
- **Backend API**: http://localhost:3001/api
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🤖 **INTELIGÊNCIA ARTIFICIAL INTEGRADA**

### **IAs Disponíveis no Sistema**
- ✅ **IA de Lançamentos Contábeis** - Automação de lançamentos baseada em regras
- ✅ **IA de Classificação de Produtos** - Categorização automática de produtos
- ✅ **IA de Análise de Vendas** - Insights e previsões de vendas
- ✅ **IA de Gestão de Estoque** - Otimização automática de estoque
- ✅ **IA de Cobrança** - Análise de inadimplência e estratégias de cobrança
- ✅ **IA de Relatórios** - Geração automática de relatórios personalizados

## 🏢 **SISTEMA MULTI-EMPRESA**

### **Funcionalidades Multi-Empresa**
- ✅ **Gestão de Múltiplas Empresas** - Uma conta, várias empresas
- ✅ **Isolamento de Dados** - Cada empresa tem seus dados separados
- ✅ **Usuários Compartilhados** - Acesso a múltiplas empresas
- ✅ **Configurações Individuais** - Cada empresa com suas configurações
- ✅ **Relatórios Consolidados** - Visão unificada de todas as empresas
- ✅ **Controle de Acesso** - Permissões por empresa e usuário

## 🔌 **API EXTERNA PARA INTEGRAÇÕES**

### **Recursos da API**
- ✅ **REST API Completa** - Endpoints para todas as funcionalidades
- ✅ **Autenticação JWT** - Segurança robusta
- ✅ **Documentação Swagger** - API documentada e testável
- ✅ **Rate Limiting** - Controle de requisições
- ✅ **Webhooks** - Notificações em tempo real
- ✅ **SDKs** - Bibliotecas para integração fácil

## 📊 **FUNCIONALIDADES PRINCIPAIS**

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

## 🎨 **DESIGN SYSTEM**

### **Componentes Principais**
- 🎨 **Radix UI** - Componentes acessíveis
- 🎨 **TailwindCSS** - Styling utilitário
- 🎨 **Framer Motion** - Animações suaves
- 🎨 **Lucide React** - Ícones modernos

### **Tema e Cores**
- 🎨 Design moderno e limpo
- 🎨 Responsivo (mobile-first)
- 🎨 Acessibilidade (WCAG)
- 🎨 Dark mode (futuro)

## 📈 **MÉTRICAS E KPIs**

### **Dashboard Principal**
- 📈 Vendas do mês
- 📦 Produtos em estoque baixo
- 🧾 NFe emitidas hoje
- 💰 Faturamento mensal
- ⚠️ Pendências fiscais

## 🔧 **SCRIPTS DISPONÍVEIS**

```bash
# Desenvolvimento
npm run dev:3004          # Iniciar frontend na porta 3004
npm run build             # Build de produção
npm run start             # Iniciar em produção
npm run lint              # Linter

# Docker
./start-db-redis.sh       # Iniciar infraestrutura
./start-backend-native.sh # Iniciar backend nativo
docker-compose up -d      # Iniciar tudo com Docker
docker-compose down       # Parar tudo
```

## 📚 **DOCUMENTAÇÃO**

- 📖 [Contexto do Projeto](./CONTEXTO.md)
- 🐳 [Documentação Docker](./README.Docker.md)
- 🔧 [Configuração de Ambiente](./env.docker.example)

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

## 📝 **LICENÇA**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 **CONTRIBUIÇÃO**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 **CONTATO**

- **Email**: contato@fenix.com.br
- **Telefone**: (11) 99999-9999
- **Endereço**: São Paulo, SP - Brasil

---

**Última atualização**: 2024-12-24  
**Versão**: 1.1.0  
**Status**: ✅ Produção - Funcional (Configuração Híbrida)

---

*Este é o frontend do FENIX ERP - Sistema Inteligente para Pequenas Empresas*
