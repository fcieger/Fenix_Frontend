import { recalcularTodosSaldos } from './recalcular-saldos';

async function main() {
  try {
    await recalcularTodosSaldos();
    console.log('✅ Recálculo concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao recalcular saldos:', error);
    process.exit(1);
  }
}

main();

