# 🗄️ Configuração de Banco de Dados no Vercel

## 📋 **OPÇÕES DE BANCO DE DADOS**

### **🟢 Neon (Recomendado)**
- ✅ **Gratuito**: 3GB de armazenamento
- ✅ **PostgreSQL** nativo
- ✅ **Conexão direta** com Vercel
- ✅ **Interface web** amigável
- 🌐 **URL**: https://neon.tech

### **🟡 Supabase**
- ✅ **Gratuito**: 500MB de armazenamento
- ✅ **PostgreSQL** + APIs extras
- ✅ **Dashboard** completo
- 🌐 **URL**: https://supabase.com

### **🟡 PlanetScale**
- ⚠️ **MySQL** (não PostgreSQL)
- ✅ **Gratuito**: 1GB de armazenamento
- ✅ **Branching** de banco
- 🌐 **URL**: https://planetscale.com

## 🚀 **CONFIGURAÇÃO COM NEON (RECOMENDADO)**

### **1. Criar Conta no Neon**
1. Acesse https://neon.tech
2. Clique em "Sign Up"
3. Conecte com GitHub (recomendado)
4. Crie um novo projeto

### **2. Configurar Projeto**
1. **Nome do projeto**: `fenix-backend`
2. **Região**: `São Paulo` (mais próxima)
3. **PostgreSQL**: Versão 15 ou 16

### **3. Obter String de Conexão**
Após criar o projeto, você receberá:
```bash
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### **4. Configurar no Vercel**

#### **Backend (Fenix_Backend)**
1. Acesse o painel da Vercel
2. Vá em **Settings → Environment Variables**
3. Adicione as seguintes variáveis:

```bash
# Banco de Dados
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
DB_HOST=ep-xxx-xxx.us-east-1.aws.neon.tech
DB_PORT=5432
DB_USERNAME=username
DB_PASSWORD=password
DB_DATABASE=neondb

# Redis (opcional - usar Upstash)
REDIS_URL=redis://username:password@xxx.upstash.io:6379

# CORS
CORS_ORIGIN=http://localhost:3004,https://fenixfrontendatual.vercel.app

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h

# Criptografia
ENCRYPTION_KEY=chave_de_criptografia_super_segura_123456789

# Ambiente
NODE_ENV=production
PORT=3001
```

#### **Frontend (Fenix_Frontend)**
```bash
NEXT_PUBLIC_API_URL=https://fenix-backend.vercel.app
```

## 🔧 **CONFIGURAÇÃO COM SUPABASE**

### **1. Criar Projeto no Supabase**
1. Acesse https://supabase.com
2. Clique em "Start your project"
3. Conecte com GitHub
4. Crie um novo projeto

### **2. Obter Credenciais**
No dashboard do Supabase:
1. Vá em **Settings → Database**
2. Copie a **Connection string**

### **3. Configurar no Vercel**
Use as mesmas variáveis do Neon, mas com a string do Supabase.

## 🧪 **TESTANDO A CONEXÃO**

### **1. Endpoint de Teste**
```bash
# Testar conexão simples
curl https://fenix-backend.vercel.app/api/simple-health

# Testar health check completo
curl https://fenix-backend.vercel.app/api/health
```

### **2. Verificar Logs**
1. Acesse o painel da Vercel
2. Vá em **Functions → Logs**
3. Verifique se há erros de conexão

## 🚨 **TROUBLESHOOTING**

### **Problemas Comuns**
1. **Erro de SSL**: Adicione `?sslmode=require` na URL
2. **Timeout**: Verifique se o banco está na mesma região
3. **Credenciais**: Verifique username/password
4. **Firewall**: Verifique se o banco aceita conexões externas

### **Verificar Conexão**
```bash
# Testar conexão local
psql "postgresql://username:password@host:port/database?sslmode=require"
```

## 📊 **MONITORAMENTO**

### **1. Neon Dashboard**
- Acesse o dashboard do Neon
- Monitore uso de CPU, memória e storage
- Verifique logs de conexão

### **2. Vercel Analytics**
- Acesse o painel da Vercel
- Vá em **Analytics**
- Monitore performance das funções

## 💰 **CUSTOS**

### **Neon (Gratuito)**
- ✅ 3GB de armazenamento
- ✅ 10GB de transferência/mês
- ✅ 0.5GB de RAM
- ✅ 1 CPU compartilhada

### **Supabase (Gratuito)**
- ✅ 500MB de armazenamento
- ✅ 2GB de transferência/mês
- ✅ 1GB de RAM
- ✅ 1 CPU compartilhada

## 🎯 **PRÓXIMOS PASSOS**

1. **Escolher** entre Neon ou Supabase
2. **Criar** conta e projeto
3. **Configurar** variáveis no Vercel
4. **Testar** endpoints
5. **Monitorar** performance
