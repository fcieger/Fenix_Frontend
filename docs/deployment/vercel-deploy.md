# 🚀 Deploy na Vercel - FENIX ERP

## 📋 **VISÃO GERAL DO PROJETO**

- **Frontend**: Next.js (Fenix NextJS)
- **Backend**: NestJS (Fenix Backend)
- **Banco de Dados**: PostgreSQL (Neon)
- **Deploy**: Vercel (Frontend + Backend)
- **Repositório Frontend GitHub**: https://github.com/fcieger/Fenix_Frontend
- **Repositório Backend GitHub**: https://github.com/fcieger/Fenix_Backend

---

## 🎯 **STATUS ATUAL**

- ✅ **Backend**: Deploy automático ativo na Vercel + Neon
- ✅ **Frontend**: Deploy automático ativo na Vercel
- ✅ **Variáveis de ambiente**: Configuradas
- ✅ **Integração**: Frontend + Backend funcionando

---

## 🚀 **DEPLOY AUTOMÁTICO**

### **Frontend (Next.js)**

O frontend está configurado para deploy automático via GitHub → Vercel.

**URL Frontend**: https://fenixfrontendatual.vercel.app
**Deploy**: Automático a cada push no `main`
**Status**: ✅ Ativo e funcionando

**Variáveis de Ambiente (Frontend):**

```bash
NEXT_PUBLIC_API_URL=https://fenix-backend.vercel.app
NEXT_PUBLIC_ENVIRONMENT=production
DATABASE_URL=postgresql://... (para /api/init-db)
```

### **Backend (NestJS)**

O backend está configurado para deploy automático via GitHub → Vercel.

**URL Backend**: https://fenix-backend.vercel.app
**Deploy**: Automático a cada push no `main`
**Status**: ✅ Ativo e funcionando

**Variáveis de Ambiente (Backend):**

```bash
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://localhost:3004,https://fenixfrontendatual.vercel.app
JWT_SECRET=fenix-jwt-secret-key-2024-super-secure
ENCRYPTION_KEY=chave_de_criptografia_super_segura_123456789
```

---

## 📝 **PADRÃO DE COMMIT**

### Atomic Commits

Faça commits atômicos para cada arquivo:

```bash
# Padrão:
git commit -m "${type}(${context}): ${desc} in ${filename}"

# Exemplo:
git commit -m "feat(sales): add new dashboard component in page.tsx"

# Para arquivos criados:
git commit -m "feat(context): created componente-name"
```

**Tipos:**

- `feat` - Nova funcionalidade
- `fix` - Correção de bug
- `chore` - Tarefas de manutenção
- `refactor` - Refatoração
- `docs` - Documentação

**Depois dos commits:**

```bash
git push
# ✅ Deploy automático executado pela Vercel
```

---

## 🗄️ **CONFIGURAÇÃO BANCO DE DADOS (NEON)**

### **1. Acessar Neon Console**

- URL: https://console.neon.tech
- Projeto: **Fenix Database**

### **2. Verificar Conexão**

- Status: ✅ Ativo
- SSL: ✅ Configurado
- Pooler: ✅ Ativo

### **3. Monitorar Performance**

- Dashboard: https://console.neon.tech/dashboard
- Logs: Verificar conexões ativas

---

## 🧪 **TESTES PÓS-DEPLOY**

### **1. Teste Backend**

```bash
# Health Check Simples
curl https://fenix-backend.vercel.app/api/simple-health
# Resposta: {"status":"ok","message":"Simple health check working"}

# Health Check Completo
curl https://fenix-backend.vercel.app/api/health
# Resposta: {"status":"ok","environment":"production","database":true}
```

### **2. Teste Frontend**

```bash
# Health Check Frontend
curl https://fenixfrontendatual.vercel.app/api/health-check
# Resposta: {"frontend":"ok","backend":"ok","environment":"production","database":true}
```

---

## 📊 **MONITORAMENTO**

### **1. Logs da Vercel**

- **Frontend**: https://vercel.com/dashboard → Functions → Logs
- **Backend**: https://vercel.com/dashboard → Functions → Logs

### **2. Performance**

- **Vercel Analytics**: Dashboard da Vercel
- **Neon Dashboard**: https://console.neon.tech/dashboard

### **3. Alertas**

- Configurar alertas para erros 500
- Monitorar tempo de resposta
- Verificar uso de banco de dados

---

## 🚨 **TROUBLESHOOTING**

### **Erro 500 - FUNCTION_INVOCATION_FAILED**

**Causa:** Variáveis de ambiente não configuradas
**Solução:**

1. Verificar todas as variáveis no painel Vercel
2. Aguardar redeploy automático (2-3 minutos)
3. Testar endpoints novamente

### **Erro de Conexão com Banco**

**Causa:** DATABASE_URL incorreta
**Solução:**

1. Verificar string de conexão no Neon
2. Testar conexão localmente
3. Verificar SSL settings

### **Erro de CORS**

**Causa:** CORS_ORIGIN não configurado
**Solução:**

1. Adicionar CORS_ORIGIN no Vercel
2. Incluir domínio do frontend
3. Testar requisições cross-origin

### **Erro de Build**

**Causa:** Dependências ou configuração
**Solução:**

1. Verificar package.json
2. Testar build local: `npm run build`
3. Verificar logs de build na Vercel

---

## ✅ **CHECKLIST DE DEPLOY**

### **Frontend (Next.js) - ✅ COMPLETO**

- [x] Deploy automático ativo
- [x] Variáveis de ambiente configuradas
- [x] Teste de funcionamento realizado
- [x] URL: https://fenixfrontendatual.vercel.app

### **Backend (NestJS) - ✅ COMPLETO**

- [x] Deploy automático ativo
- [x] DATABASE_URL configurada
- [x] NODE_ENV=production configurado
- [x] PORT=3001 configurado
- [x] CORS_ORIGIN configurado
- [x] JWT_SECRET configurado
- [x] ENCRYPTION_KEY configurado
- [x] Teste de endpoints realizado
- [x] URL: https://fenix-backend.vercel.app

### **Banco de Dados (Neon) - ✅ COMPLETO**

- [x] Conexão ativa verificada
- [x] SSL configurado
- [x] Pooler ativo
- [x] Performance monitorada

### **Integração - ✅ COMPLETO**

- [x] Frontend conectando com backend
- [x] CORS funcionando
- [x] Autenticação funcionando
- [x] Banco de dados acessível
- [x] Logs sem erros

---

## 🔄 **COMANDOS RÁPIDOS - DEPLOY AUTOMÁTICO**

### **Deploy Automático (Recomendado)**

```bash
# Frontend - Deploy automático via GitHub
cd /home/fabio/projetos/fenix
git add .
git commit -m "feat: update frontend"
git push origin main
# ✅ Deploy automático executado pela Vercel

# Backend - Deploy automático via GitHub
cd /home/fabio/projetos/fenix-backend
git add .
git commit -m "feat: update backend"
git push origin main
# ✅ Deploy automático executado pela Vercel
```

### **Verificar Status**

```bash
# Testar endpoints diretamente
curl https://fenixfrontendatual.vercel.app/api/health-check
curl https://fenix-backend.vercel.app/api/health
```

---

## 📱 **URLs FINAIS**

- **Frontend**: https://fenixfrontendatual.vercel.app
- **Backend**: https://fenix-backend.vercel.app
- **Health Check**: https://fenixfrontendatual.vercel.app/api/health-check

---

## 🆘 **SUPORTE**

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Next.js Docs**: https://nextjs.org/docs
- **NestJS Docs**: https://docs.nestjs.com

---

**🎉 DEPLOY AUTOMÁTICO ATIVO = FENIX NA NUVEM! 🎉**

**Status**: ✅ Sistema funcionando perfeitamente
**Deploy**: Automático a cada `git push`
**URLs**: Frontend e Backend ativos e operacionais
