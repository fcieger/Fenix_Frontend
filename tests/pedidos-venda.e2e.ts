import axios from 'axios'
import { randomUUID } from 'crypto'
import { Client } from 'pg'

async function run() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3004'
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:fenix123@localhost:5432/fenix'
  const numeroPedidoAlvo = process.env.TEST_PEDIDO_NUMERO || 'PED-1761872221968'

  const http = axios.create({ baseURL: baseUrl, validateStatus: () => true })

  // 1) Localizar pedido existente por numeroPedido e carregar itens do banco
  const client = new Client({ connectionString: dbUrl })
  await client.connect()
  const pedidoRes = await client.query(
    'SELECT id, "dataEmissao" FROM pedidos_venda WHERE "numeroPedido" = $1 LIMIT 1',
    [numeroPedidoAlvo]
  )
  if (pedidoRes.rowCount === 0) {
    console.error('Pedido alvo não encontrado por numeroPedido:', numeroPedidoAlvo)
    await client.end()
    process.exit(1)
  }
  const pedidoId: string = pedidoRes.rows[0].id
  const itensRes = await client.query(
    'SELECT "produtoId", codigo, nome, "unidadeMedida", quantidade, "valorUnitario", "valorDesconto", "valorTotal", "naturezaOperacaoId", observacoes, "numeroItem" FROM pedidos_venda_itens WHERE "pedidoVendaId" = $1 ORDER BY "numeroItem" ASC',
    [pedidoId]
  )
  const itens = itensRes.rows.map((r: any) => ({
    produtoId: r.produtoId,
    codigo: r.codigo,
    nome: r.nome,
    unidadeMedida: r.unidadeMedida || 'UN',
    quantidade: Number(r.quantidade) || 0,
    valorUnitario: Number(r.valorUnitario) || 0,
    valorDesconto: Number(r.valorDesconto) || 0,
    valorTotal: Number(r.valorTotal) || 0,
    naturezaOperacaoId: r.naturezaOperacaoId || undefined,
    observacoes: r.observacoes || null,
    numeroItem: Number(r.numeroItem) || 1,
  }))
  await client.end()
  console.log('✔ Pedido encontrado:', pedidoId, 'itens:', itens.length)

  // 2) Editar o pedido mudando dataEmissao (PATCH /api/pedidos-venda/[id])
  const novaDataEmissao = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10) // ontem

  const patchPayload = {
    dataEmissao: novaDataEmissao,
    itens,
  }

  const patchRes = await http.patch(`/api/pedidos-venda/${pedidoId}`, patchPayload)
  if (patchRes.status !== 200 || !patchRes.data?.success) {
    console.error('Falha ao editar pedido:', patchRes.status, patchRes.data)
    process.exit(1)
  }
  console.log('✔ Pedido editado com nova data de emissão:', novaDataEmissao)

  // 3) Buscar e validar que a data foi atualizada (GET /api/pedidos-venda/[id])
  const getRes = await http.get(`/api/pedidos-venda/${pedidoId}`)
  if (getRes.status !== 200 || !getRes.data?.success) {
    console.error('Falha ao buscar pedido:', getRes.status, getRes.data)
    process.exit(1)
  }
  const fetched = getRes.data.data
  const fetchedDate = (fetched.dataEmissao || '').slice(0, 10)
  if (fetchedDate !== novaDataEmissao) {
    console.error('Data de emissão não foi atualizada. Esperado:', novaDataEmissao, 'Obtido:', fetchedDate)
    process.exit(1)
  }
  console.log('✔ Data de emissão validada:', fetchedDate)

  console.log('✅ Teste E2E de pedido de venda concluído com sucesso')
}

run().catch((e) => {
  console.error('Erro inesperado no teste E2E:', e)
  process.exit(1)
})


