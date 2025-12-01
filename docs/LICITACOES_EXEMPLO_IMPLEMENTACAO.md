# 🔧 EXEMPLO DE IMPLEMENTAÇÃO - MÓDULO LICITAÇÕES

## 📝 **GUIA PRÁTICO DE IMPLEMENTAÇÃO**

Este documento contém exemplos práticos de código para implementar o módulo de licitações no Fenix ERP.

---

## 1️⃣ **BACKEND - NESTJS**

### **Estrutura de Arquivos**

```
fenix-backend/src/
└── licitacoes/
    ├── licitacoes.module.ts
    ├── licitacoes.controller.ts
    ├── licitacoes.service.ts
    ├── entities/
    │   ├── licitacao.entity.ts
    │   └── alerta-licitacao.entity.ts
    ├── dto/
    │   ├── search-licitacao.dto.ts
    │   ├── create-alerta.dto.ts
    │   └── update-alerta.dto.ts
    ├── integrations/
    │   ├── pncp.service.ts
    │   ├── compras-gov.service.ts
    │   └── aggregator.service.ts
    └── jobs/
        └── sync-licitacoes.job.ts
```

---

### **1.1 Entity: Licitacao**

```typescript
// src/licitacoes/entities/licitacao.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export enum ModalidadeLicitacao {
  PREGAO_ELETRONICO = 'Pregão Eletrônico',
  PREGAO_PRESENCIAL = 'Pregão Presencial',
  CONCORRENCIA = 'Concorrência',
  TOMADA_PRECOS = 'Tomada de Preços',
  CONVITE = 'Convite',
  DISPENSA = 'Dispensa de Licitação',
  INEXIGIBILIDADE = 'Inexigibilidade',
}

export enum EsferaLicitacao {
  FEDERAL = 'Federal',
  ESTADUAL = 'Estadual',
  MUNICIPAL = 'Municipal',
}

export enum StatusLicitacao {
  ABERTA = 'Aberta',
  ENCERRADA = 'Encerrada',
  HOMOLOGADA = 'Homologada',
  CANCELADA = 'Cancelada',
  DESERTA = 'Deserta',
  FRACASSADA = 'Fracassada',
}

@Entity('licitacoes')
@Index(['numeroProcesso', 'fonte'])
@Index(['status', 'dataAbertura'])
@Index(['estado', 'municipio'])
@Index(['cnae'])
export class Licitacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: false })
  @Index()
  numeroProcesso: string;

  @Column()
  titulo: string;

  @Column('text')
  descricao: string;

  @Column()
  orgao: string;

  @Column({ nullable: true })
  orgaoSigla: string;

  @Column({
    type: 'enum',
    enum: ModalidadeLicitacao,
  })
  modalidade: ModalidadeLicitacao;

  @Column({
    type: 'enum',
    enum: EsferaLicitacao,
  })
  esfera: EsferaLicitacao;

  @Column({ length: 2 })
  @Index()
  estado: string; // UF: SP, RJ, etc.

  @Column({ nullable: true })
  municipio: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorEstimado: number;

  @Column({ type: 'date' })
  dataAbertura: Date;

  @Column({ type: 'date', nullable: true })
  dataLimite: Date;

  @Column({
    type: 'enum',
    enum: StatusLicitacao,
    default: StatusLicitacao.ABERTA,
  })
  @Index()
  status: StatusLicitacao;

  @Column({ nullable: true, type: 'text' })
  linkEdital: string;

  @Column({ nullable: true, type: 'text' })
  linkSistema: string;

  @Column({ nullable: true })
  cnae: string;

  @Column('simple-array', { nullable: true })
  categorias: string[];

  @Column('simple-array', { nullable: true })
  palavrasChave: string[];

  @Column()
  @Index()
  fonte: string; // PNCP, Compras.gov, Transparencia

  @Column({ nullable: true })
  @Index()
  idExterno: string; // ID na fonte externa

  @Column({ type: 'jsonb', nullable: true })
  dadosOriginais: any; // JSON completo da API

  @Column({ default: 0 })
  visualizacoes: number;

  @Column({ nullable: true })
  contato: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  telefone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  sincronizadoEm: Date;
}
```

---

### **1.2 Entity: Alerta Licitacao**

```typescript
// src/licitacoes/entities/alerta-licitacao.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';

@Entity('alertas_licitacao')
export class AlertaLicitacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ default: true })
  ativo: boolean;

  // Critérios de busca
  @Column('simple-array', { nullable: true })
  estados: string[];

  @Column('simple-array', { nullable: true })
  municipios: string[];

  @Column('simple-array', { nullable: true })
  modalidades: string[];

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  valorMinimo: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  valorMaximo: number;

  @Column('simple-array', { nullable: true })
  cnae: string[];

  @Column('simple-array', { nullable: true })
  palavrasChave: string[];

  @Column({ default: false })
  apenasAbertas: boolean;

  @Column({ nullable: true })
  diasAntesEncerramento: number;

  // Notificações
  @Column({ default: true })
  notificarEmail: boolean;

  @Column({ default: false })
  notificarPush: boolean;

  @Column({ default: false })
  notificarWhatsApp: boolean;

  // Frequência
  @Column({
    type: 'enum',
    enum: ['tempo_real', 'diaria', 'semanal'],
    default: 'diaria',
  })
  frequencia: string;

  @Column({ nullable: true })
  horarioNotificacao: string; // '09:00'

  @Column({ type: 'timestamp', nullable: true })
  ultimaNotificacao: Date;

  @Column({ default: 0 })
  totalNotificacoes: number;

  @ManyToOne(() => Company)
  company: Company;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

### **1.3 Service: PNCP Integration**

```typescript
// src/licitacoes/integrations/pncp.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface FiltrosPNCP {
  estado?: string;
  municipio?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  dataInicio?: string;
  dataFim?: string;
  modalidade?: string;
  status?: string;
  pagina?: number;
  limite?: number;
}

@Injectable()
export class PncpService {
  private readonly logger = new Logger(PncpService.name);
  private readonly baseUrl = 'https://pncp.gov.br/api/v1';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Buscar licitações no PNCP
   */
  async buscarLicitacoes(filtros: FiltrosPNCP): Promise<any[]> {
    try {
      const params = this.construirParams(filtros);
      
      this.logger.log(`Buscando licitações no PNCP com filtros: ${JSON.stringify(filtros)}`);

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/licitacoes`, {
          params,
          timeout: 30000, // 30 segundos
        })
      );

      const licitacoes = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];

      this.logger.log(`✅ Encontradas ${licitacoes.length} licitações no PNCP`);
      
      return this.normalizarDados(licitacoes);
    } catch (error) {
      this.logger.error(`❌ Erro ao buscar licitações do PNCP: ${error.message}`);
      
      // Retornar array vazio em caso de erro (graceful degradation)
      if (error.response?.status === 404) {
        this.logger.warn('Nenhuma licitação encontrada com os filtros fornecidos');
        return [];
      }
      
      throw error;
    }
  }

  /**
   * Buscar detalhes de uma licitação específica
   */
  async buscarDetalhes(id: string): Promise<any> {
    try {
      this.logger.log(`Buscando detalhes da licitação ${id} no PNCP`);

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/licitacoes/${id}`, {
          timeout: 30000,
        })
      );

      return this.normalizarLicitacao(response.data);
    } catch (error) {
      this.logger.error(`❌ Erro ao buscar detalhes da licitação ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Buscar edital de licitação
   */
  async buscarEdital(idLicitacao: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/licitacoes/${idLicitacao}/edital`, {
          timeout: 30000,
          responseType: 'arraybuffer', // Para PDFs
        })
      );

      return {
        conteudo: response.data,
        contentType: response.headers['content-type'],
      };
    } catch (error) {
      this.logger.error(`❌ Erro ao buscar edital: ${error.message}`);
      throw error;
    }
  }

  /**
   * Buscar órgãos disponíveis
   */
  async buscarOrgaos(uf?: string): Promise<any[]> {
    try {
      const params: any = {};
      if (uf) params.uf = uf;

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/orgaos`, { params })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`❌ Erro ao buscar órgãos: ${error.message}`);
      return [];
    }
  }

  /**
   * Construir parâmetros de query
   */
  private construirParams(filtros: FiltrosPNCP): any {
    const params: any = {
      pagina: filtros.pagina || 1,
      limite: filtros.limite || 50,
    };

    if (filtros.estado) params.uf = filtros.estado;
    if (filtros.municipio) params.municipio = filtros.municipio;
    if (filtros.valorMinimo) params.valor_minimo = filtros.valorMinimo;
    if (filtros.valorMaximo) params.valor_maximo = filtros.valorMaximo;
    if (filtros.dataInicio) params.data_publicacao_inicio = filtros.dataInicio;
    if (filtros.dataFim) params.data_publicacao_fim = filtros.dataFim;
    if (filtros.modalidade) params.modalidade_licitacao = filtros.modalidade;
    if (filtros.status) params.situacao = filtros.status;

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
    // Extrair palavras-chave do título e descrição
    const palavrasChave = this.extrairPalavrasChave(
      `${item.objetoCompra || ''} ${item.informacaoComplementar || ''}`
    );

    return {
      numeroProcesso: item.numeroControlePNCP || item.numero,
      titulo: item.objetoCompra || item.titulo,
      descricao: item.informacaoComplementar || item.objetoCompra || '',
      orgao: item.orgaoEntidade?.razaoSocial || item.orgao,
      orgaoSigla: item.orgaoEntidade?.sigla,
      modalidade: this.mapearModalidade(item.modalidadeNome || item.modalidade),
      esfera: this.identificarEsfera(item),
      estado: item.ufSigla || item.uf,
      municipio: item.municipio?.nome || item.municipio,
      valorEstimado: parseFloat(item.valorTotalEstimado || item.valor || 0),
      dataAbertura: this.parseData(item.dataPublicacaoPncp || item.dataPublicacao),
      dataLimite: this.parseData(item.dataAberturaPropostaNova || item.dataEncerramento),
      status: this.mapearStatus(item.situacaoCompra || item.situacao),
      linkEdital: item.linkSistemaOrigem || item.urlEdital,
      linkSistema: item.linkSistemaOrigem,
      cnae: item.cnae,
      categorias: item.itensCompra?.map((i: any) => i.itemCategoria) || [],
      palavrasChave,
      fonte: 'PNCP',
      idExterno: item.numeroControlePNCP || item.sequencialCompra,
      dadosOriginais: item,
      contato: item.contato?.nome,
      email: item.contato?.email,
      telefone: item.contato?.telefone,
    };
  }

  /**
   * Mapear modalidade para enum do sistema
   */
  private mapearModalidade(modalidade: string): string {
    const mapa: Record<string, string> = {
      'Pregão Eletrônico': 'Pregão Eletrônico',
      'Pregão Presencial': 'Pregão Presencial',
      'Concorrência': 'Concorrência',
      'Tomada de Preços': 'Tomada de Preços',
      'Convite': 'Convite',
      'Dispensa de Licitação': 'Dispensa de Licitação',
      'Inexigibilidade': 'Inexigibilidade',
    };

    return mapa[modalidade] || modalidade;
  }

  /**
   * Mapear status para enum do sistema
   */
  private mapearStatus(status: string): string {
    const mapa: Record<string, string> = {
      'Em andamento': 'Aberta',
      'Aberta': 'Aberta',
      'Encerrada': 'Encerrada',
      'Homologada': 'Homologada',
      'Cancelada': 'Cancelada',
      'Deserta': 'Deserta',
      'Fracassada': 'Fracassada',
    };

    return mapa[status] || 'Aberta';
  }

  /**
   * Identificar esfera do governo
   */
  private identificarEsfera(item: any): string {
    const orgao = item.orgaoEntidade?.razaoSocial?.toLowerCase() || '';
    
    if (orgao.includes('federal') || orgao.includes('união') || orgao.includes('ministério')) {
      return 'Federal';
    }
    
    if (orgao.includes('estado') || orgao.includes('estadual') || orgao.includes('governo do')) {
      return 'Estadual';
    }
    
    return 'Municipal';
  }

  /**
   * Parse de data
   */
  private parseData(data: string): Date | null {
    if (!data) return null;
    
    try {
      return new Date(data);
    } catch {
      return null;
    }
  }

  /**
   * Extrair palavras-chave do texto
   */
  private extrairPalavrasChave(texto: string): string[] {
    if (!texto) return [];

    // Remover pontuação e converter para minúsculas
    const limpo = texto
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ');

    // Lista de stop words em português
    const stopWords = new Set([
      'o', 'a', 'de', 'da', 'do', 'para', 'com', 'em', 'e', 'os', 'as',
      'dos', 'das', 'um', 'uma', 'por', 'na', 'no', 'ao', 'à', 'que',
    ]);

    // Extrair palavras únicas e relevantes
    const palavras = limpo
      .split(' ')
      .filter(p => p.length > 3 && !stopWords.has(p));

    // Retornar top 10 mais frequentes
    const frequencia = new Map<string, number>();
    palavras.forEach(p => {
      frequencia.set(p, (frequencia.get(p) || 0) + 1);
    });

    return Array.from(frequencia.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([palavra]) => palavra);
  }
}
```

---

### **1.4 Controller: Licitacoes**

```typescript
// src/licitacoes/licitacoes.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LicitacoesService } from './licitacoes.service';
import { SearchLicitacaoDto } from './dto/search-licitacao.dto';
import { CreateAlertaDto } from './dto/create-alerta.dto';

@Controller('api/licitacoes')
@UseGuards(JwtAuthGuard)
export class LicitacoesController {
  constructor(private readonly licitacoesService: LicitacoesService) {}

  /**
   * Listar licitações com filtros
   */
  @Get()
  async listar(
    @Query('estado') estado?: string,
    @Query('municipio') municipio?: string,
    @Query('valorMinimo') valorMinimo?: number,
    @Query('valorMaximo') valorMaximo?: number,
    @Query('status') status?: string,
    @Query('pagina') pagina?: number,
    @Query('limite') limite?: number,
  ) {
    return this.licitacoesService.listar({
      estado,
      municipio,
      valorMinimo,
      valorMaximo,
      status,
      pagina: pagina || 1,
      limite: limite || 20,
    });
  }

  /**
   * Buscar com filtros avançados
   */
  @Post('buscar')
  async buscar(@Body() dto: SearchLicitacaoDto) {
    return this.licitacoesService.buscar(dto);
  }

  /**
   * Detalhes de uma licitação
   */
  @Get(':id')
  async detalhes(@Param('id') id: string) {
    return this.licitacoesService.buscarPorId(id);
  }

  /**
   * Matches automáticos para empresa
   */
  @Get('matches')
  async matches(
    @Request() req,
    @Query('companyId') companyId: string,
  ) {
    return this.licitacoesService.buscarMatches(companyId);
  }

  /**
   * Sincronizar dados das APIs
   */
  @Post('sincronizar')
  async sincronizar(
    @Body('fonte') fonte: 'pncp' | 'compras-gov' | 'todas' = 'todas',
  ) {
    return this.licitacoesService.sincronizar(fonte);
  }

  /**
   * Criar alerta
   */
  @Post('alertas')
  async criarAlerta(@Request() req, @Body() dto: CreateAlertaDto) {
    return this.licitacoesService.criarAlerta(req.user.id, dto);
  }

  /**
   * Listar alertas do usuário
   */
  @Get('alertas')
  async listarAlertas(@Request() req) {
    return this.licitacoesService.listarAlertas(req.user.id);
  }
}
```

---

## 2️⃣ **FRONTEND - NEXT.JS**

### **Estrutura de Arquivos**

```
fenix/src/
└── app/
    └── licitacoes/
        ├── page.tsx                    # Lista de licitações
        ├── [id]/
        │   └── page.tsx                # Detalhes
        ├── alertas/
        │   └── page.tsx                # Gestão de alertas
        └── components/
            ├── LicitacaoCard.tsx
            ├── FiltrosLicitacao.tsx
            ├── AlertaForm.tsx
            └── MatchScore.tsx
```

---

### **2.1 Página: Lista de Licitações**

```typescript
// src/app/licitacoes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Bell, TrendingUp } from 'lucide-react';
import { licitacoesService } from '@/services/licitacoes-service';
import { LicitacaoCard } from './components/LicitacaoCard';
import { FiltrosLicitacao } from './components/FiltrosLicitacao';

interface Licitacao {
  id: string;
  numeroProcesso: string;
  titulo: string;
  orgao: string;
  modalidade: string;
  estado: string;
  municipio: string;
  valorEstimado: number;
  dataAbertura: string;
  dataLimite: string;
  status: string;
}

export default function LicitacoesPage() {
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<any>({});
  const [stats, setStats] = useState({
    total: 0,
    abertas: 0,
    encerrandoEmBreve: 0,
    matches: 0,
  });

  useEffect(() => {
    carregarLicitacoes();
    carregarEstatisticas();
  }, [filtros]);

  const carregarLicitacoes = async () => {
    try {
      setLoading(true);
      const response = await licitacoesService.listar(filtros);
      setLicitacoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar licitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const response = await licitacoesService.estatisticas();
      setStats(response);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Licitações Públicas
        </h1>
        <p className="text-gray-600 mt-2">
          Encontre oportunidades de vendas com o governo
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Licitações</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Abertas</p>
              <p className="text-2xl font-bold text-green-600">{stats.abertas}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Encerrando em 7 dias</p>
              <p className="text-2xl font-bold text-orange-600">{stats.encerrandoEmBreve}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold">⏰</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Matches Automáticos</p>
              <p className="text-2xl font-bold text-purple-600">{stats.matches}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">🎯</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filtros Laterais */}
        <div className="w-64 flex-shrink-0">
          <FiltrosLicitacao
            filtros={filtros}
            onChange={setFiltros}
          />
        </div>

        {/* Lista de Licitações */}
        <div className="flex-1">
          {/* Barra de Busca */}
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar licitações..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              />
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Buscar
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Criar Alerta
              </button>
            </div>
          </div>

          {/* Resultados */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando licitações...</p>
            </div>
          ) : licitacoes.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow text-center">
              <p className="text-gray-600">Nenhuma licitação encontrada com os filtros selecionados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {licitacoes.map(licitacao => (
                <LicitacaoCard
                  key={licitacao.id}
                  licitacao={licitacao}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### **2.2 Componente: Licitacao Card**

```typescript
// src/app/licitacoes/components/LicitacaoCard.tsx
import { Calendar, MapPin, DollarSign, Building, ExternalLink } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface LicitacaoCardProps {
  licitacao: any;
}

export function LicitacaoCard({ licitacao }: LicitacaoCardProps) {
  const diasRestantes = Math.ceil(
    (new Date(licitacao.dataLimite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const statusColor = {
    'Aberta': 'bg-green-100 text-green-800',
    'Encerrada': 'bg-gray-100 text-gray-800',
    'Homologada': 'bg-blue-100 text-blue-800',
    'Cancelada': 'bg-red-100 text-red-800',
  }[licitacao.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
              {licitacao.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {licitacao.modalidade}
            </span>
            {diasRestantes > 0 && diasRestantes <= 7 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                ⏰ Encerra em {diasRestantes} dias
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {licitacao.titulo}
          </h3>
          <p className="text-sm text-gray-600">
            Processo: {licitacao.numeroProcesso}
          </p>
        </div>
      </div>

      {/* Informações */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-start gap-2">
          <Building className="w-4 h-4 text-gray-400 mt-1" />
          <div>
            <p className="text-xs text-gray-500">Órgão</p>
            <p className="text-sm font-medium text-gray-900">{licitacao.orgao}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-1" />
          <div>
            <p className="text-xs text-gray-500">Localização</p>
            <p className="text-sm font-medium text-gray-900">
              {licitacao.municipio}, {licitacao.estado}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <DollarSign className="w-4 h-4 text-gray-400 mt-1" />
          <div>
            <p className="text-xs text-gray-500">Valor Estimado</p>
            <p className="text-sm font-medium text-gray-900">
              {formatCurrency(licitacao.valorEstimado)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-gray-400 mt-1" />
          <div>
            <p className="text-xs text-gray-500">Data Limite</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(licitacao.dataLimite)}
            </p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-2 pt-4 border-t">
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
          Ver Detalhes
        </button>
        {licitacao.linkEdital && (
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Edital
          </button>
        )}
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          ⭐
        </button>
      </div>
    </div>
  );
}
```

---

## 3️⃣ **SERVIÇO DE API (Frontend)**

```typescript
// src/services/licitacoes-service.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const licitacoesService = {
  /**
   * Listar licitações
   */
  async listar(filtros: any) {
    const response = await axios.get(`${API_URL}/api/licitacoes`, {
      params: filtros,
    });
    return response.data;
  },

  /**
   * Buscar por ID
   */
  async buscarPorId(id: string) {
    const response = await axios.get(`${API_URL}/api/licitacoes/${id}`);
    return response.data;
  },

  /**
   * Buscar matches
   */
  async buscarMatches(companyId: string) {
    const response = await axios.get(`${API_URL}/api/licitacoes/matches`, {
      params: { companyId },
    });
    return response.data;
  },

  /**
   * Estatísticas
   */
  async estatisticas() {
    const response = await axios.get(`${API_URL}/api/licitacoes/estatisticas`);
    return response.data;
  },

  /**
   * Sincronizar
   */
  async sincronizar(fonte: string = 'todas') {
    const response = await axios.post(`${API_URL}/api/licitacoes/sincronizar`, {
      fonte,
    });
    return response.data;
  },

  /**
   * Criar alerta
   */
  async criarAlerta(alerta: any) {
    const response = await axios.post(`${API_URL}/api/licitacoes/alertas`, alerta);
    return response.data;
  },

  /**
   * Listar alertas
   */
  async listarAlertas() {
    const response = await axios.get(`${API_URL}/api/licitacoes/alertas`);
    return response.data;
  },
};
```

---

## 🚀 **PRÓXIMOS PASSOS**

1. ✅ Criar módulo no backend (NestJS)
2. ✅ Implementar integração com PNCP
3. ✅ Criar entidades e migrações
4. ✅ Desenvolver endpoints da API
5. ✅ Criar interface no frontend
6. ✅ Implementar sistema de alertas
7. ✅ Adicionar match automático com IA
8. ✅ Testar com dados reais

---

**Documentação Completa**: `LICITACOES_API.md`  
**Status**: 📋 Exemplo de Implementação  
**Última atualização**: 2024-11-11




