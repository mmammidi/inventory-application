import apiClient from './http';
import type { Category } from '../types/category';

const categoriesPath = import.meta.env.VITE_API_CATEGORIES_PATH || '/api/v1/categories';

function normalizeCategory(raw: any): Category {
  const statusString = typeof raw.status === 'string' ? String(raw.status).toLowerCase() : undefined;
  const booleanFromStatus = typeof raw.status === 'boolean' ? raw.status : (statusString ? statusString === 'active' : undefined);
  const booleanIsActive = typeof raw.isActive === 'boolean' ? raw.isActive : booleanFromStatus;
  return {
    id: String(raw.id ?? raw._id ?? ''),
    name: String(raw.name ?? ''),
    description: raw.description != null ? String(raw.description) : undefined,
    status: raw.status ?? raw.isActive ?? undefined,
    isActive: booleanIsActive
  };
}

function pickArray<T = unknown>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.items)) return payload.items as T[];
  if (Array.isArray(payload?.results)) return payload.results as T[];
  if (Array.isArray(payload?.data?.categories)) return payload.data.categories as T[];
  if (Array.isArray(payload?.data?.items)) return payload.data.items as T[];
  if (Array.isArray(payload?.data?.results)) return payload.data.results as T[];
  return [] as T[];
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<any>(categoriesPath);
  return pickArray<any>(data).map(normalizeCategory);
}

export async function getCategory(id: string): Promise<Category> {
  const { data } = await apiClient.get<any>(`${categoriesPath}/${id}`);
  const payload = data?.data ?? data?.category ?? data;
  return normalizeCategory(payload);
}

export async function createCategory(input: Pick<Category, 'name' | 'description' | 'status'>): Promise<Category> {
  const { data } = await apiClient.post<any>(categoriesPath, input);
  const payload = data?.data ?? data?.category ?? data;
  return normalizeCategory(payload);
}

export async function updateCategory(id: string, input: Pick<Category, 'name' | 'description' | 'status'>): Promise<Category> {
  const { data } = await apiClient.put<any>(`${categoriesPath}/${id}`, input);
  const payload = data?.data ?? data?.category ?? data;
  return normalizeCategory(payload);
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`${categoriesPath}/${id}`);
}

