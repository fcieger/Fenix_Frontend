/**
 * Sales Order types - Re-exported from SDK
 * Use types from @/types/sdk instead of local types
 */

import type {
  SalesOrderStatus as SdkSalesOrderStatus,
  SalesOrderItem as SdkSalesOrderItem,
  SalesOrder as SdkSalesOrder,
} from '@/types/sdk';

// Re-export SDK types
export type {
  SalesOrder,
  SalesOrderItem,
  SalesOrderItemDto,
  SalesOrderInstallment,
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
} from '@/types/sdk';

export { OrderStatus as SalesOrderStatus } from '@/types/sdk';

// Legacy exports for backward compatibility
export type StatusPedidoVenda = SdkSalesOrderStatus;
export type PedidoVendaItem = SdkSalesOrderItem;
export type PedidoVenda = SdkSalesOrder;
