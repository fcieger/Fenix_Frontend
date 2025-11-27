/**
 * Pedido Venda types - Re-exported from SDK
 * Use types from @/types/sdk instead of local types
 */

// Re-export SDK types
export type {
  SalesOrder as PedidoVenda,
  SalesOrderItem as PedidoVendaItem,
} from '@/types/sdk';

export { OrderStatus } from '@/types/sdk';
export type StatusPedidoVenda = OrderStatus;

