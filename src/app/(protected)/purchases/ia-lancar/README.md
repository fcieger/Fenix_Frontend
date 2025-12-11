# 📸 IA: Lançamento Automático de Compras via OCR

Sistema inteligente que processa fotos de notas fiscais e cria pedidos de compra automaticamente.

## 🚀 Como Usar

### 1. Acessar a Página
```
http://localhost:3000/compras/ia-lancar
```

### 2. Fluxo de Uso

#### **Etapa 1: Upload 📸**
- Tire uma foto da nota fiscal com o celular (câmera)
- OU arraste/selecione uma imagem do computador (JPG, PNG)
- OU envie um arquivo PDF da nota fiscal (NF-e)
- O sistema pré-processa automaticamente para melhorar o OCR
- **PDFs são convertidos automaticamente** para imagem (primeira página)

#### **Etapa 2: OCR 🔍**
- Aguarde enquanto o Tesseract.js extrai o texto (10-15 segundos)
- Progresso mostrado em tempo real
- 3 etapas: Extração → Análise → Validação

#### **Etapa 3: Revisão ✏️**
- Revise os dados extraídos:
  - **Fornecedor**: CNPJ, Razão Social
  - **Nota Fiscal**: Número, Série, Data, Valor
  - **Produtos**: Lista completa com quantidades e valores
- **Edite** se necessário (botão "Editar")
- **Adicione** ou **remova** produtos manualmente
- Score de confiança mostrado (70%+ recomendado)

#### **Etapa 4: Processamento ⚙️**
- Sistema valida fornecedor (busca por CNPJ ou nome)
- Valida produtos (busca por código ou nome fuzzy)
- **Auto-cria** fornecedor se não existir
- **Auto-cria** produtos se não existirem
- Gera pedido de compra automaticamente

#### **Etapa 5: Sucesso ✅**
- Pedido de compra criado!
- Resumo mostrando:
  - Fornecedor (badge "NOVO" se criado)
  - Produtos (badge "NOVO" para cada novo)
- Botões:
  - "Lançar Outra Nota" → reinicia fluxo
  - "Ver Pedido de Compra" → abre pedido criado

---

## 🎯 Dicas para Melhores Resultados

### ✅ Faça:
- Tire fotos com **boa iluminação**
- Mantenha a nota **plana** e **sem dobras**
- Foque na **área central** da nota
- Use **câmera traseira** (melhor qualidade)
- Enquadre a nota **inteira** no visor
- **Prefira PDFs** quando disponíveis (maior precisão)

### ❌ Evite:
- Fotos **desfocadas** ou tremidas
- Iluminação muito escura ou com **sombras**
- Notas **amassadas** ou danificadas
- Ângulos muito inclinados
- Reflexos ou **brilho** na foto
- PDFs de múltiplas páginas (apenas a primeira será processada)

---

## 📊 O Que o Sistema Faz Automaticamente

### ✅ Extração de Dados
| Campo | Descrição |
|-------|-----------|
| **CNPJ Fornecedor** | Busca padrão XX.XXX.XXX/XXXX-XX |
| **Razão Social** | Identifica nas linhas acima do CNPJ |
| **Número NF** | Vários padrões (NF, Número, NFe) |
| **Data Emissão** | Formato DD/MM/YYYY |
| **Chave de Acesso** | 44 dígitos (se houver) |
| **Valor Total** | Extrai e converte para número |
| **Produtos** | Tabela com código, descrição, quantidade, valores |

### 🤖 Validação Inteligente
- **Busca Fuzzy**: Encontra cadastros similares (85%+ de similaridade)
- **Auto-Criação**: Cria fornecedores e produtos novos automaticamente
- **Margem Padrão**: Produtos novos recebem 30% de margem sobre custo
- **Observações**: Adiciona confiança do OCR e chave de acesso

---

## ⚡ Tecnologias Utilizadas

- **OCR**: Tesseract.js (gratuito, roda no browser)
- **PDF Processing**: PDF.js (conversão de PDF para imagem)
- **Pré-processamento**: Canvas API (aumenta contraste)
- **Upload**: React Dropzone (drag & drop)
- **Parsing**: Regex patterns inteligentes
- **Busca Fuzzy**: Algoritmo de Levenshtein Distance

---

## 🔧 Precisão Esperada

### Tesseract.js (Gratuito)
- ✅ **CNPJ**: 90%+ de acurácia
- ✅ **Valores**: 95%+ de acurácia
- ⚠️ **Produtos**: 70-85% de acurácia
- ⚠️ **Geral**: 70-85% (depende da qualidade da foto)

### Score de Confiança
- **🟢 80-100%**: Ótimo! Dados muito confiáveis
- **🟡 60-79%**: Bom. Revisar antes de confirmar
- **🔴 < 60%**: Baixo. Revisar cuidadosamente

---

## 🐛 Problemas Comuns

### "Nenhum produto identificado"
- **Causa**: OCR não conseguiu ler a tabela de produtos
- **Solução**: Tire nova foto com melhor qualidade OU adicione produtos manualmente

### "Fornecedor não encontrado"
- **Causa**: CNPJ não foi extraído ou não está cadastrado
- **Solução**: Sistema cria automaticamente se auto-criação estiver ativa

### "Baixa Confiança"
- **Causa**: Foto de baixa qualidade ou nota complexa
- **Solução**: Revise todos os campos antes de confirmar

---

## 🚀 Melhorias Futuras

### Fase 2 (Planejado)
- [x] **Suporte a PDF**: Processar PDFs de NF-e ✅ IMPLEMENTADO
- [ ] **Google Vision API**: OCR mais preciso (95%+)
- [ ] **XML NF-e**: Parser de XML (100% preciso)
- [ ] **Validação SEFAZ**: Consultar chave de acesso
- [ ] **Múltiplas páginas PDF**: Processar todas as páginas

### Fase 3 (Planejado)
- [ ] **GPT-4 Vision**: IA avançada para parsing
- [ ] **Modo Automático**: Sem necessidade de revisão
- [ ] **Histórico**: Ver notas já processadas
- [ ] **Estatísticas**: Taxa de sucesso, tempo médio

---

## 📞 Suporte

Problemas ou dúvidas? 
- 📖 Consulte o `OCRCOMPRA.md` para documentação completa
- 🐛 Reporte bugs no sistema

---

**Criado em:** 11/11/2025  
**Versão:** 1.0.0

