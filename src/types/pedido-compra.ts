/**
 * Pedido Compra types - Re-exported from SDK
 * Use types from @/types/sdk instead of local types
 */

// Re-export SDK types
export type {
  PurchaseOrder as PedidoCompra,
  PurchaseOrderItem as PedidoCompraItem,
} from '@/types/sdk';

export { OrderStatus } from '@/types/sdk';
export type StatusPedidoCompra = OrderStatus;






