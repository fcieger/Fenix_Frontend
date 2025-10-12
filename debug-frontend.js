// Script para debugar exatamente o que o frontend está enviando
const debugFrontend = async () => {
  try {
    console.log('=== DEBUG FRONTEND CADASTRO ===');
    
    // 1. Fazer login
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fenix.com', password: 'password' })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login OK');
    
    // 2. Simular dados exatos do frontend (com validação)
    const frontendData = {
      nomeRazaoSocial: 'Empresa Debug Teste',
      tipoPessoa: 'Pessoa Jurídica',
      cnpj: '12345678000195', // CNPJ válido
      tiposCliente: {
        cliente: true,
        vendedor: false,
        fornecedor: false,
        funcionario: false,
        transportadora: false,
        prestadorServico: false
      },
      email: 'debug@teste.com',
      telefoneComercial: '11999999999',
      optanteSimples: true,
      orgaoPublico: false,
      enderecos: [{
        tipo: 'Comercial',
        logradouro: 'Rua Debug',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234567',
        principal: true
      }],
      observacoes: 'Debug frontend',
      userId: loginData.user.id,
      companyId: loginData.user.companies[0].id
    };
    
    console.log('📤 Dados sendo enviados:');
    console.log(JSON.stringify(frontendData, null, 2));
    
    // 3. Enviar requisição
    const response = await fetch('http://localhost:3001/api/cadastros', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.access_token}`
      },
      body: JSON.stringify(frontendData)
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro:', errorText);
      
      // Tentar parsear como JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Erro JSON:', errorJson);
      } catch (e) {
        console.error('❌ Erro texto:', errorText);
      }
    } else {
      const result = await response.json();
      console.log('✅ Sucesso! ID:', result.id);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
};

debugFrontend();
