/**
 * Purchase Order types - Re-exported from SDK
 * Use types from @/types/sdk instead of local types
 */

// Re-export SDK types
export type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderItemDto,
  PurchaseOrderInstallment,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  PurchaseOrderChangeStatusDto,
} from '@/types/sdk';

export { OrderStatus as PurchaseOrderStatus } from '@/types/sdk';

// Legacy exports for backward compatibility
export type StatusPedidoCompra = PurchaseOrderStatus;
export type PedidoCompraItem = PurchaseOrderItem;
export type PedidoCompra = PurchaseOrder;


