# 🧾 Nota Fiscal Eletrônica (NFe) - FENIX ERP

## 📋 Visão Geral

Sistema completo de emissão, gestão e integração de Notas Fiscais Eletrônicas.

---

## 🎯 Funcionalidades

### Emissão de NFe

- ✅ Emissão automática de NFe
- ✅ Integração com API externa
- ✅ Validação de dados antes do envio
- ✅ Cálculo automático de impostos

### Gestão de NFe

- ✅ Download de XML, PDF, DANFE
- ✅ Cancelamento com justificativa
- ✅ Consulta de status em tempo real
- ✅ Carta de Correção Eletrônica (CCe)

### Integração

- ✅ Integração com SEFAZ
- ✅ Transmissão automática
- ✅ Retry em caso de falha
- ✅ Logs detalhados

---

## 🔧 Configuração

### Variáveis de Ambiente

```bash
NFE_API_BASE_URL=https://api-nfe.exemplo.com
NFE_API_USERNAME=usuario
NFE_API_PASSWORD=senha
NFE_API_TIMEOUT=30000
```

### Certificado Digital

- Configure o certificado digital A1 ou A3
- Certificado deve estar válido
- Configuração no painel de configurações NFe

---

## 📊 Endpoints da API

### Emissão

- POST `/api/nfe-integration/emitir` - Emitir NFe
- POST `/api/nfe-integration/transmitir/:id` - Transmitir NFe para SEFAZ

### Consulta

- GET `/api/nfe-integration/consulta/:chaveAcesso` - Consultar status
- GET `/api/nfe/:id` - Detalhes da NFe

### Cancelamento

- POST `/api/nfe-integration/cancelar/:chaveAcesso` - Cancelar NFe
- Body: `{ justificativa: string }`

### Download

- GET `/api/nfe-integration/xml/:nfeId` - Download XML
- GET `/api/nfe-integration/pdf/:nfeId` - Download PDF
- GET `/api/nfe-integration/danfe/:nfeId` - Download DANFE

### Validação

- POST `/api/nfe-integration/validar-xml/:nfeId` - Validar XML

---

## 🚀 Fluxo de Emissão

1. **Preparação**

   - Selecionar pedido de venda ou criar manualmente
   - Validar dados do cliente
   - Verificar certificado digital

2. **Cálculo de Impostos**

   - Calcular ICMS, IPI, PIS, COFINS
   - Aplicar regras fiscais por estado
   - Validar totais

3. **Geração do XML**

   - Montar XML conforme layout NFe
   - Assinar digitalmente
   - Validar schema

4. **Transmissão**

   - Enviar para SEFAZ
   - Aguardar autorização
   - Processar retorno

5. **Finalização**
   - Salvar XML autorizado
   - Gerar DANFE
   - Notificar cliente (opcional)

---

## 🐛 Troubleshooting

### Erro: "Certificado inválido"

**Solução:**

1. Verifique validade do certificado
2. Confirme instalação correta
3. Teste acesso ao certificado

### Erro: "Dados inválidos"

**Solução:**

1. Verifique todos os campos obrigatórios
2. Confirme CNPJ/CPF válidos
3. Valide valores e quantidades

### Erro: "SEFAZ indisponível"

**Solução:**

1. Aguarde alguns minutos
2. Tente novamente
3. Verifique status da SEFAZ

---

## 📝 Validações Importantes

### Dados do Cliente

- CNPJ/CPF válido e ativo
- Endereço completo
- Inscrição Estadual (se necessário)

### Dados dos Produtos

- Código NCM válido
- Unidade de medida correta
- Valores e quantidades positivos

### Dados Fiscais

- Natureza de operação válida
- CFOP correto
- Impostos calculados corretamente

---

**Última atualização**: 2024-12-24
