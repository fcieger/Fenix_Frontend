# 🚀 MÓDULO DE CRÉDITO - QUICK START GUIDE

## ⚡ Início Rápido (5 minutos)

### 1. Executar Migrations
```bash
cd fenix-backend
npm run migration:run
```

### 2. Iniciar Backend
```bash
npm run start:dev
```
✅ Backend rodando em `http://localhost:3001`

### 3. Iniciar Frontend
```bash
cd ../fenix
npm run dev
```
✅ Frontend rodando em `http://localhost:3000`

### 4. Acessar Módulo
```
http://localhost:3000/credito
```

---

## 🧪 Testar o Sistema

### Como Cliente

1. **Solicitar Crédito**
   - Acesse `/credito`
   - Clique em "Solicitar Crédito"
   - Preencha: valor, finalidade, tipo de garantia
   - Envie

2. **Enviar Documentos**
   - Vá em "Minhas Solicitações"
   - Clique em "Enviar Documentos"
   - Arraste e solte os arquivos
   - Upload automático

3. **Ver Propostas**
   - Aguarde admin criar proposta
   - Acesse "Minhas Propostas"
   - Clique em uma proposta
   - Veja detalhes e simulação
   - Aceite com senha

4. **Usar Capital de Giro**
   - Após aceitar proposta
   - Acesse "Capital de Giro"
   - Clique em "Utilizar Limite"
   - Informe valor e finalidade
   - Confirme

5. **Ver Extrato**
   - Em "Capital de Giro"
   - Clique em "Ver Extrato"
   - Filtre por data
   - Exporte CSV ou Imprima

### Como Admin

1. **Dashboard**
   - Acesse `/credito/admin`
   - Veja métricas em tempo real

2. **Analisar Solicitação**
   - Clique em "Solicitações"
   - Selecione uma solicitação
   - Veja documentos
   - Aprove ou Reprove

3. **Criar Proposta**
   - Após aprovar
   - Clique em "Enviar Proposta"
   - Preencha: valor, instituição, taxa, prazo
   - Cálculos automáticos (CET, IOF)
   - Envie

4. **Ativar Crédito**
   - Quando cliente aceitar
   - Você receberá notificação
   - Sistema ativa automaticamente

5. **Gestão de Clientes**
   - Acesse "Clientes"
   - Veja todos os clientes
   - Clique para ver detalhes
   - Histórico completo

---

## 📋 Checklist de Teste

### ✅ Fluxo Completo
- [ ] Cliente cria solicitação
- [ ] Cliente envia documentos
- [ ] Admin recebe notificação
- [ ] Admin analisa documentos
- [ ] Admin aprova solicitação
- [ ] Admin cria proposta
- [ ] Cliente recebe notificação
- [ ] Cliente visualiza proposta
- [ ] Cliente aceita proposta
- [ ] Sistema ativa crédito
- [ ] Cliente utiliza limite
- [ ] Cliente vê extrato
- [ ] Cliente solicita antecipação

### ✅ Notificações
- [ ] Cliente recebe ao criar solicitação
- [ ] Cliente recebe ao aprovar/reprovar
- [ ] Cliente recebe ao enviar proposta
- [ ] Admin recebe ao aceitar proposta
- [ ] Sino mostra contador
- [ ] Marcar como lida funciona
- [ ] Link direto funciona

### ✅ Upload de Documentos
- [ ] Drag and drop funciona
- [ ] Progress bar aparece
- [ ] Validação de tipo funciona
- [ ] Validação de tamanho funciona
- [ ] Lista atualiza após upload
- [ ] Admin vê documentos
- [ ] Admin pode aprovar/reprovar

### ✅ Propostas
- [ ] Cálculos automáticos corretos
- [ ] CET exibido corretamente
- [ ] IOF incluído
- [ ] Parcelas calculadas
- [ ] Aceite com senha funciona
- [ ] Tracking de visualizações
- [ ] Expiração em 30 dias

### ✅ Capital de Giro
- [ ] Limites exibidos corretamente
- [ ] Utilização atualiza saldo
- [ ] Extrato completo
- [ ] Filtros funcionam
- [ ] Exportar CSV
- [ ] Imprimir

### ✅ Antecipação
- [ ] Lista recebíveis (mockado)
- [ ] Simulação calcula corretamente
- [ ] Wizard 3 passos funciona
- [ ] Confirmação clara
- [ ] Histórico exibido

---

## 🔑 Principais Endpoints da API

### Cliente
```
POST   /api/credito/solicitar
GET    /api/credito/minhas-solicitacoes
POST   /api/credito/documentos/upload
GET    /api/credito/propostas
POST   /api/credito/proposta/:id/aceitar
GET    /api/credito/capital-giro
POST   /api/credito/capital-giro/utilizar
GET    /api/credito/capital-giro/extrato
POST   /api/credito/antecipacao/simular
```

### Admin
```
GET    /api/credito/admin/dashboard
GET    /api/credito/admin/solicitacoes
POST   /api/credito/admin/aprovar
POST   /api/credito/admin/reprovar
POST   /api/credito/admin/proposta/criar
GET    /api/credito/admin/clientes
```

### Notificações
```
GET    /api/notifications
GET    /api/notifications/nao-lidas
PATCH  /api/notifications/:id/read
POST   /api/notifications/read-all
```

---

## 🐛 Troubleshooting

### Migrations não rodam
```bash
# Limpar e recriar
npm run migration:revert
npm run migration:run
```

### Erro de autenticação
- Verifique se o token JWT está sendo enviado
- Verifique guards nos controllers
- Verifique middleware de autenticação

### Upload não funciona
- Verifique pasta `uploads/` existe
- Verifique permissões da pasta
- Verifique Multer configurado corretamente

### Notificações não aparecem
- Verifique NotificationsModule importado
- Verifique service injetado
- Verifique componente NotificationBell renderizado

---

## 📦 Estrutura de Pastas

```
fenix-backend/
└── src/
    ├── credito/          # Módulo principal
    ├── notifications/    # Sistema de notificações
    └── migrations/       # Migrations do banco

fenix/
└── src/
    ├── app/
    │   ├── credito/      # Páginas do módulo
    │   └── notificacoes/ # Página de notificações
    ├── components/
    │   ├── credito/      # Componentes
    │   └── notifications/
    ├── types/            # Interfaces TypeScript
    └── services/         # API clients
```

---

## 🎯 Próximos Passos

1. **Testar Localmente** ✅
   - Executar todos os fluxos
   - Validar cálculos
   - Testar edge cases

2. **Deploy Homologação** 🚧
   - Configurar variáveis de ambiente
   - Executar migrations
   - Testes com usuários reais

3. **Ajustes Finais** 🔧
   - Corrigir bugs encontrados
   - Melhorias de UX
   - Performance

4. **Produção** 🚀
   - Backup completo
   - Deploy gradual
   - Monitoramento

---

## 📞 Suporte

- **Documentação Completa:** `CREDITOIMPLEMENTAR.md`
- **Resumo Executivo:** `CREDITO_IMPLEMENTACAO_FINAL.md`
- **Resumo Visual:** `CREDITO_RESUMO_VISUAL.md`
- **Quick Start:** `CREDITO_QUICK_START.md` (este arquivo)

---

**Última atualização:** 11/11/2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para uso!




