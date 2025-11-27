/**
 * Sales Order types - Re-exported from SDK
 * Use types from @/types/sdk instead of local types
 */

// Re-export SDK types
export type {
  SalesOrder,
  SalesOrderItem,
  SalesOrderItemDto,
  SalesOrderInstallment,
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  SalesOrderChangeStatusDto,
} from '@/types/sdk';

export { OrderStatus as SalesOrderStatus } from '@/types/sdk';

// Legacy exports for backward compatibility
export type StatusPedidoVenda = SalesOrderStatus;
export type PedidoVendaItem = SalesOrderItem;
export type PedidoVenda = SalesOrder;


