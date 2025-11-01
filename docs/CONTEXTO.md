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

## 🐳 **DOCKER E CONTAINERIZAÇÃO**

### **⚠️ CONFIGURAÇÃO HÍBRIDA ATUAL**
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

### **Docker Compose (Infraestrutura)**
```yaml
# docker-compose.yml
services:
  # Banco de dados PostgreSQL
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=fenix
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=fenix123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - fenix-network
    restart: unless-stopped

  # Redis para cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - fenix-network
    restart: unless-stopped
    command: redis-server --appendonly yes

volumes:
  postgres_data:
  redis_data:

networks:
  fenix-network:
    driver: bridge
```

### **🎯 Por que Configuração Híbrida?**
- ✅ **Desenvolvimento Mais Rápido** - Hot reload nativo
- ✅ **Debug Mais Fácil** - Logs diretos no terminal
- ✅ **Menos Recursos** - Apenas infraestrutura em Docker
- ✅ **Compatibilidade** - Evita problemas de módulos Node.js no Alpine
- ✅ **Flexibilidade** - Fácil alternar entre nativo e Docker

### **Comandos Docker (Infraestrutura)**
```bash
# Iniciar apenas PostgreSQL e Redis
docker-compose up -d db redis

# Parar infraestrutura
docker-compose down

# Ver logs da infraestrutura
docker-compose logs -f db redis

# Reiniciar PostgreSQL
docker-compose restart db

# Verificar status
docker ps
```

### **🔧 Configuração Completa com Docker (Alternativa)**
```bash
# Se preferir tudo em Docker
docker-compose up -d

# Parar tudo
docker-compose down
```

---

## 🚀 **COMO EXECUTAR O PROJETO**

### **⚠️ CONFIGURAÇÃO HÍBRIDA RECOMENDADA**
O projeto utiliza uma **configuração híbrida** que combina Docker para infraestrutura e execução nativa para aplicações:

```
🐳 Docker (Infraestrutura):
├── PostgreSQL (porta 5432)
└── Redis (porta 6379)

💻 Nativo (Aplicações):
├── Backend NestJS (porta 3001)
└── Frontend Next.js (porta 3004)
```

### **🚀 INÍCIO RÁPIDO (Recomendado)**

#### **1. Iniciar Infraestrutura (Docker)**
```bash
# Iniciar PostgreSQL e Redis
cd /home/fabio/projetos/fenix
./start-db-redis.sh

# Ou manualmente:
docker-compose up -d db redis
```

#### **2. Iniciar Backend (Nativo)**
```bash
# Iniciar backend nativo
cd /home/fabio/projetos/fenix-backend
export NODE_ENV=development
export PORT=3001
export DATABASE_URL="postgresql://postgres:fenix123@localhost:5432/fenix"
export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=postgres
export DB_PASSWORD=fenix123
export DB_DATABASE=fenix
export TYPEORM_HOST=localhost
export TYPEORM_PORT=5432
export TYPEORM_USERNAME=postgres
export TYPEORM_PASSWORD=fenix123
export TYPEORM_DATABASE=fenix
export JWT_SECRET="seu_jwt_secret_aqui"
export ENCRYPTION_KEY="chave_de_criptografia_super_segura_123456789"
export REDIS_URL="redis://localhost:6379"
npm run start:dev
```

#### **3. Iniciar Frontend (Nativo)**
```bash
# Em outro terminal
cd /home/fabio/projetos/fenix
npm run dev:3004
```

### **📋 Scripts de Automação**
```bash
# Iniciar infraestrutura (PostgreSQL + Redis)
./start-db-redis.sh

# Iniciar backend nativo
./start-backend-native.sh

# Iniciar frontend nativo
npm run dev:3004

# Parar infraestrutura
docker-compose down
```

### **🌐 Acesso ao Sistema**
- **Frontend**: http://localhost:3004
- **Backend API**: http://localhost:3001/api
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### **🔧 Configuração Completa com Docker (Alternativa)**
```bash
# Iniciar tudo com Docker (se preferir)
docker-compose up -d

# Parar tudo
docker-compose down
```

### **⚠️ Troubleshooting**

#### **Backend não conecta ao banco:**
```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Verificar logs do PostgreSQL
docker-compose logs db

# Reiniciar PostgreSQL
docker-compose restart db
```

#### **Erro de permissão no backend:**
```bash
# Verificar permissões do diretório uploads
ls -la /home/fabio/projetos/fenix/uploads

# Criar diretório se não existir
mkdir -p /home/fabio/projetos/fenix/uploads
chmod 755 /home/fabio/projetos/fenix/uploads
```

#### **Frontend não carrega:**
```bash
# Verificar se backend está rodando
curl http://localhost:3001/api

# Verificar logs do backend
# (verificar terminal onde backend está rodando)
```

---

## 📚 **CONTROLE DE VERSÃO E REPOSITÓRIO**

### **GitHub Repository**
- 🔗 **Repositório Principal**: [GitHub - FENIX ERP](https://github.com/seu-usuario/fenix-erp)
- 📝 **Commits Automáticos** - Todas as alterações são commitadas automaticamente
- 🌿 **Branches Organizadas** - Desenvolvimento, staging, produção
- 📋 **Issues e Pull Requests** - Gestão de tarefas e revisões
- 🏷️ **Tags de Versão** - Versionamento semântico (v1.0.0, v1.1.0, etc.)

### **Estrutura do Repositório**
```
fenix-erp/
├── frontend/          # Código do Next.js
├── backend/           # Código do NestJS
├── docs/              # Documentação
├── scripts/           # Scripts de automação
├── docker/            # Configurações Docker
├── docker-compose.yml # Orquestração de containers
├── Dockerfile         # Imagem do frontend
├── Dockerfile.backend # Imagem do backend
└── README.md          # Documentação principal
```

### **Workflow de Desenvolvimento**
- ✅ **Commits Diários** - Alterações salvas automaticamente
- ✅ **Branches por Feature** - Uma branch para cada funcionalidade
- ✅ **Code Review** - Revisão antes de merge
- ✅ **Deploy Automático** - Deploy automático em staging
- ✅ **Backup Contínuo** - Código sempre seguro no GitHub

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

## 🔧 **CONFIGURAÇÕES IMPORTANTES**

### **Variáveis de Ambiente (Configuração Híbrida)**

#### **Backend (Nativo)**
```bash
# Configuração do Backend
export NODE_ENV=development
export PORT=3001
export DATABASE_URL="postgresql://postgres:fenix123@localhost:5432/fenix"
export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=postgres
export DB_PASSWORD=fenix123
export DB_DATABASE=fenix
export TYPEORM_HOST=localhost
export TYPEORM_PORT=5432
export TYPEORM_USERNAME=postgres
export TYPEORM_PASSWORD=fenix123
export TYPEORM_DATABASE=fenix
export JWT_SECRET="seu_jwt_secret_aqui"
export ENCRYPTION_KEY="chave_de_criptografia_super_segura_123456789"
export REDIS_URL="redis://localhost:6379"
```

#### **Frontend (Nativo)**
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
```

#### **Docker (Infraestrutura)**
```yaml
# docker-compose.yml
environment:
  - POSTGRES_DB=fenix
  - POSTGRES_USER=postgres
  - POSTGRES_PASSWORD=fenix123
```

### **GitHub (Controle de Versão)**
```env
# Configurações do GitHub
GITHUB_TOKEN=seu_token_aqui
GITHUB_REPO=seu-usuario/fenix-erp
GITHUB_BRANCH=main
```

### **Banco de Dados**
- **PostgreSQL** como banco principal
- **TypeORM** para mapeamento objeto-relacional
- **Migrations** para versionamento do schema
- **Seeds** para dados iniciais

---

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

---

## 🧪 **TESTES E QUALIDADE**

### **Testes Implementados**
- ✅ **Testes de integração** - API endpoints
- ✅ **Testes de autenticação** - Login/logout

### **Scripts de Teste**
```bash
# Executar testes
node test-integration.js

# Verificar usuários
node check-users.js
```

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

## 🎯 **OBJETIVOS DO DESENVOLVIMENTO**

### **Curto Prazo (1-3 meses)**
- ✅ Sistema estável e funcional
- ✅ Integração NFe 100% operacional
- ✅ Interface polida e intuitiva
- ✅ Testes automatizados

### **Médio Prazo (3-6 meses)**
- 🔄 Relatórios avançados
- 🔄 App mobile
- 🔄 Integrações com e-commerce
- 🔄 Performance otimizada

### **Longo Prazo (6+ meses)**
- 🔄 Multi-tenant
- 🔄 API pública
- 🔄 Automação fiscal completa
- 🔄 Escalabilidade empresarial

---

## 📝 **NOTAS IMPORTANTES**

### **Para Desenvolvedores**
- 🚨 **Manter logs** detalhados para debug
- 🚨 **Backup** do banco antes de migrations
- 🚨 **Testar funcionalidades** antes de deploy
- 🚨 **Commits frequentes** - Salvar alterações no GitHub
- 🚨 **Branches organizadas** - Uma branch por feature
- 🚨 **Pull Requests** - Revisar código antes de merge

### **Para Usuários**
- 📚 **Documentação** completa disponível
- 🎓 **Treinamento** para uso do sistema
- 🆘 **Suporte** técnico disponível
- 🔄 **Atualizações** regulares

---

**Última atualização**: 2024-12-24  
**Versão**: 1.1.0  
**Status**: ✅ Produção - Funcional (Configuração Híbrida)

---

*Este documento serve como referência completa do projeto Fenix ERP. Mantenha-o atualizado conforme o desenvolvimento progride.*
