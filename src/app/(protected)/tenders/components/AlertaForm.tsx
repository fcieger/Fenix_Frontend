'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertaLicitacao } from '@/services/tenders-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bell,
  MapPin,
  FileText,
  DollarSign,
  Tag,
  Mail,
  Smartphone,
  Clock,
  Calendar,
  Zap,
  CheckCircle2,
  Settings,
  Filter
} from 'lucide-react';

interface AlertaFormProps {
  alerta: AlertaLicitacao | null;
  onSalvar: (alerta: AlertaLicitacao) => void;
  onCancelar: () => void;
}

export function AlertaForm({ alerta, onSalvar, onCancelar }: AlertaFormProps) {
  const [formData, setFormData] = useState<AlertaLicitacao>({
    nome: alerta?.nome || '',
    ativo: alerta?.ativo ?? true,
    estados: alerta?.estados || [],
    municipios: alerta?.municipios || [],
    modalidades: alerta?.modalidades || [],
    valorMinimo: alerta?.valorMinimo,
    valorMaximo: alerta?.valorMaximo,
    cnae: alerta?.cnae || [],
    palavrasChave: alerta?.palavrasChave || [],
    apenasAbertas: alerta?.apenasAbertas ?? true,
    diasAntesEncerramento: alerta?.diasAntesEncerramento,
    notificarEmail: alerta?.notificarEmail ?? true,
    notificarPush: alerta?.notificarPush ?? false,
    frequencia: alerta?.frequencia || 'diaria',
    horarioNotificacao: alerta?.horarioNotificacao || '09:00',
  });

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const modalidades = [
    'Pregão Eletrônico',
    'Pregão Presencial',
    'Concorrência',
    'Tomada de Preços',
    'Convite',
    'Dispensa de Licitação',
    'Inexigibilidade',
  ];

  const handleChange = (campo: string, valor: any) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleArrayToggle = (campo: string, valor: string) => {
    const array = formData[campo as keyof AlertaLicitacao] as string[] || [];
    const newArray = array.includes(valor)
      ? array.filter(item => item !== valor)
      : [...array, valor];
    handleChange(campo, newArray);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            Informações Básicas
          </CardTitle>
          <CardDescription>
            Configure o nome e status do alerta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Alerta *</Label>
            <Input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              required
              placeholder="Ex: Licitações de Material de Escritório em SP"
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Critérios de Filtro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-600" />
            Critérios de Filtro
          </CardTitle>
          <CardDescription>
            Defina os critérios para receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estados */}
          <div>
            <Label className="mb-3 block">Estados</Label>
            <div className="grid grid-cols-7 gap-2">
              {estados.map(uf => (
                <Button
                  key={uf}
                  type="button"
                  variant={formData.estados?.includes(uf) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleArrayToggle('estados', uf)}
                  className={formData.estados?.includes(uf) 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : ''}
                >
                  {uf}
                </Button>
              ))}
            </div>
          </div>

          {/* Modalidades */}
          <div>
            <Label className="mb-3 block">Modalidades</Label>
            <div className="grid grid-cols-2 gap-2">
              {modalidades.map(mod => (
                <label 
                  key={mod} 
                  className={`flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                    formData.modalidades?.includes(mod) ? 'border-orange-500 bg-orange-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.modalidades?.includes(mod)}
                    onChange={() => handleArrayToggle('modalidades', mod)}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span className="text-sm font-medium">{mod}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Valores */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valorMinimo">Valor Mínimo</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="valorMinimo"
                  type="number"
                  value={formData.valorMinimo || ''}
                  onChange={(e) => handleChange('valorMinimo', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0,00"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="valorMaximo">Valor Máximo</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="valorMaximo"
                  type="number"
                  value={formData.valorMaximo || ''}
                  onChange={(e) => handleChange('valorMaximo', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="999.999,99"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Palavras-chave */}
          <div>
            <Label htmlFor="palavrasChave" className="mb-2 block">
              Palavras-chave
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              Separe as palavras por vírgula
            </p>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="palavrasChave"
                type="text"
                value={formData.palavrasChave?.join(', ') || ''}
                onChange={(e) => handleChange('palavrasChave', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="Ex: material, escritório, caneta"
                className="pl-10"
              />
            </div>
            {formData.palavrasChave && formData.palavrasChave.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.palavrasChave.map((palavra, i) => (
                  <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-md">
                    {palavra}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-600" />
            Configurações de Notificação
          </CardTitle>
          <CardDescription>
            Configure como e quando receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Apenas Abertas */}
          <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              id="apenasAbertas"
              checked={formData.apenasAbertas}
              onChange={(e) => handleChange('apenasAbertas', e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded"
            />
            <Label htmlFor="apenasAbertas" className="cursor-pointer flex-1">
              Apenas licitações abertas
            </Label>
            <CheckCircle2 className="w-4 h-4 text-gray-400" />
          </div>

          {/* Canais de Notificação */}
          <div>
            <Label className="mb-3 block">Canais de Notificação</Label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.notificarEmail ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.notificarEmail}
                  onChange={(e) => handleChange('notificarEmail', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Email</span>
              </label>
              <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.notificarPush ? 'border-purple-500 bg-purple-50' : 'hover:bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.notificarPush}
                  onChange={(e) => handleChange('notificarPush', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <Smartphone className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Push</span>
              </label>
            </div>
          </div>

          {/* Frequência */}
          <div>
            <Label htmlFor="frequencia" className="mb-2 block">
              Frequência de Notificações
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                id="frequencia"
                value={formData.frequencia}
                onChange={(e) => handleChange('frequencia', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="tempo_real">
                  ⚡ Tempo Real
                </option>
                <option value="diaria">
                  📅 Diária
                </option>
                <option value="semanal">
                  📆 Semanal
                </option>
              </select>
            </div>
          </div>

          {/* Horário */}
          {formData.frequencia !== 'tempo_real' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Label htmlFor="horarioNotificacao" className="mb-2 block">
                Horário de Notificação
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="horarioNotificacao"
                  type="time"
                  value={formData.horarioNotificacao}
                  onChange={(e) => handleChange('horarioNotificacao', e.target.value)}
                  className="pl-10"
                />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-orange-600 hover:bg-orange-700"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Salvar Alerta
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancelar}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
