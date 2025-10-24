'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings,
  Calculator,
  FileText,
  FolderPlus,
  Plus,
  Trash2
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

interface EstadoImpostoTabsProps {
  estado: EstadoConfig;
  updateEstadoConfig: (uf: string, field: string, value: any) => void;
}

const EstadoImpostoTabs: React.FC<EstadoImpostoTabsProps> = ({ estado, updateEstadoConfig }) => {
  const [activeTab, setActiveTab] = useState('ICMS');

  // Estilos modernos para inputs e selects
  const inputStyles = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md";
  const selectStyles = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md";

  // Opções combinadas de CST e CSOSN
  const icmsOptions = [
    // CST - Regime Normal
    { value: "00", label: "00 - Tributada integralmente (CST)", group: "Regime Normal" },
    { value: "10", label: "10 - Tributada e com cobrança do ICMS por substituição tributária (CST)", group: "Regime Normal" },
    { value: "20", label: "20 - Com redução de base de cálculo (CST)", group: "Regime Normal" },
    { value: "30", label: "30 - Isenta ou não tributada e com cobrança do ICMS por substituição tributária (CST)", group: "Regime Normal" },
    { value: "40", label: "40 - Isenta (CST)", group: "Regime Normal" },
    { value: "41", label: "41 - Não tributada (CST)", group: "Regime Normal" },
    { value: "50", label: "50 - Suspensão (CST)", group: "Regime Normal" },
    { value: "51", label: "51 - Diferimento (CST)", group: "Regime Normal" },
    { value: "60", label: "60 - ICMS cobrado anteriormente por substituição tributária (CST)", group: "Regime Normal" },
    { value: "70", label: "70 - Com redução de base de cálculo e cobrança do ICMS por substituição tributária (CST)", group: "Regime Normal" },
    { value: "90", label: "90 - Outras (CST)", group: "Regime Normal" },
    
    // CSOSN - Simples Nacional
    { value: "101", label: "101 - Tributada com permissão de crédito (CSOSN)", group: "Simples Nacional" },
    { value: "102", label: "102 - Tributada sem permissão de crédito (CSOSN)", group: "Simples Nacional" },
    { value: "103", label: "103 - Isenção (CSOSN)", group: "Simples Nacional" },
    { value: "201", label: "201 - Tributada com permissão de crédito e com cobrança do ICMS por substituição tributária (CSOSN)", group: "Simples Nacional" },
    { value: "202", label: "202 - Tributada sem permissão de crédito e com cobrança do ICMS por substituição tributária (CSOSN)", group: "Simples Nacional" },
    { value: "203", label: "203 - Isenção e com cobrança do ICMS por substituição tributária (CSOSN)", group: "Simples Nacional" },
    { value: "300", label: "300 - Imune (CSOSN)", group: "Simples Nacional" },
    { value: "400", label: "400 - Não tributada (CSOSN)", group: "Simples Nacional" },
    { value: "500", label: "500 - ICMS cobrado anteriormente por substituição tributária (substituído) ou por antecipação (CSOSN)", group: "Simples Nacional" },
    { value: "900", label: "900 - Outras (CSOSN)", group: "Simples Nacional" }
  ];
  const checkboxStyles = "w-5 h-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2 transition-all duration-200";
  const labelStyles = "flex items-center mb-3 text-sm font-semibold text-gray-700";
  
  // Função para renderizar checkbox moderno
  const renderCheckbox = (id: string, label: string, checked: boolean, onChange: (checked: boolean) => void, description?: string) => (
    <div className="flex items-start p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="flex items-center h-5">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2 transition-all duration-200"
        />
      </div>
      <div className="ml-3 flex-1">
        <Label htmlFor={id} className="text-sm font-medium text-gray-700 cursor-pointer block">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );

  // Função para validar campos obrigatórios do ICMS
  const validateICMSFields = () => {
    const errors: string[] = [];
    
    if (!estado.icms.cst) {
      errors.push('CST é obrigatório');
    }
    if (!estado.icms.origem) {
      errors.push('Origem é obrigatória');
    }
    if (estado.icms.aliquota && (estado.icms.aliquota < 0 || estado.icms.aliquota > 100)) {
      errors.push('Alíquota deve estar entre 0% e 100%');
    }
    if (estado.icms.reducaoBase && (estado.icms.reducaoBase < 0 || estado.icms.reducaoBase > 100)) {
      errors.push('Redução da base deve estar entre 0% e 100%');
    }
    
    return errors;
  };


  // Função para renderizar campo com validação
  const renderValidatedField = (
    id: string, 
    label: string, 
    value: any, 
    onChange: (value: any) => void, 
    type: string = 'text',
    placeholder: string = '',
    step: string = '0.01',
    required: boolean = false,
    validation?: (value: any) => string | null
  ) => {
    const error = validation ? validation(value) : null;
    const hasError = error !== null;
    
    return (
      <div>
        <Label htmlFor={id} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">%</span>
          {label}
          {required && <span className="ml-2 text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">Obrigatório</span>}
        </Label>
        <div className="relative">
          <Input
            id={id}
            type={type}
            step={step}
            value={value || ''}
            onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md pr-8 ${
              hasError 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-green-500'
            }`}
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
        </div>
        {hasError && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'ICMS', label: 'ICMS', color: 'blue' },
    { id: 'ICMS_ST', label: 'ICMS ST', color: 'blue' },
    { id: 'ICMS_CONS_FINAL', label: 'ICMS CONS. FINAL', color: 'blue' },
    { id: 'IPI', label: 'IPI', color: 'purple' },
    { id: 'PIS', label: 'PIS', color: 'green' },
    { id: 'COFINS', label: 'COFINS', color: 'green' },
    { id: 'ISS', label: 'ISS', color: 'orange' },
    { id: 'OUTROS_IMPOSTOS', label: 'OUTRAS CONFIGURAÇÕES', color: 'purple' }
  ];

  const getTabColor = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    return tab?.color || 'gray';
  };

  const renderICMSTab = () => (
    <div className="space-y-8">
      {/* Header com informações do estado */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
        <div>
              <h3 className="text-xl font-bold text-gray-900">Configuração ICMS - {estado.nome}</h3>
              <p className="text-gray-600">Configure as regras tributárias do ICMS para este estado</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${estado.habilitado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium text-gray-600">
              {estado.habilitado ? 'Habilitado' : 'Desabilitado'}
            </span>
          </div>
        </div>
      </div>

      {/* Seção: Classificação Tributária */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Classificação Tributária
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor={`icms-cst-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <Calculator className="w-4 h-4 mr-2 text-blue-600" />
                  Código de Situação Tributária (CST/CSOSN)
                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Obrigatório</span>
          </Label>
          <select
            id={`icms-cst-${estado.uf}`}
            value={estado.icms.cst || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'icms.cst', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Selecione o CST ou CSOSN</option>
            <optgroup label="🏢 Regime Normal (CST)">
              {icmsOptions.filter(option => option.group === "Regime Normal").map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="🏪 Simples Nacional (CSOSN)">
              {icmsOptions.filter(option => option.group === "Simples Nacional").map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div>
                <Label htmlFor={`icms-origem-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <Calculator className="w-4 h-4 mr-2 text-blue-600" />
                  Origem da Mercadoria
                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Obrigatório</span>
          </Label>
          <select
            id={`icms-origem-${estado.uf}`}
            value={estado.icms.origem || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'icms.origem', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Selecione a Origem</option>
            <option value="0">0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8</option>
            <option value="1">1 - Estrangeira - Importação direta, exceto a indicada no código 6</option>
            <option value="2">2 - Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7</option>
            <option value="3">3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%</option>
            <option value="4">4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos de que tratam o Decreto-Lei nº 288/67</option>
            <option value="5">5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%</option>
            <option value="6">6 - Estrangeira - Importação direta, sem similar nacional, constante em lista de Resolução CAMEX e gás natural</option>
            <option value="7">7 - Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista de Resolução CAMEX e gás natural</option>
            <option value="8">8 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%</option>
          </select>
        </div>
            </div>

            <div className="space-y-4">
        <div>
                <Label htmlFor={`icms-mod-bc-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <Calculator className="w-4 h-4 mr-2 text-blue-600" />
                  Modalidade de Determinação da BC
          </Label>
          <select
            id={`icms-mod-bc-${estado.uf}`}
            value={estado.icms.modalidadeBc || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'icms.modalidadeBc', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Selecione a Modalidade</option>
            <option value="0">0 - Margem de valor agregado (%)</option>
            <option value="1">1 - Pauta (valor)</option>
            <option value="2">2 - Preço tabelado máximo (valor)</option>
            <option value="3">3 - Valor da operação</option>
            <option value="4">4 - Valor da operação com redução do ICMS</option>
            <option value="5">5 - Valor da operação sem redução do ICMS</option>
            <option value="6">6 - Quantidade x valor unitário</option>
            <option value="7">7 - Outros</option>
          </select>
      </div>

        <div>
                <Label htmlFor={`icms-motivo-desoneracao-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Motivo da Desoneração
          </Label>
          <select
            id={`icms-motivo-desoneracao-${estado.uf}`}
            value={estado.icms.motivoDesoneracao || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'icms.motivoDesoneracao', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Selecione o Motivo</option>
            <option value="1">1 - Táxi</option>
            <option value="2">2 - Deficiente físico</option>
            <option value="3">3 - Produtor agropecuário</option>
            <option value="4">4 - Frotista/locadora</option>
            <option value="5">5 - Diplomático/consular</option>
            <option value="6">6 - Utilitários e motocicletas da Amazônia Ocidental e Áreas de Livre Comércio (Resolução 714/88)</option>
            <option value="7">7 - SUFRAMA</option>
            <option value="8">8 - Venda a órgão Público</option>
            <option value="9">9 - Outros</option>
            <option value="10">10 - Deficiente condutor</option>
            <option value="11">11 - Deficiente não condutor</option>
            <option value="12">12 - Órgão de fomento e desenvolvimento agropecuário</option>
            <option value="16">16 - Olimpíadas Rio 2016</option>
            <option value="90">90 - Solicitado pelo Fisco</option>
          </select>
        </div>
        </div>
      </div>
    </div>
      </div>

      {/* Seção: Valores e Alíquotas */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Valores e Alíquotas
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderValidatedField(
              `icms-aliquota-${estado.uf}`,
              'Alíquota ICMS',
              estado.icms.aliquota,
              (value) => updateEstadoConfig(estado.uf, 'icms.aliquota', value),
              'number',
              '0,00',
              '0.01',
              false,
              (value) => {
                if (value && (value < 0 || value > 100)) {
                  return 'Alíquota deve estar entre 0% e 100%';
                }
                return null;
              }
            )}

            {renderValidatedField(
              `icms-reducao-base-${estado.uf}`,
              'Redução da Base de Cálculo',
              estado.icms.reducaoBase,
              (value) => updateEstadoConfig(estado.uf, 'icms.reducaoBase', value),
              'number',
              '0,0000000000',
              '0.0000000001',
              false,
              (value) => {
                if (value && (value < 0 || value > 100)) {
                  return 'Redução deve estar entre 0% e 100%';
                }
                return null;
              }
            )}

            {renderValidatedField(
              `icms-aliquota-deferimento-${estado.uf}`,
              'Alíquota de Deferimento',
              estado.icms.aliquotaDeferimento,
              (value) => updateEstadoConfig(estado.uf, 'icms.aliquotaDeferimento', value),
              'number',
              '0,00',
              '0.01',
              false,
              (value) => {
                if (value && (value < 0 || value > 100)) {
                  return 'Alíquota de deferimento deve estar entre 0% e 100%';
                }
                return null;
              }
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderValidatedField(
              `icms-fcp-${estado.uf}`,
              'Fundo de Combate à Pobreza (FCP)',
              estado.icms.fcp,
              (value) => updateEstadoConfig(estado.uf, 'icms.fcp', value),
              'number',
              '0,00',
              '0.01',
              false,
              (value) => {
                if (value && (value < 0 || value > 100)) {
                  return 'FCP deve estar entre 0% e 100%';
                }
                return null;
              }
            )}
          </div>
        </div>
      </div>

      {/* Seção: Configurações de Cálculo */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configurações de Cálculo
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-purple-600" />
                Base de Cálculo
              </h5>
              <div className="space-y-3">
                {renderCheckbox(
                  `icms-simples-${estado.uf}`, 
                  'Simples Nacional', 
                  estado.icms.simples || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icms.simples', checked),
                  'Aplica regras do Simples Nacional para cálculo do ICMS'
                )}
                {renderCheckbox(
                  `icms-reduzir-base-${estado.uf}`, 
                  'Reduzir base do ICMS', 
                  estado.icms.reduzirBase || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icms.reduzirBase', checked),
                  'Aplica redução na base de cálculo do ICMS'
                )}
                {renderCheckbox(
                  `icms-incluir-frete-${estado.uf}`, 
                  'Incluir frete no cálculo', 
                  estado.icms.incluirFrete || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icms.incluirFrete', checked),
                  'Inclui valor do frete na base de cálculo do ICMS'
                )}
                {renderCheckbox(
                  `icms-incluir-desconto-${estado.uf}`, 
                  'Incluir desconto no cálculo', 
                  estado.icms.incluirDesconto || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icms.incluirDesconto', checked),
                  'Inclui desconto na base de cálculo do ICMS'
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-purple-600" />
                Crédito e Débito
              </h5>
              <div className="space-y-3">
                {renderCheckbox(
                  `icms-credita-${estado.uf}`, 
                  'Credita ICMS', 
                  estado.icms.credita || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icms.credita', checked),
                  'Gera crédito de ICMS para o contribuinte'
                )}
                {renderCheckbox(
                  `icms-debita-${estado.uf}`, 
                  'Debita ICMS', 
                  estado.icms.debita || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icms.debita', checked),
                  'Gera débito de ICMS para o contribuinte'
                )}
                {renderCheckbox(
                  `icms-reduzir-valor-${estado.uf}`, 
                  'Reduzir valor do ICMS', 
                  estado.icms.reduzirValor || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icms.reduzirValor', checked),
                  'Aplica redução no valor do ICMS calculado'
                )}
                {renderCheckbox(
                  `icms-incluir-despesas-${estado.uf}`, 
                  'Incluir despesas no cálculo', 
                  estado.icms.incluirDespesas || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icms.incluirDespesas', checked),
                  'Inclui despesas acessórias na base de cálculo'
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-purple-600" />
                Outros Impostos
              </h5>
              <div className="space-y-3">
                {renderCheckbox(
                  `icms-importacao-${estado.uf}`, 
                  'ICMS importação', 
                  estado.icms.importacao || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icms.importacao', checked),
                  'Aplica regras específicas para ICMS de importação'
                )}
                {renderCheckbox(
                  `icms-incluir-ipi-${estado.uf}`, 
                  'Incluir IPI no cálculo', 
                  estado.icms.incluirIpi || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icms.incluirIpi', checked),
                  'Inclui valor do IPI na base de cálculo do ICMS'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderICMSSTTab = () => (
    <div className="space-y-8">
      {/* Header com informações do estado */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
        <div>
              <h3 className="text-xl font-bold text-gray-900">Configuração ICMS ST - {estado.nome}</h3>
              <p className="text-gray-600">Configure as regras de substituição tributária do ICMS para este estado</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${estado.habilitado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium text-gray-600">
              {estado.habilitado ? 'Habilitado' : 'Desabilitado'}
            </span>
          </div>
        </div>
      </div>

      {/* Seção: Classificação Tributária ST */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Classificação Tributária ST
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor={`icms-st-cst-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Calculator className="w-4 h-4 mr-2 text-orange-600" />
                  Código de Situação Tributária (CST)
                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Obrigatório</span>
          </Label>
          <select
            id={`icms-st-cst-${estado.uf}`}
            value={estado.icmsSt.cst || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'icmsSt.cst', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Selecione o CST</option>
            <option value="00">00 - Tributada integralmente</option>
            <option value="10">10 - Tributada e com cobrança do ICMS por substituição tributária</option>
            <option value="20">20 - Com redução de base de cálculo</option>
            <option value="30">30 - Isenta ou não tributada e com cobrança do ICMS por substituição tributária</option>
            <option value="40">40 - Isenta</option>
            <option value="41">41 - Não tributada</option>
            <option value="50">50 - Suspensão</option>
            <option value="51">51 - Diferimento</option>
            <option value="60">60 - ICMS cobrado anteriormente por substituição tributária</option>
            <option value="70">70 - Com redução de base de cálculo e cobrança do ICMS por substituição tributária</option>
            <option value="90">90 - Outras</option>
          </select>
        </div>

        <div>
                <Label htmlFor={`icms-st-origem-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Calculator className="w-4 h-4 mr-2 text-orange-600" />
                  Origem da Mercadoria
                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Obrigatório</span>
          </Label>
          <select
            id={`icms-st-origem-${estado.uf}`}
            value={estado.icmsSt.origem || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'icmsSt.origem', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Selecione a Origem</option>
            <option value="0">0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8</option>
            <option value="1">1 - Estrangeira - Importação direta, exceto a indicada no código 6</option>
            <option value="2">2 - Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7</option>
            <option value="3">3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%</option>
            <option value="4">4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos de que tratam o Decreto-Lei nº 288/67</option>
            <option value="5">5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%</option>
            <option value="6">6 - Estrangeira - Importação direta, sem similar nacional, constante em lista de Resolução CAMEX e gás natural</option>
            <option value="7">7 - Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista de Resolução CAMEX e gás natural</option>
            <option value="8">8 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%</option>
          </select>
        </div>
            </div>

            <div className="space-y-4">
        <div>
                <Label htmlFor={`icms-st-modalidade-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Settings className="w-4 h-4 mr-2 text-orange-600" />
                  Modalidade de Determinação da BC ST
          </Label>
          <select
            id={`icms-st-modalidade-${estado.uf}`}
            value={estado.icmsSt.modalidade || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'icmsSt.modalidade', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Selecione a Modalidade</option>
            <option value="0">0 - Preço tabelado ou máximo sugerido</option>
            <option value="1">1 - Lista negativa (valor)</option>
            <option value="2">2 - Lista positiva (valor)</option>
            <option value="3">3 - Lista neutra (valor)</option>
            <option value="4">4 - Margem de valor agregado (%)</option>
            <option value="5">5 - Pauta (valor)</option>
            <option value="6">6 - Valor da operação</option>
            <option value="7">7 - Outros</option>
          </select>
      </div>

          <div>
                <Label htmlFor={`icms-st-fecop-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">#</span>
              Número FECOP
            </Label>
            <Input
              id={`icms-st-fecop-${estado.uf}`}
              type="number"
              value={estado.icmsSt.fecop || ''}
              onChange={(e) => updateEstadoConfig(estado.uf, 'icmsSt.fecop', parseInt(e.target.value) || 0)}
              placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
            />
              </div>
            </div>
          </div>
          </div>
        </div>

      {/* Seção: Valores e Alíquotas ST */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Valores e Alíquotas ST
          </h4>
          </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderValidatedField(
              `icms-st-aliquota-${estado.uf}`,
              'Alíquota ICMS ST',
              estado.icmsSt.aliquota,
              (value) => updateEstadoConfig(estado.uf, 'icmsSt.aliquota', value),
              'number',
              '0,00',
              '0.01',
              false,
              (value) => {
                if (value && (value < 0 || value > 100)) {
                  return 'Alíquota deve estar entre 0% e 100%';
                }
                return null;
              }
            )}

            {renderValidatedField(
              `icms-st-mva-${estado.uf}`,
              'Margem de Valor Agregado (MVA)',
              estado.icmsSt.mva,
              (value) => updateEstadoConfig(estado.uf, 'icmsSt.mva', value),
              'number',
              '0,00',
              '0.01',
              false,
              (value) => {
                if (value && (value < 0 || value > 1000)) {
                  return 'MVA deve estar entre 0% e 1000%';
                }
                return null;
              }
            )}

            {renderValidatedField(
              `icms-st-interno-${estado.uf}`,
              'ICMS Interno',
              estado.icmsSt.interno,
              (value) => updateEstadoConfig(estado.uf, 'icmsSt.interno', value),
              'number',
              '0,00',
              '0.01',
              false,
              (value) => {
                if (value && (value < 0 || value > 100)) {
                  return 'ICMS Interno deve estar entre 0% e 100%';
                }
                return null;
              }
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderValidatedField(
              `icms-st-pmpf-${estado.uf}`,
              'Preço Médio Ponderado Final (PMPF)',
              estado.icmsSt.pmpf,
              (value) => updateEstadoConfig(estado.uf, 'icmsSt.pmpf', value),
              'number',
              '0,00',
              '0.01',
              false,
              (value) => {
                if (value && value < 0) {
                  return 'PMPF deve ser maior ou igual a 0';
                }
                return null;
              }
            )}

            {renderValidatedField(
              `icms-st-reducao-base-${estado.uf}`,
              'Redução da Base de Cálculo ST',
              estado.icmsSt.reducaoBase,
              (value) => updateEstadoConfig(estado.uf, 'icmsSt.reducaoBase', value),
              'number',
              '0,0000000000',
              '0.0000000001',
              false,
              (value) => {
                if (value && (value < 0 || value > 100)) {
                  return 'Redução deve estar entre 0% e 100%';
                }
                return null;
              }
            )}

            {renderValidatedField(
              `icms-st-fcp-${estado.uf}`,
              'Fundo de Combate à Pobreza (FCP)',
              estado.icmsSt.fcp,
              (value) => updateEstadoConfig(estado.uf, 'icmsSt.fcp', value),
              'number',
              '0,00',
              '0.01',
              false,
              (value) => {
                if (value && (value < 0 || value > 100)) {
                  return 'FCP deve estar entre 0% e 100%';
                }
                return null;
              }
            )}
            </div>
          </div>
        </div>

      {/* Seção: Configurações de Cálculo ST */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configurações de Cálculo ST
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-violet-600" />
                Base de Cálculo ST
              </h5>
        <div className="space-y-3">
                {renderCheckbox(
                  `icms-st-simples-${estado.uf}`, 
                  'Simples Nacional ST', 
                  estado.icmsSt.simples || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icmsSt.simples', checked),
                  'Aplica regras do Simples Nacional para cálculo do ICMS ST'
                )}
                {renderCheckbox(
                  `icms-st-reduzir-base-${estado.uf}`, 
                  'Reduzir base do ICMS ST', 
                  estado.icmsSt.reduzirBase || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icmsSt.reduzirBase', checked),
                  'Aplica redução na base de cálculo do ICMS ST'
                )}
                {renderCheckbox(
                  `icms-st-incluir-frete-${estado.uf}`, 
                  'Incluir frete no cálculo ST', 
                  estado.icmsSt.incluirFrete || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icmsSt.incluirFrete', checked),
                  'Inclui valor do frete na base de cálculo do ICMS ST'
                )}
                {renderCheckbox(
                  `icms-st-incluir-desconto-${estado.uf}`, 
                  'Incluir desconto no cálculo ST', 
                  estado.icmsSt.incluirDesconto || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icmsSt.incluirDesconto', checked),
                  'Inclui desconto na base de cálculo do ICMS ST'
                )}
          </div>
          </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-violet-600" />
                Crédito e Débito ST
              </h5>
              <div className="space-y-3">
                {renderCheckbox(
                  `icms-st-credita-${estado.uf}`, 
                  'Credita ICMS ST', 
                  estado.icmsSt.credita || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icmsSt.credita', checked),
                  'Gera crédito de ICMS ST para o contribuinte'
                )}
                {renderCheckbox(
                  `icms-st-debita-${estado.uf}`, 
                  'Debita ICMS ST', 
                  estado.icmsSt.debita || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icmsSt.debita', checked),
                  'Gera débito de ICMS ST para o contribuinte'
                )}
                {renderCheckbox(
                  `icms-st-reduzir-valor-${estado.uf}`, 
                  'Reduzir valor do ICMS ST', 
                  estado.icmsSt.reduzirValor || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icmsSt.reduzirValor', checked),
                  'Aplica redução no valor do ICMS ST calculado'
                )}
                {renderCheckbox(
                  `icms-st-incluir-despesas-${estado.uf}`, 
                  'Incluir despesas no cálculo ST', 
                  estado.icmsSt.incluirDespesas || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icmsSt.incluirDespesas', checked),
                  'Inclui despesas acessórias na base de cálculo ST'
                )}
          </div>
          </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-violet-600" />
                Configurações Especiais ST
              </h5>
              <div className="space-y-3">
                {renderCheckbox(
                  `icms-st-incluir-ipi-${estado.uf}`, 
                  'Incluir IPI no cálculo ST', 
                  estado.icmsSt.incluirIpi || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icmsSt.incluirIpi', checked),
                  'Inclui valor do IPI na base de cálculo do ICMS ST'
                )}
                {renderCheckbox(
                  `icms-st-destacar-${estado.uf}`, 
                  'Destacar ICMS ST Próprio', 
                  estado.icmsSt.destacar || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icmsSt.destacar', checked),
                  'Destaca o ICMS ST próprio na nota fiscal'
                )}
                {renderCheckbox(
                  `icms-st-pmpf-cons-final-${estado.uf}`, 
                  'PMPF Consumidor Final', 
                  estado.icmsSt.pmpfConsFinal || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icmsSt.pmpfConsFinal', checked),
                  'Aplica PMPF para consumidor final'
                )}
                {renderCheckbox(
                  `icms-st-difal-${estado.uf}`, 
                  'DIFAL por ST', 
                  estado.icmsSt.difal || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icmsSt.difal', checked),
                  'Aplica DIFAL na substituição tributária'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderICMSConsFinalTab = () => (
    <div className="space-y-8">
      {/* Header com informações do estado */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
              <h3 className="text-xl font-bold text-gray-900">Configuração ICMS Consumidor Final - {estado.nome}</h3>
              <p className="text-gray-600">Configure as regras de ICMS para consumidor final neste estado</p>
        </div>
      </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${estado.habilitado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium text-gray-600">
              {estado.habilitado ? 'Habilitado' : 'Desabilitado'}
            </span>
    </div>
        </div>
      </div>

      {/* Seção: Alíquotas Interestaduais */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
            Alíquotas Interestaduais
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderValidatedField(
              `icms-cons-final-interestadual-${estado.uf}`,
              'ICMS Interestadual',
              estado.icmsConsumidorFinal.interestadual,
              (value) => updateEstadoConfig(estado.uf, 'icmsConsumidorFinal.interestadual', value),
              'number',
              '0,00',
              '0.01',
              false,
              (value) => {
                if (value && (value < 0 || value > 100)) {
                  return 'Alíquota deve estar entre 0% e 100%';
                }
                return null;
              }
            )}

            {renderValidatedField(
              `icms-cons-final-fcp-${estado.uf}`,
              'Fundo de Combate à Pobreza (FCP)',
              estado.icmsConsumidorFinal.fcp,
              (value) => updateEstadoConfig(estado.uf, 'icmsConsumidorFinal.fcp', value),
              'number',
              '0,00',
              '0.01',
              false,
              (value) => {
                if (value && (value < 0 || value > 100)) {
                  return 'FCP deve estar entre 0% e 100%';
                }
                return null;
              }
            )}
            </div>
            </div>
          </div>

      {/* Seção: Alíquotas Internas */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Alíquotas Internas
          </h4>
            </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderValidatedField(
              `icms-cons-final-interno-${estado.uf}`,
              'ICMS Interno',
              estado.icmsConsumidorFinal.interno,
              (value) => updateEstadoConfig(estado.uf, 'icmsConsumidorFinal.interno', value),
              'number',
              '0,00',
              '0.01',
              false,
              (value) => {
                if (value && (value < 0 || value > 100)) {
                  return 'Alíquota deve estar entre 0% e 100%';
                }
                return null;
              }
            )}

            {renderValidatedField(
              `icms-cons-final-operacao-${estado.uf}`,
              'ICMS de Operação',
              estado.icmsConsumidorFinal.operacao,
              (value) => updateEstadoConfig(estado.uf, 'icmsConsumidorFinal.operacao', value),
              'number',
              '0,00',
              '0.01',
              false,
              (value) => {
                if (value && (value < 0 || value > 100)) {
                  return 'Alíquota deve estar entre 0% e 100%';
                }
                return null;
              }
            )}
          </div>
            </div>
          </div>

      {/* Seção: Partilha Provisória */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Partilha Provisória
          </h4>
            </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderValidatedField(
              `icms-cons-final-provisorio-origem-${estado.uf}`,
              'UF Origem',
              estado.icmsConsumidorFinal.provisorioOrigem,
              (value) => updateEstadoConfig(estado.uf, 'icmsConsumidorFinal.provisorioOrigem', value),
              'number',
              '0,00',
              '0.01',
              false,
              (value) => {
                if (value && (value < 0 || value > 100)) {
                  return 'Alíquota deve estar entre 0% e 100%';
                }
                return null;
              }
            )}

            {renderValidatedField(
              `icms-cons-final-provisorio-destino-${estado.uf}`,
              'UF Destino',
              estado.icmsConsumidorFinal.provisorioDestino,
              (value) => updateEstadoConfig(estado.uf, 'icmsConsumidorFinal.provisorioDestino', value),
              'number',
              '0,00',
              '0.01',
              false,
              (value) => {
                if (value && (value < 0 || value > 100)) {
                  return 'Alíquota deve estar entre 0% e 100%';
                }
                return null;
              }
            )}
            </div>
          </div>
        </div>

      {/* Seção: Configurações Especiais */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configurações Especiais
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-purple-600" />
                Configurações de Base
              </h5>
              <div className="space-y-3">
                {renderCheckbox(
                  `icms-cons-final-incluir-interno-${estado.uf}`, 
                  'Incluir ICMS Interno na Base', 
                  estado.icmsConsumidorFinal.incluirInterno || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icmsConsumidorFinal.incluirInterno', checked),
                  'Inclui o ICMS interno na base de cálculo do DIFAL'
                )}
                {renderCheckbox(
                  `icms-cons-final-nao-devido-${estado.uf}`, 
                  'ICMS não devido ao UF de Origem', 
                  estado.icmsConsumidorFinal.naoDevido || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'icmsConsumidorFinal.naoDevido', checked),
                  'Indica que o ICMS não é devido ao estado de origem'
                )}
      </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-purple-600" />
                Informações Adicionais
              </h5>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>DIFAL (Diferencial de Alíquotas):</strong>
                </p>
                <p className="text-xs text-gray-500">
                  O DIFAL é calculado pela diferença entre a alíquota interna do estado de destino 
                  e a alíquota interestadual, aplicada sobre o valor da operação.
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>

    </div>
  );

  const renderIPITab = () => (
    <div className="space-y-8">
      {/* Header com informações do estado */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
        <div>
              <h3 className="text-xl font-bold text-gray-900">Configuração IPI - {estado.nome}</h3>
              <p className="text-gray-600">Configure as regras do Imposto sobre Produtos Industrializados para este estado</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${estado.habilitado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium text-gray-600">
              {estado.habilitado ? 'Habilitado' : 'Desabilitado'}
            </span>
          </div>
        </div>
      </div>

      {/* Seção: Classificação Tributária IPI */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Classificação Tributária IPI
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor={`ipi-cst-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Calculator className="w-4 h-4 mr-2 text-purple-600" />
                  Código de Situação Tributária (CST)
                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Obrigatório</span>
          </Label>
          <select
            id={`ipi-cst-${estado.uf}`}
            value={estado.ipi.cst || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'ipi.cst', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Selecione o CST</option>
            <option value="00">00 - Entrada com recuperação de crédito</option>
            <option value="01">01 - Entrada tributada com alíquota básica</option>
            <option value="02">02 - Entrada tributada com alíquota diferenciada</option>
            <option value="03">03 - Entrada tributada com alíquota por unidade de medida de produto</option>
            <option value="04">04 - Entrada não tributada</option>
            <option value="05">05 - Entrada suspensa</option>
            <option value="49">49 - Outras entradas</option>
            <option value="50">50 - Saída tributada</option>
            <option value="51">51 - Saída tributável com alíquota por unidade de medida de produto</option>
            <option value="52">52 - Saída tributada com alíquota diferenciada</option>
            <option value="53">53 - Saída suspensa</option>
            <option value="54">54 - Saída não tributada</option>
            <option value="55">55 - Saída com suspensão</option>
            <option value="99">99 - Outras saídas</option>
          </select>
        </div>

        <div>
                <Label htmlFor={`ipi-aliquota-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">%</span>
                  Alíquota IPI
          </Label>
                <div className="relative">
          <Input
            id={`ipi-aliquota-${estado.uf}`}
            type="number"
            step="0.01"
            value={estado.ipi.aliquota || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'ipi.aliquota', parseFloat(e.target.value) || 0)}
            placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md pr-8"
          />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
        </div>
              </div>
            </div>

            <div className="space-y-4">
        <div>
                <Label htmlFor={`ipi-classe-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">#</span>
                  Classe de Enquadramento
          </Label>
          <Input
            id={`ipi-classe-${estado.uf}`}
            value={estado.ipi.classe || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'ipi.classe', e.target.value)}
            placeholder="Ex: 1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          />
        </div>

        <div>
                <Label htmlFor={`ipi-codigo-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">#</span>
                  Código de Enquadramento
          </Label>
          <Input
            id={`ipi-codigo-${estado.uf}`}
            value={estado.ipi.codigo || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'ipi.codigo', e.target.value)}
            placeholder="Ex: 1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          />
        </div>
      </div>
          </div>
          </div>
        </div>

      {/* Seção: Configurações de Cálculo IPI */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configurações de Cálculo IPI
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-violet-600" />
                Crédito e Débito
              </h5>
        <div className="space-y-3">
                {renderCheckbox(
                  `ipi-credita-${estado.uf}`, 
                  'Credita IPI', 
                  estado.ipi.credita || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'ipi.credita', checked),
                  'Gera crédito de IPI para o contribuinte'
                )}
                {renderCheckbox(
                  `ipi-debita-${estado.uf}`, 
                  'Debita IPI', 
                  estado.ipi.debita || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'ipi.debita', checked),
                  'Gera débito de IPI para o contribuinte'
                )}
          </div>
        </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-violet-600" />
                Base de Cálculo
              </h5>
        <div className="space-y-3">
                {renderCheckbox(
                  `ipi-incluir-frete-${estado.uf}`, 
                  'Incluir frete no cálculo', 
                  estado.ipi.incluirFrete || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'ipi.incluirFrete', checked),
                  'Inclui valor do frete na base de cálculo do IPI'
                )}
                {renderCheckbox(
                  `ipi-incluir-desconto-${estado.uf}`, 
                  'Incluir desconto no cálculo', 
                  estado.ipi.incluirDesconto || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'ipi.incluirDesconto', checked),
                  'Inclui desconto na base de cálculo do IPI'
                )}
                {renderCheckbox(
                  `ipi-incluir-despesas-${estado.uf}`, 
                  'Incluir despesas no cálculo', 
                  estado.ipi.incluirDespesas || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'ipi.incluirDespesas', checked),
                  'Inclui despesas acessórias na base de cálculo do IPI'
                )}
          </div>
        </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-violet-600" />
                Aplicação
              </h5>
        <div className="space-y-3">
                {/* IPI calculado baseado apenas no CST e alíquota */}
                {renderCheckbox(
                  `ipi-importacao-${estado.uf}`, 
                  'IPI importação', 
                  estado.ipi.importacao || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'ipi.importacao', checked),
                  'Aplica regras específicas para IPI de importação'
                )}
          </div>
        </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-violet-600" />
                Informações Adicionais
              </h5>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>IPI (Imposto sobre Produtos Industrializados):</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Imposto federal que incide sobre produtos industrializados, 
                  calculado sobre o valor da operação ou quantidade vendida.
                </p>
      </div>
            </div>
          </div>
          </div>
        </div>

    </div>
  );

  const renderPISTab = () => (
    <div className="space-y-8">
      {/* Header com informações do estado */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
        <div>
              <h3 className="text-xl font-bold text-gray-900">Configuração PIS - {estado.nome}</h3>
              <p className="text-gray-600">Configure as regras do Programa de Integração Social para este estado</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${estado.habilitado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium text-gray-600">
              {estado.habilitado ? 'Habilitado' : 'Desabilitado'}
            </span>
          </div>
        </div>
      </div>

      {/* Seção: Classificação Tributária PIS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Classificação Tributária PIS
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor={`pis-cst-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Calculator className="w-4 h-4 mr-2 text-green-600" />
                  Código de Situação Tributária (CST)
                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Obrigatório</span>
          </Label>
          <select
            id={`pis-cst-${estado.uf}`}
            value={estado.pis.cst || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'pis.cst', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Selecione o CST</option>
            <option value="01">01 - Operação tributável (base de cálculo = valor da operação alíquota normal (cumulativo/não cumulativo))</option>
            <option value="02">02 - Operação tributável (base de cálculo = valor da operação (alíquota diferenciada))</option>
            <option value="03">03 - Operação tributável (base de cálculo = quantidade vendida × alíquota por unidade de produto)</option>
            <option value="04">04 - Operação tributável (tributação monofásica (alíquota zero))</option>
            <option value="05">05 - Operação tributável (substituição tributária)</option>
            <option value="06">06 - Operação tributável (alíquota zero)</option>
            <option value="07">07 - Operação isenta da contribuição</option>
            <option value="08">08 - Operação sem incidência da contribuição</option>
            <option value="09">09 - Operação com suspensão da contribuição</option>
            <option value="49">49 - Outras operações de saída</option>
            <option value="50">50 - Operação com direito a crédito - vinculada exclusivamente a receita tributada no mercado interno</option>
            <option value="51">51 - Operação com direito a crédito - vinculada exclusivamente a receita não tributada no mercado interno</option>
            <option value="52">52 - Operação com direito a crédito - vinculada exclusivamente a receita de exportação</option>
            <option value="53">53 - Operação com direito a crédito - vinculada a receitas tributadas e não-tributadas no mercado interno</option>
            <option value="54">54 - Operação com direito a crédito - vinculada a receitas tributadas no mercado interno e de exportação</option>
            <option value="55">55 - Operação com direito a crédito - vinculada a receitas não-tributadas no mercado interno e de exportação</option>
            <option value="56">56 - Operação com direito a crédito - vinculada a receitas tributadas e não-tributadas no mercado interno, e de exportação</option>
            <option value="60">60 - Crédito presunto - operação de aquisição vinculada exclusivamente a receita tributada no mercado interno</option>
            <option value="61">61 - Crédito presunto - operação de aquisição vinculada exclusivamente a receita não-tributada no mercado interno</option>
            <option value="62">62 - Crédito presunto - operação de aquisição vinculada exclusivamente a receita de exportação</option>
            <option value="63">63 - Crédito presunto - operação de aquisição vinculada a receitas tributadas e não-tributadas no mercado interno</option>
            <option value="64">64 - Crédito presunto - operação de aquisição vinculada a receitas tributadas no mercado interno e de exportação</option>
            <option value="65">65 - Crédito presunto - operação de aquisição vinculada a receitas não-tributadas no mercado interno e de exportação</option>
            <option value="66">66 - Crédito presunto - operação de aquisição vinculada a receitas tributadas e não-tributadas no mercado interno, e de exportação</option>
            <option value="67">67 - Crédito presunto - outras operações</option>
            <option value="70">70 - Operação de aquisição sem direito a crédito</option>
            <option value="71">71 - Operação de aquisição com isenção</option>
            <option value="72">72 - Operação de aquisição com suspensão</option>
            <option value="73">73 - Operação de aquisição a alíquota zero</option>
            <option value="74">74 - Operação de aquisição sem incidência da contribuição</option>
            <option value="75">75 - Operação de aquisição por substituição tributária</option>
            <option value="98">98 - Outras operações de entrada</option>
            <option value="99">99 - Outras operações</option>
          </select>
        </div>
            </div>

            <div className="space-y-4">
        <div>
                <Label htmlFor={`pis-aliquota-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">%</span>
                  Alíquota PIS
          </Label>
                <div className="relative">
          <Input
            id={`pis-aliquota-${estado.uf}`}
            type="number"
            step="0.01"
            value={estado.pis.aliquota || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'pis.aliquota', parseFloat(e.target.value) || 0)}
            placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md pr-8"
          />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
        </div>
      </div>

          <div>
                <Label htmlFor={`pis-reducao-base-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">%</span>
                  Redução de Base de Cálculo
            </Label>
                <div className="relative">
            <Input
              id={`pis-reducao-base-${estado.uf}`}
              type="number"
              step="0.0000000001"
              value={estado.pis.reducaoBase || ''}
              onChange={(e) => updateEstadoConfig(estado.uf, 'pis.reducaoBase', parseFloat(e.target.value) || 0)}
              placeholder="0,0000000000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md pr-8"
            />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

      {/* Seção: Configurações de Cálculo PIS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configurações de Cálculo PIS
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-emerald-600" />
                Crédito e Débito
              </h5>
        <div className="space-y-3">
                {renderCheckbox(
                  `pis-credita-${estado.uf}`, 
                  'Credita PIS', 
                  estado.pis.credita || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'pis.credita', checked),
                  'Gera crédito de PIS para o contribuinte'
                )}
                {renderCheckbox(
                  `pis-debita-${estado.uf}`, 
                  'Debita PIS', 
                  estado.pis.debita || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'pis.debita', checked),
                  'Gera débito de PIS para o contribuinte'
                )}
          </div>
        </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-emerald-600" />
                Base de Cálculo
              </h5>
        <div className="space-y-3">
                {renderCheckbox(
                  `pis-incluir-frete-${estado.uf}`, 
                  'Incluir frete no cálculo', 
                  estado.pis.incluirFrete || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'pis.incluirFrete', checked),
                  'Inclui valor do frete na base de cálculo do PIS'
                )}
                {renderCheckbox(
                  `pis-incluir-desconto-${estado.uf}`, 
                  'Incluir desconto no cálculo', 
                  estado.pis.incluirDesconto || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'pis.incluirDesconto', checked),
                  'Inclui desconto na base de cálculo do PIS'
                )}
                {renderCheckbox(
                  `pis-incluir-despesas-${estado.uf}`, 
                  'Incluir despesas no cálculo', 
                  estado.pis.incluirDespesas || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'pis.incluirDespesas', checked),
                  'Inclui despesas acessórias na base de cálculo do PIS'
                )}
          </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-emerald-600" />
                Aplicação
              </h5>
              <div className="space-y-3">
                {renderCheckbox(
                  `pis-aplicar-produto-${estado.uf}`, 
                  'Aplicar PIS para produto', 
                  estado.pis.aplicarProduto || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'pis.aplicarProduto', checked),
                  'Aplica PIS especificamente para produtos'
                )}
                {renderCheckbox(
                  `pis-importacao-${estado.uf}`, 
                  'PIS importação', 
                  estado.pis.importacao || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'pis.importacao', checked),
                  'Aplica regras específicas para PIS de importação'
                )}
          </div>
        </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-emerald-600" />
                Reduções
              </h5>
        <div className="space-y-3">
                {renderCheckbox(
                  `pis-reduzir-base-${estado.uf}`, 
                  'Reduzir base PIS', 
                  estado.pis.reduzirBase || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'pis.reduzirBase', checked),
                  'Aplica redução na base de cálculo do PIS'
                )}
          </div>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>PIS (Programa de Integração Social):</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Contribuição social federal que incide sobre a receita bruta das empresas, 
                  destinada ao financiamento de programas sociais.
                </p>
          </div>
        </div>
      </div>
    </div>
      </div>

    </div>
  );

  const renderCOFINSTab = () => (
    <div className="space-y-8">
      {/* Header com informações do estado */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
        <div>
              <h3 className="text-xl font-bold text-gray-900">Configuração COFINS - {estado.nome}</h3>
              <p className="text-gray-600">Configure as regras da Contribuição para o Financiamento da Seguridade Social para este estado</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${estado.habilitado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium text-gray-600">
              {estado.habilitado ? 'Habilitado' : 'Desabilitado'}
            </span>
          </div>
        </div>
      </div>

      {/* Seção: Classificação Tributária COFINS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Classificação Tributária COFINS
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor={`cofins-cst-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Calculator className="w-4 h-4 mr-2 text-blue-600" />
                  Código de Situação Tributária (CST)
                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Obrigatório</span>
          </Label>
          <select
            id={`cofins-cst-${estado.uf}`}
            value={estado.cofins.cst || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'cofins.cst', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Selecione o CST</option>
            <option value="01">01 - Operação tributável (base de cálculo = valor da operação alíquota normal (cumulativo/não cumulativo))</option>
            <option value="02">02 - Operação tributável (base de cálculo = valor da operação (alíquota diferenciada))</option>
            <option value="03">03 - Operação tributável (base de cálculo = quantidade vendida × alíquota por unidade de produto)</option>
            <option value="04">04 - Operação tributável (tributação monofásica (alíquota zero))</option>
            <option value="05">05 - Operação tributável (substituição tributária)</option>
            <option value="06">06 - Operação tributável (alíquota zero)</option>
            <option value="07">07 - Operação isenta da contribuição</option>
            <option value="08">08 - Operação sem incidência da contribuição</option>
            <option value="09">09 - Operação com suspensão da contribuição</option>
            <option value="49">49 - Outras operações de saída</option>
            <option value="50">50 - Operação com direito a crédito - vinculada exclusivamente a receita tributada no mercado interno</option>
            <option value="51">51 - Operação com direito a crédito - vinculada exclusivamente a receita não tributada no mercado interno</option>
            <option value="52">52 - Operação com direito a crédito - vinculada exclusivamente a receita de exportação</option>
            <option value="53">53 - Operação com direito a crédito - vinculada a receitas tributadas e não-tributadas no mercado interno</option>
            <option value="54">54 - Operação com direito a crédito - vinculada a receitas tributadas no mercado interno e de exportação</option>
            <option value="55">55 - Operação com direito a crédito - vinculada a receitas não-tributadas no mercado interno e de exportação</option>
            <option value="56">56 - Operação com direito a crédito - vinculada a receitas tributadas e não-tributadas no mercado interno, e de exportação</option>
            <option value="60">60 - Crédito presunto - operação de aquisição vinculada exclusivamente a receita tributada no mercado interno</option>
            <option value="61">61 - Crédito presunto - operação de aquisição vinculada exclusivamente a receita não-tributada no mercado interno</option>
            <option value="62">62 - Crédito presunto - operação de aquisição vinculada exclusivamente a receita de exportação</option>
            <option value="63">63 - Crédito presunto - operação de aquisição vinculada a receitas tributadas e não-tributadas no mercado interno</option>
            <option value="64">64 - Crédito presunto - operação de aquisição vinculada a receitas tributadas no mercado interno e de exportação</option>
            <option value="65">65 - Crédito presunto - operação de aquisição vinculada a receitas não-tributadas no mercado interno e de exportação</option>
            <option value="66">66 - Crédito presunto - operação de aquisição vinculada a receitas tributadas e não-tributadas no mercado interno, e de exportação</option>
            <option value="67">67 - Crédito presunto - outras operações</option>
            <option value="70">70 - Operação de aquisição sem direito a crédito</option>
            <option value="71">71 - Operação de aquisição com isenção</option>
            <option value="72">72 - Operação de aquisição com suspensão</option>
            <option value="73">73 - Operação de aquisição a alíquota zero</option>
            <option value="74">74 - Operação de aquisição sem incidência da contribuição</option>
            <option value="75">75 - Operação de aquisição por substituição tributária</option>
            <option value="98">98 - Outras operações de entrada</option>
            <option value="99">99 - Outras operações</option>
          </select>
        </div>
            </div>

            <div className="space-y-4">
        <div>
                <Label htmlFor={`cofins-aliquota-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">%</span>
                  Alíquota COFINS
          </Label>
                <div className="relative">
          <Input
            id={`cofins-aliquota-${estado.uf}`}
            type="number"
            step="0.01"
            value={estado.cofins.aliquota || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'cofins.aliquota', parseFloat(e.target.value) || 0)}
            placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md pr-8"
          />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
        </div>
      </div>

          <div>
                <Label htmlFor={`cofins-reducao-base-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">%</span>
                  Redução de Base de Cálculo
            </Label>
                <div className="relative">
            <Input
              id={`cofins-reducao-base-${estado.uf}`}
              type="number"
              step="0.0000000001"
              value={estado.cofins.reducaoBase || ''}
              onChange={(e) => updateEstadoConfig(estado.uf, 'cofins.reducaoBase', parseFloat(e.target.value) || 0)}
              placeholder="0,0000000000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md pr-8"
            />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

      {/* Seção: Configurações de Cálculo COFINS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configurações de Cálculo COFINS
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-indigo-600" />
                Crédito e Débito
              </h5>
        <div className="space-y-3">
                {renderCheckbox(
                  `cofins-credita-${estado.uf}`, 
                  'Credita COFINS', 
                  estado.cofins.credita || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'cofins.credita', checked),
                  'Gera crédito de COFINS para o contribuinte'
                )}
                {renderCheckbox(
                  `cofins-debita-${estado.uf}`, 
                  'Debita COFINS', 
                  estado.cofins.debita || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'cofins.debita', checked),
                  'Gera débito de COFINS para o contribuinte'
                )}
          </div>
        </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-indigo-600" />
                Base de Cálculo
              </h5>
        <div className="space-y-3">
                {renderCheckbox(
                  `cofins-incluir-frete-${estado.uf}`, 
                  'Incluir frete no cálculo', 
                  estado.cofins.incluirFrete || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'cofins.incluirFrete', checked),
                  'Inclui valor do frete na base de cálculo do COFINS'
                )}
                {renderCheckbox(
                  `cofins-incluir-desconto-${estado.uf}`, 
                  'Incluir desconto no cálculo', 
                  estado.cofins.incluirDesconto || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'cofins.incluirDesconto', checked),
                  'Inclui desconto na base de cálculo do COFINS'
                )}
                {renderCheckbox(
                  `cofins-incluir-despesas-${estado.uf}`, 
                  'Incluir despesas no cálculo', 
                  estado.cofins.incluirDespesas || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'cofins.incluirDespesas', checked),
                  'Inclui despesas acessórias na base de cálculo do COFINS'
                )}
          </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-indigo-600" />
                Aplicação
              </h5>
              <div className="space-y-3">
                {renderCheckbox(
                  `cofins-aplicar-produto-${estado.uf}`, 
                  'Aplicar COFINS para produto', 
                  estado.cofins.aplicarProduto || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'cofins.aplicarProduto', checked),
                  'Aplica COFINS especificamente para produtos'
                )}
                {renderCheckbox(
                  `cofins-importacao-${estado.uf}`, 
                  'COFINS importação', 
                  estado.cofins.importacao || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'cofins.importacao', checked),
                  'Aplica regras específicas para COFINS de importação'
                )}
          </div>
        </div>

            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-indigo-600" />
                Reduções
              </h5>
        <div className="space-y-3">
                {renderCheckbox(
                  `cofins-reduzir-base-${estado.uf}`, 
                  'Reduzir base COFINS', 
                  estado.cofins.reduzirBase || false, 
                  (checked) => updateEstadoConfig(estado.uf, 'cofins.reduzirBase', checked),
                  'Aplica redução na base de cálculo do COFINS'
                )}
          </div>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>COFINS (Contribuição para o Financiamento da Seguridade Social):</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Contribuição social federal que incide sobre a receita bruta das empresas, 
                  destinada ao financiamento da seguridade social.
                </p>
          </div>
        </div>
      </div>
    </div>
      </div>

    </div>
  );

  const renderISSTab = () => (
    <div className="space-y-8">
      {/* Header com informações do estado */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
        <div>
              <h3 className="text-xl font-bold text-gray-900">Configuração ISS - {estado.nome}</h3>
              <p className="text-gray-600">Configure as regras do Imposto sobre Serviços de Qualquer Natureza para este estado</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${estado.habilitado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium text-gray-600">
              {estado.habilitado ? 'Habilitado' : 'Desabilitado'}
            </span>
          </div>
        </div>
      </div>

      {/* Seção: Classificação Tributária ISS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Classificação Tributária ISS
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor={`iss-cst-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <Calculator className="w-4 h-4 mr-2 text-orange-600" />
                  Código de Situação Tributária (CST)
                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Obrigatório</span>
          </Label>
          <select
            id={`iss-cst-${estado.uf}`}
            value={estado.iss.cst || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'iss.cst', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Selecione o CST</option>
            <option value="01">01 - Tributada no município</option>
            <option value="02">02 - Tributável, mas com isenção</option>
            <option value="03">03 - Não tributável</option>
            <option value="04">04 - Imune</option>
            <option value="05">05 - Suspensão</option>
            <option value="06">06 - Diferimento</option>
            <option value="07">07 - Isenção</option>
            <option value="08">08 - Não incidência</option>
            <option value="09">09 - Outras</option>
          </select>
        </div>

        <div>
                <Label htmlFor={`iss-situacao-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <FileText className="w-4 h-4 mr-2 text-orange-600" />
            Situação ISSQN
          </Label>
          <select
            id={`iss-situacao-${estado.uf}`}
            value={estado.iss.situacao || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'iss.situacao', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Selecione a Situação</option>
            <option value="01">01 - Tributada</option>
            <option value="02">02 - Isenta</option>
            <option value="03">03 - Não tributável</option>
            <option value="04">04 - Imune</option>
            <option value="05">05 - Suspensão</option>
            <option value="06">06 - Diferimento</option>
            <option value="07">07 - Outras</option>
          </select>
        </div>
            </div>

            <div className="space-y-4">
        <div>
                <Label htmlFor={`iss-natureza-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <FileText className="w-4 h-4 mr-2 text-orange-600" />
            Natureza de Operação ISS
          </Label>
          <select
            id={`iss-natureza-${estado.uf}`}
            value={estado.iss.natureza || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'iss.natureza', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Selecione a Natureza</option>
            <option value="01">01 - Tributada no município</option>
            <option value="02">02 - Tributável, mas com isenção</option>
            <option value="03">03 - Não tributável</option>
            <option value="04">04 - Imune</option>
            <option value="05">05 - Suspensão</option>
            <option value="06">06 - Diferimento</option>
            <option value="07">07 - Isenção</option>
            <option value="08">08 - Não incidência</option>
            <option value="09">09 - Outras</option>
          </select>
        </div>

        <div>
                <Label htmlFor={`iss-aliquota-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">%</span>
            Alíquota ISS
          </Label>
                <div className="relative">
          <Input
            id={`iss-aliquota-${estado.uf}`}
            type="number"
            step="0.01"
            value={estado.iss.aliquota || ''}
            onChange={(e) => updateEstadoConfig(estado.uf, 'iss.aliquota', parseFloat(e.target.value) || 0)}
            placeholder="0,00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md pr-8"
          />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção: Impostos Retidos */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
          Impostos Retidos
          </h4>
        </div>
        <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CSLL */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                <Calculator className="w-4 h-4 mr-2" />
                CSLL
              </h4>
          <div className="space-y-3">
            <div>
                  <Label htmlFor={`iss-csll-porcentagem-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">%</span>
                Porcentagem
              </Label>
                  <div className="relative">
              <Input
                id={`iss-csll-porcentagem-${estado.uf}`}
                type="number"
                step="0.01"
                value={estado.iss.csllPorcentagem || ''}
                onChange={(e) => updateEstadoConfig(estado.uf, 'iss.csllPorcentagem', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm pr-8"
              />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                  </div>
            </div>
            <div>
                  <Label htmlFor={`iss-csll-acima-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">R$</span>
                Acima de
              </Label>
                  <div className="relative">
              <Input
                id={`iss-csll-acima-${estado.uf}`}
                type="number"
                step="0.01"
                value={estado.iss.csllAcima || ''}
                onChange={(e) => updateEstadoConfig(estado.uf, 'iss.csllAcima', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm pr-8"
              />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
            </div>
                </div>
                {renderCheckbox(`iss-csll-retido-${estado.uf}`, 'CSLL - Retido', estado.iss.csllRetido || false, (checked) => updateEstadoConfig(estado.uf, 'iss.csllRetido', checked), 'Retém CSLL na fonte')}
              </div>
          </div>

          {/* ISS */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-4 flex items-center">
                <Calculator className="w-4 h-4 mr-2" />
                ISS
              </h4>
          <div className="space-y-3">
            <div>
                  <Label htmlFor={`iss-iss-porcentagem-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">%</span>
                Porcentagem
              </Label>
                  <div className="relative">
              <Input
                id={`iss-iss-porcentagem-${estado.uf}`}
                type="number"
                step="0.01"
                value={estado.iss.issPorcentagem || ''}
                onChange={(e) => updateEstadoConfig(estado.uf, 'iss.issPorcentagem', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm pr-8"
              />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                  </div>
            </div>
            <div>
                  <Label htmlFor={`iss-iss-acima-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">R$</span>
                Acima de
              </Label>
                  <div className="relative">
              <Input
                id={`iss-iss-acima-${estado.uf}`}
                type="number"
                step="0.01"
                value={estado.iss.issAcima || ''}
                onChange={(e) => updateEstadoConfig(estado.uf, 'iss.issAcima', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm pr-8"
              />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
            </div>
                </div>
                {renderCheckbox(`iss-iss-retido-${estado.uf}`, 'ISS - Retido', estado.iss.issRetido || false, (checked) => updateEstadoConfig(estado.uf, 'iss.issRetido', checked), 'Retém ISS na fonte')}
              </div>
          </div>

          {/* PIS */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                <Calculator className="w-4 h-4 mr-2" />
                PIS
              </h4>
          <div className="space-y-3">
            <div>
                  <Label htmlFor={`iss-pis-porcentagem-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">%</span>
                Porcentagem
              </Label>
                  <div className="relative">
              <Input
                id={`iss-pis-porcentagem-${estado.uf}`}
                type="number"
                step="0.01"
                value={estado.iss.pisPorcentagem || ''}
                onChange={(e) => updateEstadoConfig(estado.uf, 'iss.pisPorcentagem', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm pr-8"
              />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                  </div>
            </div>
            <div>
                  <Label htmlFor={`iss-pis-acima-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">R$</span>
                Acima de
              </Label>
                  <div className="relative">
              <Input
                id={`iss-pis-acima-${estado.uf}`}
                type="number"
                step="0.01"
                value={estado.iss.pisAcima || ''}
                onChange={(e) => updateEstadoConfig(estado.uf, 'iss.pisAcima', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm pr-8"
              />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
            </div>
                </div>
                {renderCheckbox(`iss-pis-retido-${estado.uf}`, 'PIS - Retido', estado.iss.pisRetido || false, (checked) => updateEstadoConfig(estado.uf, 'iss.pisRetido', checked), 'Retém PIS na fonte')}
              </div>
          </div>

          {/* INSS */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-4 flex items-center">
                <Calculator className="w-4 h-4 mr-2" />
                INSS
              </h4>
          <div className="space-y-3">
            <div>
                  <Label htmlFor={`iss-inss-porcentagem-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">%</span>
                Porcentagem
              </Label>
                  <div className="relative">
              <Input
                id={`iss-inss-porcentagem-${estado.uf}`}
                type="number"
                step="0.01"
                value={estado.iss.inssPorcentagem || ''}
                onChange={(e) => updateEstadoConfig(estado.uf, 'iss.inssPorcentagem', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm pr-8"
              />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                  </div>
            </div>
            <div>
                  <Label htmlFor={`iss-inss-acima-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">R$</span>
                Acima de
              </Label>
                  <div className="relative">
              <Input
                id={`iss-inss-acima-${estado.uf}`}
                type="number"
                step="0.01"
                value={estado.iss.inssAcima || ''}
                onChange={(e) => updateEstadoConfig(estado.uf, 'iss.inssAcima', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm pr-8"
              />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
            </div>
                </div>
                {renderCheckbox(`iss-inss-retido-${estado.uf}`, 'INSS - Retido', estado.iss.inssRetido || false, (checked) => updateEstadoConfig(estado.uf, 'iss.inssRetido', checked), 'Retém INSS na fonte')}
              </div>
          </div>

          {/* IR */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-4 flex items-center">
                <Calculator className="w-4 h-4 mr-2" />
                IR
              </h4>
          <div className="space-y-3">
            <div>
                  <Label htmlFor={`iss-ir-porcentagem-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">%</span>
                Porcentagem
              </Label>
                  <div className="relative">
              <Input
                id={`iss-ir-porcentagem-${estado.uf}`}
                type="number"
                step="0.01"
                value={estado.iss.irPorcentagem || ''}
                onChange={(e) => updateEstadoConfig(estado.uf, 'iss.irPorcentagem', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white shadow-sm pr-8"
              />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                  </div>
            </div>
            <div>
                  <Label htmlFor={`iss-ir-acima-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">R$</span>
                Acima de
              </Label>
                  <div className="relative">
              <Input
                id={`iss-ir-acima-${estado.uf}`}
                type="number"
                step="0.01"
                value={estado.iss.irAcima || ''}
                onChange={(e) => updateEstadoConfig(estado.uf, 'iss.irAcima', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white shadow-sm pr-8"
              />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
            </div>
                </div>
                {renderCheckbox(`iss-ir-retido-${estado.uf}`, 'IR - Retido', estado.iss.irRetido || false, (checked) => updateEstadoConfig(estado.uf, 'iss.irRetido', checked), 'Retém IR na fonte')}
              </div>
          </div>

          {/* COFINS */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
              <h4 className="font-semibold text-indigo-800 mb-4 flex items-center">
                <Calculator className="w-4 h-4 mr-2" />
                COFINS
              </h4>
          <div className="space-y-3">
            <div>
                  <Label htmlFor={`iss-cofins-porcentagem-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">%</span>
                Porcentagem
              </Label>
                  <div className="relative">
              <Input
                id={`iss-cofins-porcentagem-${estado.uf}`}
                type="number"
                step="0.01"
                value={estado.iss.cofinsPorcentagem || ''}
                onChange={(e) => updateEstadoConfig(estado.uf, 'iss.cofinsPorcentagem', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm pr-8"
              />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                  </div>
            </div>
            <div>
                  <Label htmlFor={`iss-cofins-acima-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">R$</span>
                Acima de
              </Label>
                  <div className="relative">
              <Input
                id={`iss-cofins-acima-${estado.uf}`}
                type="number"
                step="0.01"
                value={estado.iss.cofinsAcima || ''}
                onChange={(e) => updateEstadoConfig(estado.uf, 'iss.cofinsAcima', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm pr-8"
              />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
            </div>
          </div>
                {renderCheckbox(`iss-cofins-retido-${estado.uf}`, 'COFINS - Retido', estado.iss.cofinsRetido || false, (checked) => updateEstadoConfig(estado.uf, 'iss.cofinsRetido', checked), 'Retém COFINS na fonte')}
        </div>
      </div>
    </div>
        </div>
      </div>

    </div>
  );

  const renderOutrosImpostosTab = () => (
    <div className="space-y-8">
      {/* Header com informações do estado */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Outras Configurações - {estado.nome}</h3>
              <p className="text-gray-600">Configure códigos de benefício fiscal e outras configurações específicas para este estado</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${estado.habilitado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium text-gray-600">
              {estado.habilitado ? 'Habilitado' : 'Desabilitado'}
            </span>
          </div>
        </div>
      </div>

      {/* Seção: Configurações Personalizadas */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configurações Personalizadas
          </h4>
        </div>
        <div className="p-6">
        <div className="space-y-6">
          <div>
              <Label htmlFor={`outros-impostos-cbenef-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <Settings className="w-4 h-4 mr-2 text-purple-600" />
                Código de Benefício Fiscal (CBENEF)
                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Opcional</span>
            </Label>
            <Input
              id={`outros-impostos-cbenef-${estado.uf}`}
              value={estado.outrosImpostos[0]?.nome || ''}
              onChange={(e) => {
                const novosOutros = [...estado.outrosImpostos];
                if (novosOutros.length === 0) {
                  novosOutros.push({ nome: e.target.value });
                } else {
                  novosOutros[0] = { ...novosOutros[0], nome: e.target.value };
                }
                updateEstadoConfig(estado.uf, 'outrosImpostos', novosOutros);
              }}
              placeholder="Digite o código CBENEF..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
              />
              <div className="mt-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800 font-medium mb-2">
                  <Settings className="w-4 h-4 inline mr-1" />
                  Sobre o CBENEF:
                </p>
                <p className="text-sm text-purple-700">
                  Código de Benefício Fiscal utilizado para identificar impostos específicos, 
                  isenções ou reduções de alíquotas aplicáveis a determinadas operações.
            </p>
          </div>
        </div>

            {/* Seção de Informações Adicionais */}
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-6 border border-gray-200">
              <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                Informações Adicionais
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
                  <Label htmlFor={`info-fisco-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 mr-2 text-purple-600" />
              Informações de Interesse do Fisco
            </Label>
            <textarea
              id={`info-fisco-${estado.uf}`}
                    value={estado.informacoesInteresseFisco || ''}
                    onChange={(e) => updateEstadoConfig(estado.uf, 'informacoesInteresseFisco', e.target.value)}
              placeholder="Digite as informações de interesse do fisco..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none h-24"
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                    spellCheck="false"
            />
            <p className="text-sm text-gray-600 mt-2">
              Informações que serão incluídas nos documentos fiscais para o fisco
            </p>
          </div>
          
          <div>
                  <Label htmlFor={`info-contribuinte-${estado.uf}`} className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 mr-2 text-purple-600" />
              Informações de Interesse do Contribuinte
            </Label>
            <textarea
              id={`info-contribuinte-${estado.uf}`}
                    value={estado.informacoesInteresseContribuinte || ''}
                    onChange={(e) => updateEstadoConfig(estado.uf, 'informacoesInteresseContribuinte', e.target.value)}
              placeholder="Digite as informações de interesse do contribuinte..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none h-24"
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                    spellCheck="false"
            />
            <p className="text-sm text-gray-600 mt-2">
              Informações que serão incluídas nos documentos fiscais para o contribuinte
            </p>
          </div>
        </div>
      </div>
          </div>
          </div>
        </div>

    </div>
  );


  const renderTabContent = () => {
    switch (activeTab) {
      case 'ICMS':
        return renderICMSTab();
      case 'ICMS_ST':
        return renderICMSSTTab();
      case 'ICMS_CONS_FINAL':
        return renderICMSConsFinalTab();
      case 'IPI':
        return renderIPITab();
      case 'PIS':
        return renderPISTab();
      case 'COFINS':
        return renderCOFINSTab();
      case 'ISS':
        return renderISSTab();
      case 'OUTROS_IMPOSTOS':
        return renderOutrosImpostosTab();
      default:
        return renderICMSTab();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Campos específicos do estado */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-purple-600" />
          Configurações Específicas do Estado
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CFOP */}
          <div>
            <Label htmlFor={`cfop-${estado.uf}`} className={labelStyles}>
              <FileText className="w-4 h-4 mr-2 text-purple-600" />
              CFOP
            </Label>
            <Input
              id={`cfop-${estado.uf}`}
              type="text"
              value={estado.cfop || ''}
              onChange={(e) => updateEstadoConfig(estado.uf, 'cfop', e.target.value)}
              placeholder="Ex: 1102"
              className={inputStyles}
            />
          </div>

          {/* Natureza de Operação */}
          <div>
            <Label htmlFor={`natureza-operacao-${estado.uf}`} className={labelStyles}>
              <FileText className="w-4 h-4 mr-2 text-purple-600" />
              Natureza de Operação
            </Label>
            <Input
              id={`natureza-operacao-${estado.uf}`}
              type="text"
              value={estado.naturezaOperacaoDescricao || ''}
              onChange={(e) => updateEstadoConfig(estado.uf, 'naturezaOperacaoDescricao', e.target.value)}
              placeholder="Ex: Venda de mercadoria"
              className={inputStyles}
            />
          </div>

          {/* Local Destino da Operação */}
          <div>
            <Label htmlFor={`local-destino-${estado.uf}`} className={labelStyles}>
              <FileText className="w-4 h-4 mr-2 text-purple-600" />
              Local Destino da Operação
            </Label>
            <select
              id={`local-destino-${estado.uf}`}
              value={estado.localDestinoOperacao || 'interna'}
              onChange={(e) => updateEstadoConfig(estado.uf, 'localDestinoOperacao', e.target.value)}
              className={selectStyles}
            >
              <option value="interna">Interna</option>
              <option value="interestadual">Interestadual</option>
              <option value="exterior">Exterior</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg transform scale-105`
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:shadow-md'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default EstadoImpostoTabs;
