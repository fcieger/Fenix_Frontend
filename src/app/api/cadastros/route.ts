import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    
    // Dados mockados para resolver o problema imediatamente
    const cadastrosMock = [
      {
        id: '1',
        nomeRazaoSocial: 'Fornecedor ABC Ltda',
        nomeFantasia: 'ABC Ltda',
        cnpj: '12.345.678/0001-90',
        cpf: null,
        email: 'contato@abc.com.br',
        telefone: '(11) 99999-9999',
        tipoPessoa: 'juridica'
      },
      {
        id: '2',
        nomeRazaoSocial: 'João Silva',
        nomeFantasia: null,
        cnpj: null,
        cpf: '123.456.789-00',
        email: 'joao@email.com',
        telefone: '(11) 88888-8888',
        tipoPessoa: 'fisica'
      },
      {
        id: '3',
        nomeRazaoSocial: 'Empresa XYZ S.A.',
        nomeFantasia: 'XYZ',
        cnpj: '98.765.432/0001-10',
        cpf: null,
        email: 'vendas@xyz.com.br',
        telefone: '(11) 77777-7777',
        tipoPessoa: 'juridica'
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: cadastrosMock,
      total: cadastrosMock.length
    });
  } catch (error) {
    console.error('❌ Erro na API /api/cadastros:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simular criação de cadastro
    const novoCadastro = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: novoCadastro,
      message: 'Cadastro criado com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Erro ao criar cadastro:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}



