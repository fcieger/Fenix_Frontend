# 🏛️ API de Licitações - FENIX ERP

## 📋 Visão Geral

API completa para integração com sistemas de licitações públicas do Brasil.

---

## 🔌 Endpoints Disponíveis

### Licitações
- `GET /api/licitacoes` - Listar licitações
- `GET /api/licitacoes/:id` - Detalhes de licitação
- `POST /api/licitacoes/buscar` - Busca avançada
- `POST /api/licitacoes/sincronizar` - Sincronizar dados

### Alertas
- `POST /api/licitacoes/alertas` - Criar alerta
- `GET /api/licitacoes/alertas` - Listar alertas
- `PUT /api/licitacoes/alertas/:id` - Atualizar alerta
- `DELETE /api/licitacoes/alertas/:id` - Excluir alerta

### Matches
- `GET /api/licitacoes/matches` - Matches automáticos por IA

---

## 📊 Fontes de Dados

### APIs Governamentais Gratuitas
1. **PNCP** (Portal Nacional de Contratações Públicas) - Principal
2. **Compras.gov.br** - Complementar
3. **Portal da Transparência** - Backup

---

**Última atualização**: 2024-11-11






