'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import BandeiraEstado from '@/components/BandeiraEstado';
import EstadoImpostoTabs from '@/components/EstadoImpostoTabs';
import PainelAcoesEstados from '@/components/PainelAcoesEstados';
import { apiService } from '@/lib/api';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Save,
  Settings,
  ChevronDown,
  ChevronRight,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface EstadoConfig {
  uf: string;
  nome: string;
  habilitado: boolean;
  cfop?: string;
  naturezaOperacaoDescricao?: string;
  localDestinoOperacao?: 'interna' | 'interestadual' | 'exterior';
  icms: any;
  icmsSt: any;
  icmsConsumidorFinal: any;
  pis: any;
  cofins: any;
  iss: any;
  ipi: any;
  outrosImpostos: Array<{
    nome: string;
    aliquota?: number;
    tipo?: string;
    valor?: number;
    observacao?: string;
  }>;
  informacoesInteresseFisco?: string;
  informacoesInteresseContribuinte?: string;
}

const estadosBrasileiros = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' }
];

export default function ConfiguracaoEstadoPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, token } = useAuth();
  const [naturezaId, setNaturezaId] = useState<string>('');
  const [naturezaNome, setNaturezaNome] = useState<string>('');
  const [estadosConfig, setEstadosConfig] = useState<EstadoConfig[]>([]);
  const [expandedEstados, setExpandedEstados] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (params.id && token) {
      const id = params.id as string;
      setNaturezaId(id);
      loadConfiguracoes(id);
    }
  }, [isAuthenticated, params.id, token, router]);

  const loadConfiguracoes = async (id: string) => {
    if (!id || !token) {
      console.error('ID da natureza ou token não disponível');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Carregar configurações existentes da API
      // console.log('Carregando configurações para ID:', id);
      const configuracoesExistentes = await apiService.getConfiguracaoEstados(id, token);
      // console.log('Configurações recebidas:', configuracoesExistentes);
      
      // Criar mapa das configurações existentes por UF
      const configMap = new Map();
      configuracoesExistentes.forEach(config => {
        configMap.set(config.uf, config);
      });
      // console.log('Mapa de configurações criado:', configMap.size, 'itens');
      
      // Inicializar todos os estados com configurações existentes ou padrão
      const configsIniciais = estadosBrasileiros.map(estado => {
        const configExistente = configMap.get(estado.uf);
        
        if (configExistente) {
          return {
            uf: estado.uf,
            nome: estado.nome,
            habilitado: configExistente.habilitado || false,
            cfop: configExistente.cfop || '',
            naturezaOperacaoDescricao: configExistente.naturezaOperacaoDescricao || '',
            localDestinoOperacao: configExistente.localDestinoOperacao || 'interna',
            icms: {
              cst: configExistente.icmsCST || '',
              origem: configExistente.icmsOrigem || '',
              modalidadeBc: configExistente.icmsModalidade || '',
              aliquota: configExistente.icmsAliquota || 0,
              reducaoBase: configExistente.icmsReducaoBase || 0,
              simples: configExistente.icmsSimples || false,
              reduzirBase: configExistente.icmsReduzirBase || false,
              incluirFrete: configExistente.icmsIncluirFrete || false,
              credita: configExistente.icmsCredita || false,
              incluirDesconto: configExistente.icmsIncluirDesconto || false,
              importacao: configExistente.icmsImportacao || false,
              debita: configExistente.icmsDebita || false,
              incluirIpi: configExistente.icmsIncluirIpi || false,
              reduzirValor: configExistente.icmsReduzirValor || false,
              incluirDespesas: configExistente.icmsIncluirDespesas || false,
              motivoDesoneracao: configExistente.icmsMotivoDesoneracao || '',
              aliquotaDeferimento: configExistente.icmsAliquotaDeferimento || 0,
              fcp: configExistente.icmsFcp || 0
            },
            icmsSt: {
              cst: configExistente.icmsStCST || '',
              origem: configExistente.icmsStOrigem || '',
              modalidade: configExistente.icmsStModalidade || '',
              aliquota: configExistente.icmsStAliquota || 0,
              mva: configExistente.icmsStMva || 0,
              reducaoBase: configExistente.icmsStReducaoBase || 0,
              fecop: configExistente.icmsStFecop || 0,
              pmpf: configExistente.icmsStPmpf || 0,
              fcp: configExistente.icmsStFcp || 0,
              interno: configExistente.icmsStInterno || 0,
              simples: configExistente.icmsStSimples || false,
              reduzirBase: configExistente.icmsStReduzirBase || false,
              incluirFrete: configExistente.icmsStIncluirFrete || false,
              incluirSeguro: configExistente.icmsStIncluirSeguro || false,
              incluirOutrasDespesas: configExistente.icmsStIncluirOutrasDespesas || false,
              reduzirValor: configExistente.icmsStReduzirValor || false,
              incluirDespesas: configExistente.icmsStIncluirDespesas || false,
              credita: configExistente.icmsStCredita || false,
              incluirDesconto: configExistente.icmsStIncluirDesconto || false,
              importacao: configExistente.icmsStImportacao || false,
              debita: configExistente.icmsStDebita || false,
              incluirIpi: configExistente.icmsStIncluirIpi || false,
              destacarProprio: configExistente.icmsStDestacar || false,
              pmpfConsFinal: configExistente.icmsStPmpfConsumidorFinal || false,
              difalSt: configExistente.icmsStDifal || false
            },
            icmsConsumidorFinal: {
              interestadual: configExistente.icmsConsumidorFinalAliquota || 0,
              interno: configExistente.icmsConsumidorFinalInterno || 0,
              operacao: configExistente.icmsConsumidorFinalOperacao || 0,
              provisorioOrigem: configExistente.icmsConsumidorFinalProvisorioOrigem || 0,
              provisorioDestino: configExistente.icmsConsumidorFinalProvisorioDestino || 0,
              fcp: configExistente.icmsConsumidorFinalFcp || 0,
              incluirInterno: configExistente.icmsConsumidorFinalIncluirInterno || false,
              naoDevido: configExistente.icmsConsumidorFinalNaoDevido || false
            },
            pis: {
              cst: configExistente.pisCST || '',
              aliquota: configExistente.pisAliquota || 0,
              reducaoBase: configExistente.pisReducaoBase || 0,
              simples: configExistente.pisSimples || false,
              reduzirBase: configExistente.pisReduzirBase || false,
              credita: configExistente.pisCredita || false,
              debita: configExistente.pisDebita || false,
              incluirDespesas: configExistente.pisIncluirDespesas || false,
              aplicarProduto: configExistente.pisAplicarProduto || false,
              importacao: configExistente.pisImportacao || false,
              incluirFrete: configExistente.pisIncluirFrete || false,
              incluirDesconto: configExistente.pisIncluirDesconto || false
            },
            cofins: {
              cst: configExistente.cofinsCST || '',
              aliquota: configExistente.cofinsAliquota || 0,
              reducaoBase: configExistente.cofinsReducaoBase || 0,
              simples: configExistente.cofinsSimples || false,
              reduzirBase: configExistente.cofinsReduzirBase || false,
              credita: configExistente.cofinsCredita || false,
              debita: configExistente.cofinsDebita || false,
              incluirDespesas: configExistente.cofinsIncluirDespesas || false,
              aplicarProduto: configExistente.cofinsAplicarProduto || false,
              importacao: configExistente.cofinsImportacao || false,
              incluirFrete: configExistente.cofinsIncluirFrete || false,
              incluirDesconto: configExistente.cofinsIncluirDesconto || false
            },
            iss: {
              cst: configExistente.issCST || '',
              situacao: configExistente.issSituacao || '',
              natureza: configExistente.issNaturezaOperacao || '',
              aliquota: configExistente.issAliquota || 0,
              reducaoBase: 0,
              valorMinimo: 0,
              simples: false,
              incluirFrete: false,
              incluirDesconto: false,
              incluirDespesas: false,
              // ISS - Impostos Retidos
              porcentagem: configExistente.issPorcentagem || 0,
              acimaDe: configExistente.issAcimaDe || 0,
              retido: configExistente.issRetido || false,
              incluirIpi: false,
              incluirIcms: false,
              // CSLL - Impostos Retidos
              csllPorcentagem: configExistente.csllPorcentagem || 0,
              csllAcima: configExistente.csllAcimaDe || 0,
              csllRetido: configExistente.csllRetido || false,
              // PIS - Impostos Retidos
              pisPorcentagem: configExistente.pisPorcentagem || 0,
              pisAcima: configExistente.pisAcimaDe || 0,
              pisRetido: configExistente.pisRetido || false,
              // INSS - Impostos Retidos
              inssPorcentagem: configExistente.inssPorcentagem || 0,
              inssAcima: configExistente.inssAcimaDe || 0,
              inssRetido: configExistente.inssRetido || false,
              // IR - Impostos Retidos
              irPorcentagem: configExistente.irPorcentagem || 0,
              irAcima: configExistente.irAcimaDe || 0,
              irRetido: configExistente.irRetido || false,
              // COFINS - Impostos Retidos
              cofinsPorcentagem: configExistente.cofinsPorcentagem || 0,
              cofinsAcima: configExistente.cofinsAcimaDe || 0,
              cofinsRetido: configExistente.cofinsRetido || false
            },
            ipi: {
              cst: configExistente.ipiCST || '',
              aliquota: configExistente.ipiAliquota || 0,
              classe: configExistente.ipiClasse || '',
              codigo: configExistente.ipiCodigo || '',
              simples: configExistente.ipiSimples || false,
              reduzirBase: configExistente.ipiReduzirBase || false,
              incluirFrete: configExistente.ipiIncluirFrete || false,
              incluirDesconto: configExistente.ipiIncluirDesconto || false,
              incluirDespesas: configExistente.ipiIncluirDespesas || false,
              credita: configExistente.ipiCredita || false,
              debita: configExistente.ipiDebita || false,
              // IPI calculado baseado apenas no CST e alíquota
              importacao: configExistente.ipiImportacao || false
            },
            outrosImpostos: configExistente.outrosImpostos && configExistente.outrosImpostos.length > 0 
              ? configExistente.outrosImpostos 
              : [{ nome: '', aliquota: 0 }],
            informacoesInteresseFisco: configExistente.informacoesInteresseFisco || '',
            informacoesInteresseContribuinte: configExistente.informacoesInteresseContribuinte || ''
          };
        } else {
          // Estado sem configuração - usar valores padrão
          return {
            uf: estado.uf,
            nome: estado.nome,
            habilitado: false,
            cfop: '',
            naturezaOperacaoDescricao: '',
            localDestinoOperacao: 'interna',
            icms: {
              cst: '',
              origem: '',
              modalidadeBc: '',
              aliquota: 0,
              reducaoBase: 0,
              simples: false,
              reduzirBase: false,
              incluirFrete: false,
              credita: false,
              incluirDesconto: false,
              importacao: false,
              debita: false,
              incluirIpi: false,
              reduzirValor: false,
              incluirDespesas: false,
              motivoDesoneracao: '',
              aliquotaDeferimento: 0,
              fcp: 0
            },
            icmsSt: {
              cst: '',
              origem: '',
              modalidade: '',
              aliquota: 0,
              mva: 0,
              fecop: 0,
              pmpf: 0,
              simples: false,
              reduzirBase: false,
              incluirFrete: false,
              credita: false,
              incluirDesconto: false,
              importacao: false,
              debita: false,
              incluirIpi: false,
              reduzirValor: false,
              incluirDespesas: false
            },
            icmsConsumidorFinal: {
              interestadual: 0,
              interno: 0,
              operacao: 0,
              provisorioOrigem: 0,
              provisorioDestino: 0,
              fcp: 0,
              incluirInterno: false,
              naoDevido: false
            },
            pis: {
              cst: '',
              aliquota: 0,
              reducaoBase: 0,
              simples: false,
              reduzirBase: false,
              credita: false,
              debita: false,
              incluirDespesas: false,
              aplicarProduto: false,
              importacao: false,
              incluirFrete: false,
              incluirDesconto: false
            },
            cofins: {
              cst: '',
              aliquota: 0,
              reducaoBase: 0,
              simples: false,
              reduzirBase: false,
              credita: false,
              debita: false,
              incluirDespesas: false,
              aplicarProduto: false,
              importacao: false,
              incluirFrete: false,
              incluirDesconto: false
            },
            iss: {
              cst: '',
              situacao: '',
              natureza: '',
              aliquota: 0,
              reducaoBase: 0,
              valorMinimo: 0,
              simples: false,
              incluirFrete: false,
              incluirDesconto: false,
              incluirDespesas: false,
              // ISS - Impostos Retidos
              porcentagem: 0,
              acimaDe: 0,
              retido: false,
              incluirIpi: false,
              incluirIcms: false,
              csllPorcentagem: 0,
              csllAcima: 0,
              csllRetido: false,
              issPorcentagem: 0,
              issAcima: 0,
              issRetido: false,
              pisPorcentagem: 0,
              pisAcima: 0,
              pisRetido: false,
              inssPorcentagem: 0,
              inssAcima: 0,
              inssRetido: false,
              irPorcentagem: 0,
              irAcima: 0,
              irRetido: false,
              cofinsPorcentagem: 0,
              cofinsAcima: 0,
              cofinsRetido: false
            },
            ipi: {
              cst: '',
              aliquota: 0,
              classe: '',
              codigo: '',
              simples: false,
              reduzirBase: false,
              incluirFrete: false,
              incluirDesconto: false,
              incluirDespesas: false,
              credita: false,
              debita: false
            },
            outrosImpostos: [],
            informacoesInteresseFisco: '',
            informacoesInteresseContribuinte: ''
          };
        }
      });
      
      setEstadosConfig(configsIniciais);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Em caso de erro, inicializar com estados padrão
      const configsIniciais = estadosBrasileiros.map(estado => ({
        uf: estado.uf,
        nome: estado.nome,
        habilitado: false,
        cfop: '',
        naturezaOperacaoDescricao: '',
        localDestinoOperacao: 'interna',
        icms: {
          cst: '',
          origem: '',
          modalidadeBc: '',
          aliquota: 0,
          reducaoBase: 0,
          simples: false,
          reduzirBase: false,
          incluirFrete: false,
          credita: false,
          incluirDesconto: false,
          importacao: false,
          debita: false,
          incluirIpi: false,
          reduzirValor: false,
          incluirDespesas: false,
          motivoDesoneracao: '',
          aliquotaDeferimento: 0,
          fcp: 0
        },
        icmsSt: {
          cst: '',
          origem: '',
          modalidade: '',
          aliquota: 0,
          mva: 0,
          fecop: 0,
          pmpf: 0,
          simples: false,
          reduzirBase: false,
          incluirFrete: false,
          credita: false,
          incluirDesconto: false,
          importacao: false,
          debita: false,
          incluirIpi: false,
          reduzirValor: false,
          incluirDespesas: false
        },
        icmsConsumidorFinal: {
          interestadual: 0,
          interno: 0,
          operacao: 0,
          provisorioOrigem: 0,
          provisorioDestino: 0,
          fcp: 0,
          incluirInterno: false,
          naoDevido: false
        },
        pis: {
          cst: '',
          aliquota: 0,
          reducaoBase: 0,
          simples: false,
          reduzirBase: false,
          credita: false,
          debita: false,
          incluirDespesas: false,
          aplicarProduto: false,
          importacao: false,
          incluirFrete: false,
          incluirDesconto: false
        },
        cofins: {
          cst: '',
          aliquota: 0,
          reducaoBase: 0,
          simples: false,
          reduzirBase: false,
          credita: false,
          debita: false,
          incluirDespesas: false,
          aplicarProduto: false,
          importacao: false,
          incluirFrete: false,
          incluirDesconto: false
        },
        iss: {
          cst: '',
          situacao: '',
          natureza: '',
          aliquota: 0,
          reducaoBase: 0,
          valorMinimo: 0,
          simples: false,
          incluirFrete: false,
          incluirDesconto: false,
          incluirDespesas: false,
          // ISS - Impostos Retidos
          porcentagem: 0,
          acimaDe: 0,
          retido: false,
          incluirIpi: false,
          incluirIcms: false,
          csllPorcentagem: 0,
          csllAcima: 0,
          csllRetido: false,
          issPorcentagem: 0,
          issAcima: 0,
          issRetido: false,
          pisPorcentagem: 0,
          pisAcima: 0,
          pisRetido: false,
          inssPorcentagem: 0,
          inssAcima: 0,
          inssRetido: false,
          irPorcentagem: 0,
          irAcima: 0,
          irRetido: false,
          cofinsPorcentagem: 0,
          cofinsAcima: 0,
          cofinsRetido: false
        },
        ipi: {
          cst: '',
          aliquota: 0,
          classe: '',
          codigo: '',
          simples: false,
          reduzirBase: false,
          incluirFrete: false,
          incluirDesconto: false,
          incluirDespesas: false,
          credita: false,
          debita: false
        },
        outrosImpostos: [],
        informacoesInteresseFisco: '',
        informacoesInteresseContribuinte: ''
      }));
      setEstadosConfig(configsIniciais);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEstado = (uf: string) => {
    const newExpanded = new Set(expandedEstados);
    if (newExpanded.has(uf)) {
      newExpanded.delete(uf);
    } else {
      newExpanded.add(uf);
    }
    setExpandedEstados(newExpanded);
  };

  const updateEstadoConfig = useCallback((uf: string, field: string, value: any) => {
    setEstadosConfig(prev => prev.map(estado => {
      if (estado.uf === uf) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          return {
            ...estado,
            [parent]: {
              ...estado[parent as keyof EstadoConfig],
              [child]: value
            }
          };
        }
        return {
          ...estado,
          [field]: value
        };
      }
      return estado;
    }));
  }, []);

  const addOutroImposto = (uf: string) => {
    updateEstadoConfig(uf, 'outrosImpostos', [
      ...(estadosConfig.find(e => e.uf === uf)?.outrosImpostos || []),
      { nome: '', aliquota: 0, tipo: 'PERCENTUAL' }
    ]);
  };

  const removeOutroImposto = (uf: string, index: number) => {
    const estado = estadosConfig.find(e => e.uf === uf);
    if (estado) {
      const novosOutros = estado.outrosImpostos.filter((_, i) => i !== index);
      updateEstadoConfig(uf, 'outrosImpostos', novosOutros);
    }
  };

  const handleSave = async () => {
    if (!naturezaId) {
      alert('ID da natureza não encontrado');
      return;
    }

    try {
      setIsSaving(true);
      
      // console.log('Salvando configurações para natureza:', naturezaId);
      // console.log('Estados config:', estadosConfig);
      
      // Converter dados para o formato da API
      // console.log('🔍 Estados config antes do mapeamento:', estadosConfig.length, 'estados');
      // console.log('🔍 Primeiro estado:', estadosConfig[0]);
      // console.log('🔍 Segundo estado:', estadosConfig[1]);
      
      const configuracoesParaSalvar = estadosConfig.map((estado, index) => {
        // console.log(`🔍 Mapeando estado ${index}:`, estado.uf, 'habilitado:', estado.habilitado);
        return {
          uf: estado.uf,
          habilitado: estado.habilitado,
          cfop: estado.cfop || '',
          naturezaOperacaoDescricao: estado.naturezaOperacaoDescricao || '',
          localDestinoOperacao: estado.localDestinoOperacao || 'interna',
        // ICMS
        icmsAliquota: estado.icms.aliquota || 0,
        icmsCST: estado.icms.cst || '',
        icmsOrigem: estado.icms.origem || '',
        icmsBaseCalculo: 0,
        icmsReducaoBase: estado.icms.reducaoBase || 0,
        icmsModalidade: estado.icms.modalidadeBc || '',
        // ICMS - Campos de configuração (checkboxes)
        icmsSimples: estado.icms.simples || false,
        icmsReduzirBase: estado.icms.reduzirBase || false,
        icmsIncluirFrete: estado.icms.incluirFrete || false,
        icmsCredita: estado.icms.credita || false,
        icmsIncluirDesconto: estado.icms.incluirDesconto || false,
        icmsIncluirSeguro: estado.icms.incluirSeguro || false,
        icmsIncluirOutrasDespesas: estado.icms.incluirOutrasDespesas || false,
        icmsImportacao: estado.icms.importacao || false,
        icmsDebita: estado.icms.debita || false,
        icmsIncluirIpi: estado.icms.incluirIpi || false,
        icmsReduzirValor: estado.icms.reduzirValor || false,
        icmsIncluirDespesas: estado.icms.incluirDespesas || false,
        icmsAliquotaDeferimento: estado.icms.aliquotaDeferimento || 0,
        icmsFcp: estado.icms.fcp || 0,
        icmsMotivoDesoneracao: estado.icms.motivoDesoneracao || '',
        // ICMS ST
        icmsStAliquota: estado.icmsSt.aliquota || 0,
        icmsStCST: estado.icmsSt.cst || '',
        icmsStOrigem: estado.icmsSt.origem || '',
        icmsStModalidade: estado.icmsSt.modalidade || '',
        icmsStMva: estado.icmsSt.mva || 0,
        icmsStReducaoBase: estado.icmsSt.reducaoBase || 0,
        // ICMS ST - Campos de configuração (checkboxes)
        icmsStSimples: estado.icmsSt.simples || false,
        icmsStReduzirBase: estado.icmsSt.reduzirBase || false,
        icmsStIncluirFrete: estado.icmsSt.incluirFrete || false,
        icmsStIncluirSeguro: estado.icmsSt.incluirSeguro || false,
        icmsStIncluirOutrasDespesas: estado.icmsSt.incluirOutrasDespesas || false,
        icmsStReduzirValor: estado.icmsSt.reduzirValor || false,
        icmsStIncluirDespesas: estado.icmsSt.incluirDespesas || false,
        icmsStCredita: estado.icmsSt.credita || false,
        icmsStIncluirDesconto: estado.icmsSt.incluirDesconto || false,
        icmsStImportacao: estado.icmsSt.importacao || false,
        icmsStDebita: estado.icmsSt.debita || false,
        icmsStIncluirIpi: estado.icmsSt.incluirIpi || false,
        icmsStFecop: estado.icmsSt.fecop || 0,
        icmsStPmpf: estado.icmsSt.pmpf || 0,
        icmsStFcp: estado.icmsSt.fcp || 0,
        icmsStInterno: estado.icmsSt.interno || 0,
        icmsStDestacar: estado.icmsSt.destacarProprio || false,
        icmsStPmpfConsumidorFinal: estado.icmsSt.pmpfConsFinal || false,
        icmsStDifal: estado.icmsSt.difalSt || false,
        // ICMS Consumidor Final
        icmsConsumidorFinalAliquota: estado.icmsConsumidorFinal.interestadual || 0,
        icmsConsumidorFinalDifal: 0,
        // ICMS Consumidor Final - Campos de configuração (checkboxes)
        icmsConsumidorFinalIncluirInterno: estado.icmsConsumidorFinal.incluirInterno || false,
        icmsConsumidorFinalNaoDevido: estado.icmsConsumidorFinal.naoDevido || false,
        icmsConsumidorFinalInterno: estado.icmsConsumidorFinal.interno || 0,
        icmsConsumidorFinalOperacao: estado.icmsConsumidorFinal.operacao || 0,
        icmsConsumidorFinalProvisorioOrigem: estado.icmsConsumidorFinal.provisorioOrigem || 0,
        icmsConsumidorFinalProvisorioDestino: estado.icmsConsumidorFinal.provisorioDestino || 0,
        icmsConsumidorFinalFcp: estado.icmsConsumidorFinal.fcp || 0,
        // PIS
        pisAliquota: estado.pis.aliquota || 0,
        pisCST: estado.pis.cst || '',
        // PIS - Campos de configuração (checkboxes)
        pisSimples: estado.pis.simples || false,
        pisReduzirBase: estado.pis.reduzirBase || false,
        pisReducaoBase: estado.pis.reducaoBase || 0,
        pisCredita: estado.pis.credita || false,
        pisDebita: estado.pis.debita || false,
        pisIncluirDespesas: estado.pis.incluirDespesas || false,
        pisAplicarProduto: estado.pis.aplicarProduto || false,
        pisImportacao: estado.pis.importacao || false,
        pisIncluirFrete: estado.pis.incluirFrete || false,
        pisIncluirDesconto: estado.pis.incluirDesconto || false,
        // COFINS
        cofinsAliquota: estado.cofins.aliquota || 0,
        cofinsCST: estado.cofins.cst || '',
        // COFINS - Campos de configuração (checkboxes)
        cofinsSimples: estado.cofins.simples || false,
        cofinsReduzirBase: estado.cofins.reduzirBase || false,
        cofinsReducaoBase: estado.cofins.reducaoBase || 0,
        cofinsCredita: estado.cofins.credita || false,
        cofinsDebita: estado.cofins.debita || false,
        cofinsIncluirDespesas: estado.cofins.incluirDespesas || false,
        cofinsAplicarProduto: estado.cofins.aplicarProduto || false,
        cofinsImportacao: estado.cofins.importacao || false,
        cofinsIncluirFrete: estado.cofins.incluirFrete || false,
        cofinsIncluirDesconto: estado.cofins.incluirDesconto || false,
        // IPI
        ipiAliquota: estado.ipi.aliquota || 0,
        ipiCST: estado.ipi.cst || '',
        ipiClasse: estado.ipi.classe || '',
        ipiCodigo: estado.ipi.codigo || '',
        ipiSimples: estado.ipi.simples || false,
        ipiReduzirBase: estado.ipi.reduzirBase || false,
        ipiIncluirFrete: estado.ipi.incluirFrete || false,
        ipiIncluirDesconto: estado.ipi.incluirDesconto || false,
        ipiIncluirDespesas: estado.ipi.incluirDespesas || false,
        ipiCredita: estado.ipi.credita || false,
        ipiDebita: estado.ipi.debita || false,
        // IPI calculado baseado apenas no CST e alíquota
        ipiImportacao: estado.ipi.importacao || false,
        // ISS
        issAliquota: estado.iss.aliquota || 0,
        issRetencao: false,
        issCST: estado.iss.cst || '',
        issSituacao: estado.iss.situacao || '',
        issNaturezaOperacao: estado.iss.natureza || '',
        // ISS - Impostos Retidos
        issPorcentagem: estado.iss.porcentagem || 0,
        issAcimaDe: estado.iss.acimaDe || 0,
        issRetido: estado.iss.retido || false,
        // CSLL - Impostos Retidos
        csllPorcentagem: estado.iss.csllPorcentagem || 0,
        csllAcimaDe: estado.iss.csllAcima || 0,
        csllRetido: estado.iss.csllRetido || false,
        // PIS - Impostos Retidos
        pisPorcentagem: estado.iss.pisPorcentagem || 0,
        pisAcimaDe: estado.iss.pisAcima || 0,
        pisRetido: estado.iss.pisRetido || false,
        // INSS - Impostos Retidos
        inssPorcentagem: estado.iss.inssPorcentagem || 0,
        inssAcimaDe: estado.iss.inssAcima || 0,
        inssRetido: estado.iss.inssRetido || false,
        // IR - Impostos Retidos
        irPorcentagem: estado.iss.irPorcentagem || 0,
        irAcimaDe: estado.iss.irAcima || 0,
        irRetido: estado.iss.irRetido || false,
        // COFINS - Impostos Retidos
        cofinsPorcentagem: estado.iss.cofinsPorcentagem || 0,
        cofinsAcimaDe: estado.iss.cofinsAcima || 0,
        cofinsRetido: estado.iss.cofinsRetido || false,
        // Outros Impostos
        outrosImpostos: estado.outrosImpostos || [],
        // Informações Adicionais
        informacoesInteresseFisco: estado.informacoesInteresseFisco || '',
        informacoesInteresseContribuinte: estado.informacoesInteresseContribuinte || ''
        };
      });
      
      // console.log('Configurações para salvar:', configuracoesParaSalvar);
      // console.log('Token:', token ? 'Presente' : 'Ausente');
      // console.log('Natureza ID:', naturezaId);
      // console.log('Quantidade de configurações:', configuracoesParaSalvar.length);
      
      // Log detalhado dos campos de ICMS (comentado para performance)

      // Log detalhado das alíquotas (comentado para performance)
      
      // Validar se há pelo menos uma configuração
      if (configuracoesParaSalvar.length === 0) {
        alert('Nenhuma configuração para salvar. Configure pelo menos um estado.');
        return;
      }
      
      // Validar estrutura dos dados
      const configValida = configuracoesParaSalvar.every(config => 
        config.uf && 
        typeof config.habilitado === 'boolean' &&
        config.icmsAliquota !== undefined &&
        config.icmsCST !== undefined
      );
      
      if (!configValida) {
        console.error('❌ Estrutura de dados inválida:', configuracoesParaSalvar);
        alert('Estrutura de dados inválida. Verifique os logs do console.');
        return;
      }
      
      await apiService.saveConfiguracaoEstados(naturezaId, configuracoesParaSalvar, token);
      alert('Configurações salvas com sucesso!');
      
      // Não navegar automaticamente - permanecer na página
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  // Removido - usando componente BandeiraEstado

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Banner Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-extrabold text-white mb-2">Configuração por Estado</h1>
            <p className="text-purple-200 text-lg">Configure impostos para cada estado brasileiro</p>
            {naturezaNome && (
              <p className="text-purple-300 text-sm mt-2">Natureza: {naturezaNome}</p>
            )}
            
          </motion.div>
        </div>

        {/* Painel de Ações */}
        <PainelAcoesEstados
          estadosConfig={estadosConfig}
          setEstadosConfig={setEstadosConfig}
        />

        {/* Lista de Estados */}
        <Card className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Estados Brasileiros</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {estadosConfig.filter(e => e.habilitado).length} de {estadosConfig.length} habilitados
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {estadosConfig.map((estado) => {
                const isExpanded = expandedEstados.has(estado.uf);
                return (
                  <motion.div
                    key={estado.uf}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
                  >
                    {/* Header do Estado */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => toggleEstado(estado.uf)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                          <div className="flex items-center space-x-3">
                            <BandeiraEstado uf={estado.uf} className="text-2xl" />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {estado.nome} ({estado.uf})
                              </h3>
                              <p className="text-sm text-gray-500">
                                {estado.habilitado ? 'Habilitado' : 'Desabilitado'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={estado.habilitado}
                              onChange={(e) => updateEstadoConfig(estado.uf, 'habilitado', e.target.checked)}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Habilitar</span>
                          </label>
                          {estado.habilitado ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Conteúdo Expandido */}
                      {isExpanded && estado.habilitado && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-gray-200"
                        >
                          <EstadoImpostoTabs 
                            estado={estado} 
                            updateEstadoConfig={updateEstadoConfig}
                          />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Botões Flutuantes */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button
              onClick={() => router.push('/impostos/natureza-operacao')}
              variant="outline"
              className="flex items-center bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[140px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 min-w-[140px]"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
