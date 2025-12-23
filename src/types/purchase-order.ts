/**
 * Purchase Order types - Re-exported from SDK
 * Use types from @/types/sdk instead of local types
 */

import type {
  OrderStatus as SdkOrderStatus,
  PurchaseOrderItem as SdkPurchaseOrderItem,
  PurchaseOrder as SdkPurchaseOrder,
} from '@/types/sdk';

// Re-export SDK types
export type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderItemDto,
  PurchaseOrderInstallment,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from '@/types/sdk';

export type PurchaseOrderStatus = SdkOrderStatus;
export { OrderStatus } from '@/types/sdk';

// Legacy exports for backward compatibility
export type StatusPedidoCompra = PurchaseOrderStatus;
export type PedidoCompraItem = SdkPurchaseOrderItem;
export type PedidoCompra = SdkPurchaseOrder;
