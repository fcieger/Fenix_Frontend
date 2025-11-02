import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { ensureCoreSchema } from '@/lib/migrations'
import { validateUUID } from '@/utils/validations'

let pool: Pool | null = null
function getPool(): Pool {
  if (!pool) {
    // Priorizar DATABASE_URL se disponível (para produção/Vercel)
    if (process.env.DATABASE_URL) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      })
    } else {
      // Fallback para desenvolvimento local
      pool = new Pool({
        connectionString: 'postgresql://postgres:fenix123@localhost:5432/fenix',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      })
    }
  }
  return pool
}

export async function POST(request: NextRequest) {
  const client = await getPool().connect()
  try {
    await ensureCoreSchema(client)
    const body = await request.json()
    console.log('[API Entregar] Body recebido:', JSON.stringify(body, null, 2))
    const {
      pedidoId,
      companyId,
      localEstoqueId,
      naturezaOperacao, // objeto ou { movimentaEstoque: boolean }
      itens = [], // [{ produtoId, quantidade }]
      status,
    } = body || {}
    
    console.log('[API Entregar] Parâmetros:', { pedidoId, companyId, localEstoqueId, status, itensCount: itens?.length || 0 })

    if (!validateUUID(companyId)) return NextResponse.json({ success: false, error: 'companyId inválido' }, { status: 400 })
    if (!validateUUID(localEstoqueId)) return NextResponse.json({ success: false, error: 'localEstoqueId inválido' }, { status: 400 })
    if (!pedidoId || !validateUUID(pedidoId)) return NextResponse.json({ success: false, error: 'pedidoId inválido' }, { status: 400 })

    const movimenta = naturezaOperacao?.movimentaEstoque === true || naturezaOperacao?.movimenta_estoque === true
    console.log('[API Entregar] Natureza movimenta estoque?', movimenta, naturezaOperacao)
    if (!movimenta) {
      return NextResponse.json({ success: true, data: { message: 'Natureza não movimenta estoque' } })
    }
    // Verificar se status é "entregue" ou 3
    const isEntregue = status === 'entregue' || Number(status) === 3
    console.log('[API Entregar] Status é entregue?', isEntregue, status)
    if (!isEntregue) {
      return NextResponse.json({ success: true, data: { message: 'Pedido não está ENTREGUE; sem movimentação' } })
    }

    // Evitar duplicidade
    const dup = await client.query('SELECT 1 FROM estoque_movimentos WHERE origem = $1 AND "origemId" = $2 LIMIT 1', ['pedido_compra', pedidoId])
    console.log('[API Entregar] Verificando duplicidade. Já existe?', dup.rowCount > 0)
    if (dup.rowCount > 0) {
      return NextResponse.json({ success: true, data: { message: 'Movimentos já lançados' } })
    }

    await client.query('BEGIN')
    try {
      let itensProcessados = 0
      for (const it of itens) {
        const produtoId = it?.produtoId
        const qtd = Number(it?.quantidade || it?.qtd || 0)
        console.log('[API Entregar] Processando item:', { produtoId, qtd, it })
        if (!validateUUID(produtoId) || !qtd || qtd <= 0) {
          console.log('[API Entregar] Item ignorado - inválido:', { produtoId, qtd })
          continue
        }
        
        // Verificar se o produto existe
        const produtoRes = await client.query(
          'SELECT id FROM produtos WHERE id = $1 AND "companyId" = $2',
          [produtoId, companyId]
        )
        console.log('[API Entregar] Produto encontrado?', produtoRes.rows.length > 0)
        
        if (produtoRes.rows.length === 0) {
          console.warn('[API Entregar] Produto não encontrado:', produtoId)
          continue
        }
        
        // Usar 0 para custo (não buscar preço de custo)
        const custoUnitario = 0
        const custoTotal = 0
        
        // Inserir movimento de saída no estoque (kardex)
        await client.query(
          `INSERT INTO estoque_movimentos ("produtoId","localOrigemId","localDestinoId",tipo,qtd,"custoUnitario","custoTotal",origem,"origemId","dataMov","companyId")
           VALUES ($1,$2,$3,'entrada',$4,$5,$6,'pedido_compra',$7, now(), $8)`,
          [produtoId, localEstoqueId, null, qtd, custoUnitario, custoTotal, pedidoId, companyId]
        )
        itensProcessados++
        console.log('[API Entregar] Item processado com sucesso:', produtoId)
        
        // O trigger trg_estoque_movimentos_update_saldo irá atualizar automaticamente o saldo na tabela estoque_saldos
      }
      await client.query('COMMIT')
      console.log('[API Entregar] Transação commitada. Itens processados:', itensProcessados)
      return NextResponse.json({ success: true, message: `Movimentos de estoque lançados com sucesso (${itensProcessados} itens). Saldos atualizados automaticamente.` })
    } catch (innerError: any) {
      console.error('[API Entregar] Erro interno:', innerError)
      console.error('[API Entregar] Stack interno:', innerError?.stack)
      await client.query('ROLLBACK').catch(() => {})
      throw innerError
    }
  } catch (e: any) {
    console.error('[API Entregar] Erro:', e)
    console.error('[API Entregar] Stack:', e?.stack)
    console.error('[API Entregar] Erro completo:', JSON.stringify(e, Object.getOwnPropertyNames(e)))
    const errorMessage = e?.message || e?.toString() || 'Erro interno'
    const errorDetails = process.env.NODE_ENV === 'development' ? e?.stack : undefined
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: errorDetails 
    }, { status: 500 })
  } finally {
    client.release()
  }
}



