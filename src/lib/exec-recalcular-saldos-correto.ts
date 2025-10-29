import { recalcularSaldoAtualPorMovimentacoes } from './recalcular-saldos-correto';

async function main() {
  try {
    await recalcularSaldoAtualPorMovimentacoes();
    console.log('✅ Recálculo concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao recalcular saldos:', error);
    process.exit(1);
  }
}

main();

