/**
 * Products Service - Re-export for backward compatibility
 *
 * This file re-exports from the new service structure to maintain
 * compatibility with existing imports.
 *
 * New code should import from: @/services/products/products-service
 *
 * @deprecated Use @/services/products/products-service instead
 */
export {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listarProdutos,
  obterProduto,
  criarProduto,
  atualizarProduto,
  excluirProduto,
} from './products/products-service';


