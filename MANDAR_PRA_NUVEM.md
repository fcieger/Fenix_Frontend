# 🚀 MANDAR PRA NUVEM - FENIX PROJECT

## 📋 **VISÃO GERAL DO PROJETO**
- **Frontend**: Next.js (Fenix NextJS)
- **Backend**: NestJS (Fenix Backend) 
- **Banco de Dados**: PostgreSQL (Neon)
- **Deploy**: Vercel (Frontend + Backend)

## 🎯 **STATUS ATUAL**
- ✅ **Backend**: Configurado para Vercel + Neon
- ✅ **Frontend**: Next.js pronto para deploy
- ⚠️ **Necessário**: Configurar variáveis de ambiente

---

## 🚀 **DEPLOY FRONTEND (NEXT.JS)**

### **0. COMMIT CHANGES FIRST (OBRIGATÓRIO)**
```bash
# Fazer commit de todas as mudanças antes do deploy
git add .
git commit -m "feat(deploy): prepare for cloud deployment"
git push origin main
```

### **1. Preparar Projeto Frontend**
```bash
cd /home/fabio/projetos/fenix
```

### **2. Instalar Vercel CLI**
```bash
npm install -g vercel
```

### **3. Login na Vercel**
```bash
vercel login
```

### **4. Deploy do Frontend**
```bash
# Na pasta do frontend
vercel --prod
```

### **5. Configurar Variáveis de Ambiente (Frontend)**
No painel da Vercel, adicionar:
```bash
NEXT_PUBLIC_API_URL=https://fenix-backend.vercel.app
NEXT_PUBLIC_ENVIRONMENT=production
```

---

## 🔧 **DEPLOY BACKEND (NESTJS)**

### **0. COMMIT CHANGES FIRST (OBRIGATÓRIO)**
```bash
# Fazer commit de todas as mudanças antes do deploy
cd /home/fabio/projetos/fenix-backend
git add .
git commit -m "feat(deploy): prepare backend for cloud deployment"
git push origin main
```

### **1. Preparar Projeto Backend**
```bash
cd /home/fabio/projetos/fenix-backend
```

### **2. Deploy do Backend**
```bash
# Na pasta do backend
vercel --prod
```

### **3. Configurar Variáveis de Ambiente (Backend)**
No painel da Vercel, adicionar:

#### **DATABASE_URL (OBRIGATÓRIO)**
```bash
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_YjvLSX3d8JNM@ep-silent-mouse-ahjow0rn-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
Environment: All Environments
```

#### **NODE_ENV (OBRIGATÓRIO)**
```bash
Key: NODE_ENV
Value: production
Environment: All Environments
```

#### **PORT (OBRIGATÓRIO)**
```bash
Key: PORT
Value: 3001
Environment: All Environments
```

#### **CORS_ORIGIN (OBRIGATÓRIO)**
```bash
Key: CORS_ORIGIN
Value: http://localhost:3004,https://fenixfrontendatual.vercel.app
Environment: All Environments
```

#### **JWT_SECRET (OBRIGATÓRIO)**
```bash
Key: JWT_SECRET
Value: fenix-jwt-secret-key-2024-super-secure
Environment: All Environments
```

#### **ENCRYPTION_KEY (OBRIGATÓRIO)**
```bash
Key: ENCRYPTION_KEY
Value: chave_de_criptografia_super_segura_123456789
Environment: All Environments
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

# Health Check Completo
curl https://fenix-backend.vercel.app/api/health
```

### **2. Teste Frontend**
```bash
# Health Check Frontend
curl https://fenixfrontendatual.vercel.app/api/health-check
```

### **3. Teste Integração Completa**
```bash
# Teste completo frontend + backend
curl https://fenixfrontendatual.vercel.app/api/health-check
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

## 🎯 **CHECKLIST DE DEPLOY**

### **Frontend (Next.js)**
- [ ] Vercel CLI instalado
- [ ] Login na Vercel realizado
- [ ] Deploy do frontend executado
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio personalizado configurado (se necessário)
- [ ] Teste de funcionamento realizado

### **Backend (NestJS)**
- [ ] Deploy do backend executado
- [ ] DATABASE_URL configurada
- [ ] NODE_ENV=production configurado
- [ ] PORT=3001 configurado
- [ ] CORS_ORIGIN configurado
- [ ] JWT_SECRET configurado
- [ ] ENCRYPTION_KEY configurado
- [ ] Teste de endpoints realizado

### **Banco de Dados (Neon)**
- [ ] Conexão ativa verificada
- [ ] SSL configurado
- [ ] Pooler ativo
- [ ] Performance monitorada

### **Integração**
- [ ] Frontend conectando com backend
- [ ] CORS funcionando
- [ ] Autenticação funcionando
- [ ] Banco de dados acessível
- [ ] Logs sem erros

---

## 🔄 **COMANDOS RÁPIDOS**

### **Deploy Completo**
```bash
# Frontend
cd /home/fabio/projetos/fenix
vercel --prod

# Backend  
cd /home/fabio/projetos/fenix-backend
vercel --prod
```

### **Verificar Status**
```bash
# Verificar deployments
vercel ls

# Ver logs
vercel logs [deployment-url]
```

### **Redeploy**
```bash
# Redeploy específico
vercel --prod --force
```

---

## 📱 **URLs FINAIS**

- **Frontend**: https://fenixfrontendatual.vercel.app
- **Backend**: https://fenix-backend.vercel.app
- **Health Check**: https://fenixfrontendatual.vercel.app/api/health-check

---

## ✅ **PRÓXIMOS PASSOS**

1. **Executar deploy** do frontend e backend
2. **Configurar variáveis** de ambiente
3. **Aguardar redeploy** automático
4. **Testar todos os endpoints**
5. **Verificar logs** para erros
6. **Monitorar performance**
7. **Configurar domínio personalizado** (se necessário)

---

## 🆘 **SUPORTE**

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Next.js Docs**: https://nextjs.org/docs
- **NestJS Docs**: https://docs.nestjs.com

---

**🎉 DEPLOY COMPLETO = FENIX NA NUVEM! 🎉**
