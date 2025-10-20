# 🚛 IMPLEMENTAÇÃO - DADOS DO VEÍCULO NA TRANSPORTADORA

## ✅ **IMPLEMENTAÇÕES REALIZADAS**

### **1. Razão Social da Transportadora**

**Localização**: `src/app/vendas/novo/page.tsx` - Aba Transportadora

**Funcionalidade:**
- **Exibição**: Razão social da transportadora selecionada
- **Fonte**: Dados do cadastro (`transportadoraSelecionada.nomeRazaoSocial`)
- **Layout**: Destaque visual com fonte maior e negrito

**Código implementado:**
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Razão Social
  </label>
  <p className="text-lg font-semibold text-gray-900">
    {transportadoraSelecionada.nomeRazaoSocial}
  </p>
</div>
```

### **2. Dados do Veículo**

**Localização**: `src/app/vendas/novo/page.tsx` - Aba Transportadora

**Campos implementados:**
- **Placa do Veículo** (obrigatório)
- **UF da Placa** (obrigatório) - Dropdown com todos os estados
- **RNTC** (Registro Nacional de Transportador de Carga)

**Código implementado:**
```tsx
{/* Dados do Veículo */}
<div className="bg-green-50 p-6 rounded-lg border border-green-200">
  <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
    <Truck className="w-5 h-5" />
    Dados do Veículo
  </h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Placa do Veículo *
      </label>
      <input
        type="text"
        value={formData.placaVeiculo}
        onChange={(e) => handleInputChange('placaVeiculo', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="ABC-1234"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        UF da Placa *
      </label>
      <select
        value={formData.ufPlaca}
        onChange={(e) => handleInputChange('ufPlaca', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">Selecione</option>
        {/* Todos os estados brasileiros */}
      </select>
    </div>
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        RNTC (Registro Nacional de Transportador de Carga)
      </label>
      <input
        type="text"
        value={formData.rntc}
        onChange={(e) => handleInputChange('rntc', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Digite o RNTC"
      />
    </div>
  </div>
</div>
```

### **3. FormData Atualizado**

**Campos adicionados:**
```tsx
const [formData, setFormData] = useState({
  // ... outros campos
  // Dados do Veículo
  placaVeiculo: '',
  ufPlaca: '',
  rntc: '',
  // ... outros campos
});
```

### **4. Carregamento de Pedido para Edição**

**Campos adicionados no carregamento:**
```tsx
placaVeiculo: pedido.placaVeiculo || '',
ufPlaca: pedido.ufPlaca || '',
rntc: pedido.rntc || '',
```

### **5. Salvamento de Pedido**

**Campos adicionados no payload:**
```tsx
placaVeiculo: formData.placaVeiculo || '',
ufPlaca: formData.ufPlaca || '',
rntc: formData.rntc || '',
```

## 🎨 **DESIGN IMPLEMENTADO**

### **Layout da Aba Transportadora:**
1. **Transportadora Selecionada** (Roxo)
   - Razão Social (destaque)
   - CNPJ, IE, IM (se disponíveis)

2. **Dados do Veículo** (Verde)
   - Placa do Veículo (obrigatório)
   - UF da Placa (obrigatório)
   - RNTC (opcional)

3. **Endereço** (Azul)
   - Dados de endereço do cadastro

4. **Contato** (Verde)
   - Dados de contato do cadastro

5. **Observações**
   - Campo de texto livre

### **Características:**
- **Campos obrigatórios**: Marcados com `*`
- **Layout responsivo**: 1 coluna mobile, 2 colunas desktop
- **Validação**: Campos conectados com `formData`
- **Estados brasileiros**: Dropdown completo com todos os estados

## 🔧 **FUNCIONALIDADES**

### **Integração Completa:**
- **Seleção**: Transportadora selecionada na configuração
- **Exibição**: Dados do cadastro + campos editáveis do veículo
- **Persistência**: Dados salvos no backend
- **Edição**: Suporte para edição de pedidos existentes

### **Validações:**
- **Placa do Veículo**: Campo obrigatório
- **UF da Placa**: Campo obrigatório com validação de estado
- **RNTC**: Campo opcional

## 🎉 **RESULTADO FINAL**

**✅ Razão social da transportadora exibida na aba transportadora**
**✅ Campos de dados do veículo implementados (placa, UF, RNTC)**
**✅ Integração completa com formData e backend**
**✅ Suporte para edição de pedidos existentes**
**✅ Layout responsivo e intuitivo**

**A aba transportadora agora exibe a razão social da transportadora selecionada e permite o preenchimento dos dados do veículo necessários para NFe!**





