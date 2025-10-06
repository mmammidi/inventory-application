import apiClient from './http';
import type { Movement, MovementInput } from '../types/movement';

const movementsPath = import.meta.env.VITE_API_MOVEMENTS_PATH || '/api/v1/movements';

function normalizeMovement(raw: any): Movement {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    movementType: String(raw.type ?? raw.movementType ?? raw.movement_type ?? ''),
    quantity: Number(raw.quantity ?? 0),
    reasonText: raw.reason ?? raw.reasonText ?? raw.reason_text ?? undefined,
    referenceText: raw.reference ?? raw.referenceText ?? raw.reference_text ?? undefined,
    notes: raw.notes ?? undefined,
    itemId: raw.itemId ?? raw.item_id ?? (raw.item?.id ? String(raw.item.id) : undefined),
    userId: raw.userId ?? raw.user_id ?? (raw.user?.id ? String(raw.user.id) : undefined),
    item: raw.item ? {
      id: String(raw.item.id ?? ''),
      name: String(raw.item.name ?? ''),
      sku: String(raw.item.sku ?? '')
    } : undefined,
    user: raw.user ? {
      id: String(raw.user.id ?? ''),
      name: String(`${raw.user.firstName || ''} ${raw.user.lastName || ''}`.trim() || raw.user.username || '')
    } : undefined
  };
}

function pickArray<T = unknown>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.items)) return payload.items as T[];
  if (Array.isArray(payload?.results)) return payload.results as T[];
  if (Array.isArray(payload?.data?.movements)) return payload.data.movements as T[];
  if (Array.isArray(payload?.data?.items)) return payload.data.items as T[];
  if (Array.isArray(payload?.data?.results)) return payload.data.results as T[];
  if (Array.isArray(payload?.data?.users)) return payload.data.users as T[];
  if (Array.isArray(payload?.data?.categories)) return payload.data.categories as T[];
  if (Array.isArray(payload?.data?.suppliers)) return payload.data.suppliers as T[];
  return [] as T[];
}

export async function listMovements(): Promise<Movement[]> {
  const { data } = await apiClient.get<any>(movementsPath);
  return pickArray<any>(data).map(normalizeMovement);
}

export async function getMovement(id: string): Promise<Movement> {
  const { data } = await apiClient.get<any>(`${movementsPath}/${id}`);
  const payload = data?.data ?? data?.movement ?? data;
  return normalizeMovement(payload);
}

export async function createMovement(input: MovementInput): Promise<Movement> {
  const { data } = await apiClient.post<any>(movementsPath, input);
  const payload = data?.data ?? data?.movement ?? data;
  return normalizeMovement(payload);
}

export async function updateMovement(id: string, input: MovementInput): Promise<Movement> {
  const { data } = await apiClient.put<any>(`${movementsPath}/${id}`, input);
  const payload = data?.data ?? data?.movement ?? data;
  return normalizeMovement(payload);
}

export async function deleteMovement(id: string): Promise<void> {
  await apiClient.delete(`${movementsPath}/${id}`);
}
