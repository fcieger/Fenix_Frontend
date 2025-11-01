# ⚠️ IMPORTANTE: Configurar DATABASE_URL no Frontend Vercel

## 🔴 Problema Atual

O endpoint `/api/init-db` está tentando conectar ao banco local (`127.0.0.1:5432`) ao invés do Neon.

## ✅ Solução

Você precisa configurar a variável `DATABASE_URL` no painel da Vercel para o projeto **Frontend**.

### Passos:

1. **Acesse o painel da Vercel**: https://vercel.com/dashboard

2. **Selecione o projeto**: `fenixfrontendatual` (ou o nome do seu projeto frontend)

3. **Vá em Settings → Environment Variables**

4. **Adicione a variável**:
   ```
   Key: DATABASE_URL
   Value: postgresql://neondb_owner:npg_YjvLSX3d8JNM@ep-silent-mouse-ahjow0rn-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   Environment: Production, Preview, Development
   ```

5. **Salve** e aguarde o redeploy automático (2-3 minutos)

## ✅ Verificar se está configurado:

Após configurar, teste novamente:

```bash
curl -X POST https://fenixfrontendatual.vercel.app/api/init-db
```

Agora deve conectar ao Neon corretamente!

## 📝 Nota

- O **Backend** já tem a `DATABASE_URL` configurada ✅
- O **Frontend** também precisa ter para o endpoint `/api/init-db` funcionar ✅

Após configurar, ambos os endpoints funcionarão:
- Frontend: `https://fenixfrontendatual.vercel.app/api/init-db`
- Backend: `https://fenix-backend.vercel.app/api/init-db`

