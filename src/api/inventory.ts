import apiClient from './http';
import type { InventoryItem, InventoryItemInput } from '../types/inventory';

const itemsPath = import.meta.env.VITE_API_ITEMS_PATH || '/api/v1/items';

function normalizeItem(raw: any): InventoryItem {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    name: String(raw.name ?? ''),
    sku: String(raw.sku ?? ''),
    quantity: Number(raw.quantity ?? 0),
    price: Number(raw.price ?? 0),
    cost: raw.cost != null ? Number(raw.cost) : undefined,
    minQuantity: raw.minQuantity != null ? Number(raw.minQuantity) : undefined,
    unit: raw.unit != null ? String(raw.unit) : undefined,
    categoryId: raw.categoryId ? String(raw.categoryId) : (raw.category?.id ? String(raw.category.id) : undefined),
    supplierId: raw.supplierId ? String(raw.supplierId) : (raw.supplier?.id ? String(raw.supplier.id) : undefined)
  };
}

function pickArray<T = unknown>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  // Common wrappers
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.items)) return payload.items as T[];
  if (Array.isArray(payload?.results)) return payload.results as T[];
  // Nested under data
  if (Array.isArray(payload?.data?.items)) return payload.data.items as T[];
  if (Array.isArray(payload?.data?.results)) return payload.data.results as T[];
  if (Array.isArray(payload?.data?.users)) return payload.data.users as T[];
  if (Array.isArray(payload?.data?.categories)) return payload.data.categories as T[];
  if (Array.isArray(payload?.data?.suppliers)) return payload.data.suppliers as T[];
  if (Array.isArray(payload?.data?.movements)) return payload.data.movements as T[];
  return [] as T[];
}

export async function listItems(): Promise<InventoryItem[]> {
  const { data } = await apiClient.get<any>(itemsPath);
  const arr = pickArray<any>(data).map(normalizeItem);
  return arr;
}

export async function getItem(id: string): Promise<InventoryItem> {
  const { data } = await apiClient.get<any>(`${itemsPath}/${id}`);
  const payload = (data && typeof data === 'object' && !Array.isArray(data)) ? (data.data ?? data.item ?? data.result ?? data) : data;
  return normalizeItem(payload);
}

export async function createItem(input: InventoryItemInput): Promise<InventoryItem> {
  const { data } = await apiClient.post<any>(itemsPath, input);
  const payload = data?.data ?? data?.item ?? data;
  return normalizeItem(payload);
}

export async function updateItem(id: string, input: InventoryItemInput): Promise<InventoryItem> {
  const { data } = await apiClient.put<any>(`${itemsPath}/${id}`, input);
  const payload = data?.data ?? data?.item ?? data;
  return normalizeItem(payload);
}

export async function deleteItem(id: string): Promise<void> {
  await apiClient.delete(`${itemsPath}/${id}`);
}
