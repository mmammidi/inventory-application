export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  cost?: number;
  minQuantity?: number;
  unit?: string;
  categoryId?: string;
  supplierId?: string;
}

export interface InventoryItemInput {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  cost: number;
  minQuantity: number;
  unit: string;
  categoryId: string;
  supplierId: string;
}
