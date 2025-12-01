# 🏛️ INTEGRAÇÃO DE LICITAÇÕES - FENIX ERP

## 🎯 **OBJETIVO**
Integrar APIs de licitações públicas (federal, estadual e municipal) ao Fenix ERP para ajudar os clientes a identificarem oportunidades de vendas com o governo, aumentando o faturamento.

---

## 📊 **PANORAMA DAS APIS DISPONÍVEIS**

### ✅ **APIs GOVERNAMENTAIS GRATUITAS** (Recomendadas)

#### **1. Portal Nacional de Contratações Públicas (PNCP)** ⭐ **MAIS COMPLETO**
- **Descrição**: Portal unificado do governo federal que centraliza TODAS as licitações do Brasil
- **Abrangência**: Federal, Estadual e Municipal
- **Custo**: **GRATUITO**
- **Qualidade**: ⭐⭐⭐⭐⭐ (Fonte Oficial)
- **URL Base**: `https://pncp.gov.br/api`
- **Documentação**: https://www.gov.br/pncp/pt-br/acesso-a-informacao/dados-abertos

**Dados Disponíveis:**
- ✅ Editais de licitação
- ✅ Processos licitatórios
- ✅ Contratos públicos
- ✅ Fornecedores vencedores
- ✅ Valores e prazos
- ✅ Status de processos
- ✅ Filtros por: Estado, Município, CNAE, Valor, Modalidade

**Vantagens:**
- ✅ Dados oficiais e atualizados
- ✅ Cobertura nacional completa
- ✅ Gratuito e sem limites
- ✅ Integração direta com fonte oficial

---

#### **2. API Compras.gov.br (Governo Federal)**
- **Descrição**: Sistema oficial de compras do governo federal
- **Abrangência**: Federal (+ Estados/Municípios que usam o sistema)
- **Custo**: **GRATUITO**
- **Qualidade**: ⭐⭐⭐⭐⭐ (Fonte Oficial)
- **URL Base**: `https://compras.dados.gov.br/api`
- **Documentação**: https://www.gov.br/compras/pt-br/acesso-a-informacao/manuais/manual-dados-abertos

**Endpoints Principais:**
```
GET /licitacoes/v1/licitacoes - Listar licitações
GET /licitacoes/v1/licitacao/{id} - Detalhes de licitação
GET /contratos/v1/contratos - Listar contratos
GET /fornecedores/v1/fornecedores - Listar fornecedores
```

**Dados Disponíveis:**
- ✅ Pregões eletrônicos
- ✅ Concorrências
- ✅ Dispensas de licitação
- ✅ Inexigibilidades
- ✅ Contratos firmados
- ✅ Histórico de preços

**Documentação Técnica:**
- 📚 https://compras.dados.gov.br/docs/licitacoes/licitacao.html

---

#### **3. Portal da Transparência (Governo Federal)**
- **Descrição**: API de dados abertos do governo federal
- **Abrangência**: Federal (Poder Executivo)
- **Custo**: **GRATUITO** (requer cadastro para token)
- **Qualidade**: ⭐⭐⭐⭐⭐ (Fonte Oficial)
- **URL Base**: `https://api.portaldatransparencia.gov.br/api-de-dados`
- **Documentação**: https://portaldatransparencia.gov.br/api-de-dados

**Autenticação:**
```bash
# Cadastro para obter token:
# 1. Acessar: https://portaldatransparencia.gov.br/api-de-dados
# 2. Registrar e-mail
# 3. Receber token por e-mail

# Uso do token:
curl -H "chave-api-dados: SEU_TOKEN_AQUI" \
  https://api.portaldatransparencia.gov.br/api-de-dados/licitacoes
```

**Endpoints Principais:**
```
GET /licitacoes - Listar licitações
GET /licitacoes/{id} - Detalhes de licitação
GET /contratos - Listar contratos
GET /contratos/{id} - Detalhes de contrato
```

**Dados Disponíveis:**
- ✅ Licitações do Executivo Federal
- ✅ Contratos públicos
- ✅ Notas fiscais eletrônicas
- ✅ Valores pagos
- ✅ Fornecedores

---

#### **4. API Prefeitura de São Paulo**
- **Descrição**: API municipal de São Paulo
- **Abrangência**: Municipal (São Paulo/SP)
- **Custo**: **GRATUITO**
- **URL Base**: `https://apilib.prefeitura.sp.gov.br/store/apis/info?name=Licitacoes`
- **Documentação**: https://apilib.prefeitura.sp.gov.br

**Uso:**
- ✅ Licitações da cidade de São Paulo
- ✅ Editais municipais
- ✅ Contratos municipais

---

### 💰 **PLATAFORMAS COMERCIAIS** (Agregadores Privados)

Estas plataformas agregam dados de múltiplas fontes e oferecem recursos adicionais:

#### **1. Licita.pub**
- **Descrição**: Plataforma que centraliza licitações de todo Brasil
- **Abrangência**: Federal, Estadual e Municipal
- **Custo**: **Freemium** (gratuito com limitações, pago para recursos avançados)
- **Website**: https://licita.pub
- **API**: Disponível (consultar documentação)

**Recursos:**
- ✅ Integração direta com PNCP
- ✅ Alertas personalizados
- ✅ Filtros avançados
- ✅ Estatísticas e análises
- ✅ Dashboard intuitivo

---

#### **2. Alerta Licitação**
- **Descrição**: Plataforma de monitoramento de licitações
- **Custo**: **Pago** (consultar planos)
- **Website**: https://alertalicitacao.com.br
- **API**: Disponível

**Recursos:**
- ✅ Alertas em tempo real
- ✅ Filtros por CNAE
- ✅ Histórico de preços
- ✅ Monitoramento de concorrentes

---

#### **3. eLicitação**
- **Descrição**: Automação de processos licitatórios
- **Custo**: **Pago**
- **Website**: https://elicitacao.com.br

**Recursos:**
- ✅ Automação de etapas
- ✅ Gestão de licitações
- ✅ Integração com portais oficiais

---

#### **4. Licitagov (com IA)**
- **Descrição**: Plataforma com inteligência artificial
- **Custo**: **Pago**
- **Website**: https://licitagov.org

**Recursos:**
- ✅ IA para análise de licitações
- ✅ Monitor de concorrentes
- ✅ Radar de preços
- ✅ Dossiês para impugnação
- ✅ Correspondência por CNPJ/CNAE

---

## 🎯 **RECOMENDAÇÃO PARA O FENIX ERP**

### **ESTRATÉGIA IDEAL: INTEGRAÇÃO HÍBRIDA**

```
┌─────────────────────────────────────────────────────────┐
│            FENIX ERP - MÓDULO LICITAÇÕES                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 FONTES DE DADOS (Multi-API)                         │
│  ├── 1️⃣ PNCP (Principal) - GRATUITO                     │
│  │   └── Federal + Estadual + Municipal                 │
│  │                                                       │
│  ├── 2️⃣ Compras.gov.br (Complementar) - GRATUITO       │
│  │   └── Dados detalhados federais                      │
│  │                                                       │
│  └── 3️⃣ Portal Transparência (Backup) - GRATUITO       │
│      └── Dados executivo federal                         │
│                                                          │
│  🤖 PROCESSAMENTO                                        │
│  ├── Aggregation Service (consolidar dados)             │
│  ├── Deduplicação (evitar duplicatas)                   │
│  ├── Normalização (formato único)                       │
│  └── Cache (Redis - performance)                        │
│                                                          │
│  🎯 FUNCIONALIDADES                                      │
│  ├── ✅ Busca por CNAE da empresa                       │
│  ├── ✅ Alertas personalizados                          │
│  ├── ✅ Filtros avançados                               │
│  ├── ✅ Dashboard de oportunidades                      │
│  ├── ✅ Histórico de preços                             │
│  ├── ✅ Match automático (produto x licitação)          │
│  └── ✅ Notificações (email/push)                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ **ARQUITETURA PROPOSTA**

### **Backend (NestJS)**

```typescript
// Estrutura de módulos
src/
├── licitacoes/
│   ├── licitacoes.module.ts
│   ├── licitacoes.controller.ts
│   ├── licitacoes.service.ts
│   ├── entities/
│   │   ├── licitacao.entity.ts
│   │   ├── edital.entity.ts
│   │   └── alerta-licitacao.entity.ts
│   ├── integrations/
│   │   ├── pncp.service.ts          # API PNCP
│   │   ├── compras-gov.service.ts   # API Compras.gov
│   │   ├── transparencia.service.ts # API Transparência
│   │   └── aggregator.service.ts    # Agregador
│   ├── dto/
│   │   ├── create-alerta.dto.ts
│   │   ├── search-licitacao.dto.ts
│   │   └── filter-licitacao.dto.ts
│   └── jobs/
│       ├── sync-licitacoes.job.ts   # Cron para sincronizar
│       └── notify-alerts.job.ts     # Cron para alertas
```

### **Entidade Licitacao (Exemplo)**

```typescript
// licitacao.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('licitacoes')
export class Licitacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  numeroProcesso: string;

  @Column()
  titulo: string;

  @Column('text')
  descricao: string;

  @Column()
  orgao: string;

  @Column()
  modalidade: string; // Pregão, Concorrência, etc.

  @Column()
  esfera: string; // Federal, Estadual, Municipal

  @Column()
  estado: string;

  @Column({ nullable: true })
  municipio: string;

  @Column('decimal', { precision: 15, scale: 2 })
  valorEstimado: number;

  @Column({ type: 'date' })
  dataAbertura: Date;

  @Column({ type: 'date', nullable: true })
  dataLimite: Date;

  @Column()
  status: string; // Aberta, Encerrada, Homologada

  @Column({ nullable: true })
  linkEdital: string;

  @Column({ nullable: true })
  cnae: string;

  @Column('simple-array', { nullable: true })
  categorias: string[];

  @Column()
  fonte: string; // PNCP, Compras.gov, etc.

  @Column({ nullable: true })
  idExterno: string; // ID na fonte externa

  @Column({ default: false })
  favorito: boolean;

  @Column({ default: false })
  interesseManifestado: boolean;

  @ManyToOne(() => Company, { nullable: true })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  sincronizadoEm: Date;
}
```

### **Service de Integração PNCP (Exemplo)**

```typescript
// pncp.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PncpService {
  private readonly logger = new Logger(PncpService.name);
  private readonly baseUrl = 'https://pncp.gov.br/api/v1';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Buscar licitações no PNCP
   */
  async buscarLicitacoes(filtros: {
    estado?: string;
    municipio?: string;
    cnae?: string;
    valorMinimo?: number;
    valorMaximo?: number;
    dataInicio?: string;
    dataFim?: string;
    modalidade?: string;
    status?: string;
    pagina?: number;
    limite?: number;
  }): Promise<any> {
    try {
      const params = this.construirParams(filtros);
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/licitacoes`, { params })
      );

      this.logger.log(`Buscadas ${response.data.length} licitações do PNCP`);
      return this.normalizarDados(response.data);
    } catch (error) {
      this.logger.error(`Erro ao buscar licitações do PNCP: ${error.message}`);
      throw error;
    }
  }

  /**
   * Buscar detalhes de uma licitação específica
   */
  async buscarDetalhes(id: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/licitacoes/${id}`)
      );

      return this.normalizarLicitacao(response.data);
    } catch (error) {
      this.logger.error(`Erro ao buscar detalhes da licitação ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Buscar editais
   */
  async buscarEdital(idLicitacao: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/licitacoes/${idLicitacao}/edital`)
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao buscar edital: ${error.message}`);
      throw error;
    }
  }

  /**
   * Construir parâmetros de query
   */
  private construirParams(filtros: any): any {
    const params: any = {};

    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.municipio) params.municipio = filtros.municipio;
    if (filtros.cnae) params.cnae = filtros.cnae;
    if (filtros.valorMinimo) params.valor_minimo = filtros.valorMinimo;
    if (filtros.valorMaximo) params.valor_maximo = filtros.valorMaximo;
    if (filtros.dataInicio) params.data_inicio = filtros.dataInicio;
    if (filtros.dataFim) params.data_fim = filtros.dataFim;
    if (filtros.modalidade) params.modalidade = filtros.modalidade;
    if (filtros.status) params.status = filtros.status;
    if (filtros.pagina) params.pagina = filtros.pagina;
    if (filtros.limite) params.limite = filtros.limite || 50;

    return params;
  }

  /**
   * Normalizar dados para formato padrão do Fenix
   */
  private normalizarDados(dados: any[]): any[] {
    return dados.map(item => this.normalizarLicitacao(item));
  }

  /**
   * Normalizar licitação individual
   */
  private normalizarLicitacao(item: any): any {
    return {
      numeroProcesso: item.numero_processo || item.numeroProcesso,
      titulo: item.titulo || item.objeto,
      descricao: item.descricao || item.objeto_detalhado,
      orgao: item.orgao || item.unidade_compradora,
      modalidade: item.modalidade,
      esfera: 'Federal', // PNCP tem todas as esferas
      estado: item.uf || item.estado,
      municipio: item.municipio,
      valorEstimado: item.valor_estimado || item.valorEstimado,
      dataAbertura: item.data_abertura || item.dataAbertura,
      dataLimite: item.data_limite || item.dataLimite,
      status: item.status || item.situacao,
      linkEdital: item.link_edital || item.urlEdital,
      cnae: item.cnae,
      categorias: item.categorias || [],
      fonte: 'PNCP',
      idExterno: item.id || item.codigo,
    };
  }
}
```

---

## 🎯 **FUNCIONALIDADES DO MÓDULO DE LICITAÇÕES**

### **1. Dashboard de Oportunidades**
```
┌─────────────────────────────────────────────────────────┐
│  📊 DASHBOARD - LICITAÇÕES                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📈 Estatísticas                                         │
│  ├── 🔵 Novas hoje: 12                                  │
│  ├── 🟢 Abertas: 45                                     │
│  ├── 🟡 Encerrando em 7 dias: 8                        │
│  └── ⭐ Favoritas: 5                                    │
│                                                          │
│  🎯 Matches Automáticos (por CNAE)                      │
│  ├── Pregão Eletrônico 123/2024 - R$ 50.000           │
│  │   └── 📍 São Paulo/SP | ⏰ Encerra em 5 dias        │
│  │                                                       │
│  ├── Concorrência 456/2024 - R$ 120.000               │
│  │   └── 📍 Brasília/DF | ⏰ Encerra em 10 dias        │
│  │                                                       │
│  └── [Ver todas as oportunidades]                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### **2. Busca Avançada**
```typescript
interface FiltrosLicitacao {
  // Localização
  estado?: string[];
  municipio?: string[];
  
  // Valor
  valorMinimo?: number;
  valorMaximo?: number;
  
  // Timing
  dataAbertura?: { inicio: Date; fim: Date };
  encerramentoProximo?: number; // dias
  
  // Categoria
  modalidade?: string[]; // Pregão, Concorrência, etc.
  cnae?: string[];
  palavrasChave?: string[];
  
  // Status
  status?: string[]; // Aberta, Homologada, etc.
  
  // Match
  matchProdutos?: boolean; // Match com produtos cadastrados
  matchCNAE?: boolean; // Match com CNAE da empresa
}
```

### **3. Sistema de Alertas**
```typescript
interface AlertaLicitacao {
  id: string;
  companyId: string;
  nome: string;
  ativo: boolean;
  
  // Critérios
  filtros: FiltrosLicitacao;
  
  // Notificações
  notificarEmail: boolean;
  notificarPush: boolean;
  notificarWhatsApp: boolean;
  
  // Frequência
  frequencia: 'tempo_real' | 'diaria' | 'semanal';
  
  // Horário
  horarioNotificacao?: string; // '09:00'
}
```

### **4. Match Inteligente com IA**
```typescript
/**
 * IA que analisa:
 * - Produtos cadastrados no ERP
 * - CNAE da empresa
 * - Histórico de vendas
 * - Descrição da licitação
 * 
 * E calcula score de compatibilidade (0-100%)
 */
interface MatchLicitacao {
  licitacaoId: string;
  companyId: string;
  score: number; // 0-100
  motivos: string[];
  produtosRelacionados: string[];
  recomendacao: 'alta' | 'media' | 'baixa';
}
```

### **5. Gestão de Licitações**
```typescript
interface GestaoLicitacao {
  licitacaoId: string;
  companyId: string;
  
  // Status interno
  statusInterno: 'analisando' | 'preparando_proposta' | 'enviado' | 'descartado';
  
  // Documentos
  documentos: {
    proposta?: string; // URL
    certificados?: string[];
    habilitacao?: string[];
  };
  
  // Anotações
  anotacoes: string;
  
  // Timeline
  timeline: Array<{
    data: Date;
    acao: string;
    usuario: string;
  }>;
  
  // Resultado
  resultado?: 'vencedor' | 'perdedor' | 'deserta';
  valorContratado?: number;
}
```

---

## 📊 **ENDPOINTS DA API**

### **Licitações**
```typescript
// Listar licitações
GET /api/licitacoes
Query params: ?estado=SP&municipio=Sao Paulo&valorMinimo=10000&pagina=1&limite=20

// Detalhes de licitação
GET /api/licitacoes/:id

// Buscar com filtros avançados
POST /api/licitacoes/buscar
Body: { filtros: FiltrosLicitacao }

// Matches automáticos
GET /api/licitacoes/matches
Query params: ?companyId=xxx

// Sincronizar dados
POST /api/licitacoes/sincronizar
Body: { fonte: 'pncp' | 'compras-gov' | 'transparencia' | 'todas' }
```

### **Alertas**
```typescript
// Criar alerta
POST /api/licitacoes/alertas
Body: AlertaLicitacao

// Listar alertas
GET /api/licitacoes/alertas?companyId=xxx

// Atualizar alerta
PUT /api/licitacoes/alertas/:id
Body: Partial<AlertaLicitacao>

// Deletar alerta
DELETE /api/licitacoes/alertas/:id

// Testar alerta
POST /api/licitacoes/alertas/:id/testar
```

### **Gestão**
```typescript
// Marcar como favorita
POST /api/licitacoes/:id/favoritar

// Manifestar interesse
POST /api/licitacoes/:id/interesse
Body: { anotacoes: string }

// Atualizar status interno
PATCH /api/licitacoes/:id/status
Body: { status: string, anotacoes?: string }

// Upload de proposta
POST /api/licitacoes/:id/documentos
Body: FormData (multipart)

// Registrar resultado
POST /api/licitacoes/:id/resultado
Body: { resultado: string, valorContratado?: number }
```

---

## 🎨 **INTERFACE DO USUÁRIO (Frontend)**

### **Página Principal: Licitações**
```
/app/licitacoes/page.tsx
├── Dashboard (resumo)
├── Lista de licitações (tabela/cards)
├── Filtros laterais
├── Busca rápida
└── Botão "Criar Alerta"
```

### **Página de Detalhes**
```
/app/licitacoes/[id]/page.tsx
├── Informações completas
├── Score de match (se aplicável)
├── Produtos relacionados
├── Link para edital
├── Botões de ação:
│   ├── Favoritar
│   ├── Manifestar interesse
│   ├── Upload proposta
│   └── Abrir edital
└── Timeline de atividades
```

### **Página de Alertas**
```
/app/licitacoes/alertas/page.tsx
├── Lista de alertas criados
├── Botão "Novo Alerta"
├── Testar alerta
└── Estatísticas de alertas
```

---

## 🚀 **CRONOGRAMA DE IMPLEMENTAÇÃO**

### **Fase 1: MVP (2-3 semanas)**
- ✅ Integração com API PNCP
- ✅ Busca básica de licitações
- ✅ Listagem e detalhes
- ✅ Filtros simples (estado, município, valor)
- ✅ Interface básica

### **Fase 2: Alertas (1-2 semanas)**
- ✅ Sistema de alertas
- ✅ Notificações por email
- ✅ Cron jobs para sincronização
- ✅ Dashboard de oportunidades

### **Fase 3: Inteligência (2-3 semanas)**
- ✅ Match automático (CNAE + produtos)
- ✅ Score de compatibilidade
- ✅ IA para análise de editais
- ✅ Recomendações personalizadas

### **Fase 4: Gestão (1-2 semanas)**
- ✅ Workflow de gestão interna
- ✅ Upload de propostas
- ✅ Timeline de atividades
- ✅ Relatórios de resultados

### **Fase 5: Integrações Adicionais (1 semana)**
- ✅ API Compras.gov.br
- ✅ API Portal Transparência
- ✅ Agregador multi-fonte
- ✅ Deduplicação

---

## 💰 **ROI PARA O CLIENTE**

### **Benefícios Mensuráveis:**
- 📈 **Aumento de vendas**: 15-30% (estimativa)
- ⏱️ **Economia de tempo**: 80% (vs. busca manual)
- 🎯 **Oportunidades encontradas**: +200% (vs. métodos tradicionais)
- 💼 **Competitividade**: Acesso rápido a editais
- 🤖 **Automação**: Alertas em tempo real

### **Exemplo Prático:**
```
Empresa XYZ (Comércio de materiais de construção)
├── CNAE: 4744-0/99
├── Ticket médio: R$ 15.000
├── Antes do módulo:
│   ├── 2 licitações/mês (busca manual)
│   └── Taxa de sucesso: 20%
│   └── Faturamento: R$ 6.000/mês
├── Depois do módulo:
│   ├── 15 licitações/mês (automático)
│   ├── Taxa de sucesso: 25% (melhor preparação)
│   └── Faturamento: R$ 56.250/mês
└── Ganho: +837% 🚀
```

---

## 🔒 **SEGURANÇA E COMPLIANCE**

### **Dados Sensíveis**
- 🔐 Criptografia de dados em repouso
- 🔐 HTTPS para todas as comunicações
- 🔐 Tokens de API armazenados com segurança
- 🔐 Logs de acesso

### **LGPD**
- ✅ Dados públicos (licitações)
- ✅ Alertas pessoais (consentimento)
- ✅ Direito de exclusão
- ✅ Transparência no processamento

---

## 📚 **PRÓXIMOS PASSOS**

### **1. Validação Técnica**
- [ ] Testar APIs do PNCP (criar conta de teste)
- [ ] Testar API Compras.gov.br
- [ ] Cadastrar no Portal da Transparência
- [ ] Validar limites de requisição

### **2. Prototipação**
- [ ] Criar service de integração PNCP
- [ ] Desenvolver entidades do banco
- [ ] Implementar endpoints básicos
- [ ] Criar interface de listagem

### **3. Testes com Usuários**
- [ ] Selecionar 3-5 clientes beta
- [ ] Coletar feedback
- [ ] Iterar sobre funcionalidades
- [ ] Ajustar match automático

### **4. Launch**
- [ ] Documentação para usuários
- [ ] Treinamento da equipe
- [ ] Marketing do novo módulo
- [ ] Monitoramento de uso

---

## 🎯 **CONCLUSÃO**

A integração de licitações no Fenix ERP é uma **oportunidade de ouro** para:
- ✅ Agregar **valor real** aos clientes
- ✅ Diferenciação no mercado
- ✅ Aumento do **faturamento dos clientes**
- ✅ Fidelização (funcionalidade única)
- ✅ Uso de **APIs governamentais gratuitas**

**Investimento**: Baixo (APIs gratuitas)  
**Retorno**: Alto (aumento de vendas para clientes)  
**Complexidade**: Média  
**Prazo**: 6-8 semanas para MVP completo

---

**Última atualização**: 2024-11-11  
**Autor**: Equipe Fenix ERP  
**Status**: 📋 Planejamento




