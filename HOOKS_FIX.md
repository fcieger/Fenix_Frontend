# Correção do Erro de Hooks do React

## 🚨 Problema
Erro: "React has detected a change in the order of Hooks called by NovoClientePage"

## 🔍 Causa
Violação das "Rules of Hooks" do React:
- Hooks sendo chamados **depois** de returns condicionais
- Ordem dos hooks mudando entre renders
- `useState` do `formData` estava após `if (authLoading)` e `if (!isAuthenticated)`

## 🔧 Solução Implementada

### 1. **Reordenação dos Hooks**
```typescript
// ❌ ANTES (INCORRETO)
export default function NovoClientePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading, activeCompanyId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  // ... outros hooks
  
  if (authLoading) {
    return <LoadingComponent />; // ❌ Return condicional
  }
  
  if (!isAuthenticated) {
    return null; // ❌ Return condicional
  }
  
  const [formData, setFormData] = useState({...}); // ❌ Hook após return
  const [outroHook, setOutroHook] = useState(); // ❌ Hook após return
}

// ✅ DEPOIS (CORRETO)
export default function NovoClientePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading, activeCompanyId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  // ... todos os hooks primeiro
  const [formData, setFormData] = useState({...}); // ✅ Todos os hooks no topo
  const [outroHook, setOutroHook] = useState(); // ✅ Todos os hooks no topo
  
  useEffect(() => {
    // ... lógica
  }, [dependencies]);
  
  // Returns condicionais APÓS todos os hooks
  if (authLoading) {
    return <LoadingComponent />;
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  // Resto do componente
}
```

### 2. **Regras dos Hooks Seguidas**
- ✅ **Sempre no topo**: Todos os hooks antes de qualquer return
- ✅ **Mesma ordem**: Hooks sempre na mesma ordem em cada render
- ✅ **Nunca condicionais**: Hooks nunca dentro de if/for/while
- ✅ **Sempre no mesmo nível**: Hooks sempre no nível raiz da função

## 📁 Arquivo Modificado
- `src/app/cadastros/novo/page.tsx` - Reordenação dos hooks

## 🎯 Resultado
- ✅ Erro de hooks eliminado
- ✅ Componente funciona corretamente
- ✅ Performance mantida
- ✅ Funcionalidade preservada

## 🔍 Como Verificar
1. Abra o console do navegador
2. Acesse `/cadastros/novo`
3. Não deve aparecer mais o erro de hooks
4. A página deve carregar normalmente

## 📚 Referência
- [Rules of Hooks - React Docs](https://react.dev/link/rules-of-hooks)
- [Hooks at a Glance - React Docs](https://react.dev/docs/hooks-overview.html)
