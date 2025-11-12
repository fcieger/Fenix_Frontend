import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccess } from '@/lib/auth-utils';
import { query, transaction } from '@/lib/database';
import { ensureCoreSchema } from '@/lib/migrations';
import { PNCPService } from '@/lib/pncp-api';

/**
 * POST /api/licitacoes/sincronizar
 * 
 * Sincroniza licitações de fontes externas (PNCP, ComprasGov)
 */
export async function POST(request: NextRequest) {
  try {
    await transaction(async (client) => {
      await ensureCoreSchema(client);
    });

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de autenticação necessário'
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    const body = await request.json();
    const { fonte = 'todas', companyId, uf } = body;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId é obrigatório' },
        { status: 400 }
      );
    }

    // Validar acesso
    const acesso = await validateUserAccess(token, companyId);
    if (!acesso.valid) {
      const statusCode = acesso.error?.includes('Token') || acesso.error?.includes('não fornecido') ? 401 : 403;
      return NextResponse.json(
        { 
          success: false, 
          error: acesso.error || 'Acesso negado'
        },
        { status: statusCode }
      );
    }

    console.log('📡 Sincronização solicitada:', { fonte, companyId, uf });

    let novos = 0;
    let atualizados = 0;
    let erros = 0;

    // Sincronizar com PNCP
    if (fonte === 'pncp' || fonte === 'todas') {
      try {
        console.log('🔄 Buscando licitações do PNCP...');
        
        const resultado = await PNCPService.buscarLicitacoes({
          uf,
          pagina: 1,
          tamanhoPagina: 50,
        });

        console.log(`📊 PNCP retornou ${resultado.data.length} licitações`);

        for (const licitacaoOriginal of resultado.data) {
          try {
            console.log('🔄 Processando licitação:', licitacaoOriginal.numeroControlePNCP || licitacaoOriginal.numero || 'S/N');
            
            // Detectar se é do PNCP ou Portal da Transparência
            const licitacao = licitacaoOriginal.numeroControlePNCP
              ? PNCPService.converterParaFormatoInterno(licitacaoOriginal, companyId)
              : PNCPService.converterPortalTransparenciaParaInterno(licitacaoOriginal, companyId);
            
            console.log('✅ Convertida:', {
              numeroProcesso: licitacao.numeroProcesso,
              titulo: licitacao.titulo?.substring(0, 50) || 'Sem título',
              fonte: licitacao.fonte,
            });

            // Verificar se já existe
            const existe = await query(
              `SELECT id FROM licitacoes WHERE "numeroProcesso" = $1 AND "companyId" = $2`,
              [licitacao.numeroProcesso, companyId]
            );

            if (existe.rows.length > 0) {
              // Atualizar
              console.log('⚠️ Licitação já existe, atualizando...');
              await query(
                `UPDATE licitacoes SET
                  titulo = $1,
                  descricao = $2,
                  orgao = $3,
                  "valorEstimado" = $4,
                  status = $5,
                  "dataLimite" = $6,
                  "updatedAt" = NOW()
                WHERE "numeroProcesso" = $7 AND "companyId" = $8`,
                [
                  licitacao.titulo,
                  licitacao.descricao,
                  licitacao.orgao,
                  licitacao.valorEstimado,
                  licitacao.status,
                  licitacao.dataLimite,
                  licitacao.numeroProcesso,
                  companyId,
                ]
              );
              atualizados++;
              console.log('✅ Atualizada');
            } else {
              // Inserir nova
              console.log('📝 Inserindo nova licitação...');
              await query(
                `INSERT INTO licitacoes (
                  "companyId", "numeroProcesso", titulo, descricao, orgao, "orgaoSigla",
                  modalidade, esfera, estado, municipio, "valorEstimado",
                  "dataAbertura", "dataLimite", status, "linkEdital", "linkSistema", fonte
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
                [
                  licitacao.companyId,
                  licitacao.numeroProcesso,
                  licitacao.titulo,
                  licitacao.descricao,
                  licitacao.orgao,
                  licitacao.orgaoSigla,
                  licitacao.modalidade,
                  licitacao.esfera,
                  licitacao.estado,
                  licitacao.municipio,
                  licitacao.valorEstimado,
                  licitacao.dataAbertura,
                  licitacao.dataLimite,
                  licitacao.status,
                  licitacao.linkEdital,
                  licitacao.linkSistema,
                  licitacao.fonte,
                ]
              );
              novos++;
              console.log('✅ Inserida com sucesso');
            }
          } catch (itemError: any) {
            console.error('❌ Erro ao processar licitação:', {
              erro: itemError.message,
              stack: itemError.stack,
              dados: licitacaoPNCP,
            });
            erros++;
          }
        }

        console.log(`✅ PNCP: ${novos} novas, ${atualizados} atualizadas, ${erros} erros`);
      } catch (pncpError: any) {
        console.error('Erro ao sincronizar com PNCP:', pncpError.message);
        erros++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sincronização concluída`,
      novos,
      atualizados,
      erros,
      fonte: fonte === 'todas' ? ['PNCP'] : [fonte.toUpperCase()],
    });
  } catch (error: any) {
    console.error('Erro ao sincronizar licitações:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao sincronizar licitações' },
      { status: 500 }
    );
  }
}

