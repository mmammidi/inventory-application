import apiClient from './http';
import type { InventoryItem, InventoryItemInput } from '../types/inventory';

export async function listItems(): Promise<InventoryItem[]> {
  const { data } = await apiClient.get<InventoryItem[]>('/items');
  return data;
}

export async function getItem(id: string): Promise<InventoryItem> {
  const { data } = await apiClient.get<InventoryItem>(`/items/${id}`);
  return data;
}

export async function createItem(input: InventoryItemInput): Promise<InventoryItem> {
  const { data } = await apiClient.post<InventoryItem>('/items', input);
  return data;
}

export async function updateItem(id: string, input: InventoryItemInput): Promise<InventoryItem> {
  const { data } = await apiClient.put<InventoryItem>(`/items/${id}`, input);
  return data;
}

export async function deleteItem(id: string): Promise<void> {
  await apiClient.delete(`/items/${id}`);
}
