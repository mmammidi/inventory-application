export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface InventoryItemInput {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}
