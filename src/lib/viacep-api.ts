export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export async function consultarCep(cep: string): Promise<ViaCepResponse | null> {
  // Remove formatação do CEP (pontos, traços)
  const cleanCep = cep.replace(/\D/g, '');
  
  // Verifica se o CEP tem 8 dígitos
  if (cleanCep.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as ViaCepResponse;
    
    // Verifica se a API retornou erro
    if (data.erro) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao consultar CEP:', error);
    return null;
  }
}

export function formatCep(cep: string): string {
  const numbers = cep.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
}

