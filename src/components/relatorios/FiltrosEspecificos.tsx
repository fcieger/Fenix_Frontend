'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { Users, Building2, Package, DollarSign, MapPin, Target, Wallet, CreditCard } from 'lucide-react';

interface FiltrosEspecificosProps {
  areaId: string;
  // Filtros - agora aceita arrays para múltipla seleção
  filtroCliente: string | string[];
  setFiltroCliente: (v: string | string[]) => void;
  filtroVendedor: string | string[];
  setFiltroVendedor: (v: string | string[]) => void;
  filtroProduto: string | string[];
  setFiltroProduto: (v: string | string[]) => void;
  filtroFornecedor: string | string[];
  setFiltroFornecedor: (v: string | string[]) => void;
  filtroFormaPagamento: string;
  setFiltroFormaPagamento: (v: string) => void;
  filtroCentroCusto: string;
  setFiltroCentroCusto: (v: string) => void;
  filtroContaBancaria: string;
  setFiltroContaBancaria: (v: string) => void;
  filtroLocalEstoque: string;
  setFiltroLocalEstoque: (v: string) => void;
  filtroCategoria: string;
  setFiltroCategoria: (v: string) => void;
  filtroStatus: string;
  setFiltroStatus: (v: string) => void;
  // Listas
  clientes: any[];
  vendedores: any[];
  produtos: any[];
  fornecedores: any[];
  formasPagamento: any[];
  centrosCusto: any[];
  contasBancarias: any[];
  locaisEstoque: any[];
}

export default function FiltrosEspecificos({
  areaId,
  filtroCliente,
  setFiltroCliente,
  filtroVendedor,
  setFiltroVendedor,
  filtroProduto,
  setFiltroProduto,
  filtroFornecedor,
  setFiltroFornecedor,
  filtroFormaPagamento,
  setFiltroFormaPagamento,
  filtroCentroCusto,
  setFiltroCentroCusto,
  filtroContaBancaria,
  setFiltroContaBancaria,
  filtroLocalEstoque,
  setFiltroLocalEstoque,
  filtroCategoria,
  setFiltroCategoria,
  filtroStatus,
  setFiltroStatus,
  clientes,
  vendedores,
  produtos,
  fornecedores,
  formasPagamento,
  centrosCusto,
  contasBancarias,
  locaisEstoque
}: FiltrosEspecificosProps) {

  const renderFiltrosVendas = () => {
    const listaClientes = Array.isArray(clientes) ? clientes : [];
    const listaVendedores = Array.isArray(vendedores) ? vendedores : [];
    
    const optionsClientes: MultiSelectOption[] = listaClientes.map(c => ({
      id: c.id,
      label: c.nomeRazaoSocial || c.nome || 'Cliente sem nome'
    }));
    
    const optionsVendedores: MultiSelectOption[] = listaVendedores.map(v => ({
      id: v.id,
      label: v.nomeRazaoSocial || v.nome || 'Vendedor sem nome'
    }));
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            Clientes
          </Label>
          <MultiSelect
            options={optionsClientes}
            selected={Array.isArray(filtroCliente) ? filtroCliente : (filtroCliente ? [filtroCliente] : [])}
            onChange={(selected) => setFiltroCliente(selected)}
            placeholder="Todos os clientes"
            emptyText="Nenhum cliente cadastrado"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            Vendedores
          </Label>
          <MultiSelect
            options={optionsVendedores}
            selected={Array.isArray(filtroVendedor) ? filtroVendedor : (filtroVendedor ? [filtroVendedor] : [])}
            onChange={(selected) => setFiltroVendedor(selected)}
            placeholder="Todos os vendedores"
            emptyText="Nenhum vendedor cadastrado"
          />
        </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Package className="h-4 w-4 text-green-600" />
          Status
        </Label>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="faturado">Faturado</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    );
  };

  const renderFiltrosCompras = () => {
    const listaFornecedores = Array.isArray(fornecedores) ? fornecedores : [];
    
    const optionsFornecedores: MultiSelectOption[] = listaFornecedores.map(f => ({
      id: f.id,
      label: f.nomeRazaoSocial || f.nome || 'Fornecedor sem nome'
    }));
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-teal-600" />
            Fornecedores
          </Label>
          <MultiSelect
            options={optionsFornecedores}
            selected={Array.isArray(filtroFornecedor) ? filtroFornecedor : (filtroFornecedor ? [filtroFornecedor] : [])}
            onChange={(selected) => setFiltroFornecedor(selected)}
            placeholder="Todos os fornecedores"
            emptyText="Nenhum fornecedor cadastrado"
          />
        </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Package className="h-4 w-4 text-green-600" />
          Status
        </Label>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
            <SelectItem value="faturado">Faturado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    );
  };

  const renderFiltrosFinanceiro = () => {
    const listaFormasPagamento = Array.isArray(formasPagamento) ? formasPagamento : [];
    const listaCentrosCusto = Array.isArray(centrosCusto) ? centrosCusto : [];
    const listaContasBancarias = Array.isArray(contasBancarias) ? contasBancarias : [];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-purple-600" />
            Forma de Pagamento
          </Label>
          <Select value={filtroFormaPagamento || 'todas'} onValueChange={(v) => setFiltroFormaPagamento(v === 'todas' ? '' : v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {listaFormasPagamento.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.descricao || f.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-600" />
            Centro de Custo
          </Label>
          <Select value={filtroCentroCusto || 'todos'} onValueChange={(v) => setFiltroCentroCusto(v === 'todos' ? '' : v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {listaCentrosCusto.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.descricao || c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-green-600" />
            Conta Bancária
          </Label>
          <Select value={filtroContaBancaria || 'todas'} onValueChange={(v) => setFiltroContaBancaria(v === 'todas' ? '' : v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {listaContasBancarias.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.descricao || c.banco_nome || 'Conta'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderFiltrosEstoque = () => {
    const listaProdutos = Array.isArray(produtos) ? produtos : [];
    const listaLocaisEstoque = Array.isArray(locaisEstoque) ? locaisEstoque : [];
    
    const optionsProdutos: MultiSelectOption[] = listaProdutos.map(p => ({
      id: p.id,
      label: p.codigo ? `${p.codigo} - ${p.nome}` : p.nome
    }));
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Package className="h-4 w-4 text-indigo-600" />
            Produtos
          </Label>
          <MultiSelect
            options={optionsProdutos}
            selected={Array.isArray(filtroProduto) ? filtroProduto : (filtroProduto ? [filtroProduto] : [])}
            onChange={(selected) => setFiltroProduto(selected)}
            placeholder="Todos os produtos"
            emptyText="Nenhum produto cadastrado"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-600" />
            Local de Estoque
          </Label>
          <Select value={filtroLocalEstoque || 'todos'} onValueChange={(v) => setFiltroLocalEstoque(v === 'todos' ? '' : v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os locais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os locais</SelectItem>
              {listaLocaisEstoque.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.descricao || l.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-purple-600" />
          Categoria
        </Label>
        <Select value={filtroCategoria || 'todas'} onValueChange={(v) => setFiltroCategoria(v === 'todas' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            <SelectItem value="materia-prima">Matéria Prima</SelectItem>
            <SelectItem value="produto-acabado">Produto Acabado</SelectItem>
            <SelectItem value="revenda">Revenda</SelectItem>
            <SelectItem value="consumo">Consumo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderFiltrosFiscal = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-red-600" />
          Status da NFe
        </Label>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="autorizada">Autorizada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
            <SelectItem value="denegada">Denegada</SelectItem>
            <SelectItem value="rejeitada">Rejeitada</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    );
  };

  const renderFiltrosFrenteCaixa = () => {
    const listaVendedores = Array.isArray(vendedores) ? vendedores : [];
    const listaFormasPagamento = Array.isArray(formasPagamento) ? formasPagamento : [];
    
    const optionsOperadores: MultiSelectOption[] = listaVendedores.map(v => ({
      id: v.id,
      label: v.nomeRazaoSocial || v.nome || 'Operador sem nome'
    }));
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-600" />
            Operadores
          </Label>
          <MultiSelect
            options={optionsOperadores}
            selected={Array.isArray(filtroVendedor) ? filtroVendedor : (filtroVendedor ? [filtroVendedor] : [])}
            onChange={(selected) => setFiltroVendedor(selected)}
            placeholder="Todos os operadores"
            emptyText="Nenhum operador cadastrado"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            Forma de Pagamento
          </Label>
          <Select value={filtroFormaPagamento || 'todas'} onValueChange={(v) => setFiltroFormaPagamento(v === 'todas' ? '' : v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {listaFormasPagamento.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.descricao || f.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderFiltrosGeral = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Package className="h-4 w-4 text-indigo-600" />
          Categoria
        </Label>
        <Select value={filtroCategoria || 'todas'} onValueChange={(v) => setFiltroCategoria(v === 'todas' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            <SelectItem value="materia-prima">Matéria Prima</SelectItem>
            <SelectItem value="produto-acabado">Produto Acabado</SelectItem>
            <SelectItem value="revenda">Revenda</SelectItem>
            <SelectItem value="consumo">Consumo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-pink-600" />
          Status
        </Label>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Renderizar filtros baseado na área
  switch (areaId) {
    case 'vendas':
      return renderFiltrosVendas();
    case 'compras':
      return renderFiltrosCompras();
    case 'financeiro':
      return renderFiltrosFinanceiro();
    case 'estoque':
      return renderFiltrosEstoque();
    case 'fiscal':
      return renderFiltrosFiscal();
    case 'frente-caixa':
      return renderFiltrosFrenteCaixa();
    case 'geral':
      return renderFiltrosGeral();
    default:
      return null;
  }
}

