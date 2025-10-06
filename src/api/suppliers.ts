import apiClient from './http';
import type { Supplier } from '../types/supplier';

const suppliersPath = import.meta.env.VITE_API_SUPPLIERS_PATH || '/api/v1/suppliers';

function normalizeSupplier(raw: any): Supplier {
  const contact = raw.contact || {};
  const addressObj = raw.address && typeof raw.address === 'object' ? raw.address : undefined;

  const addressParts: string[] = [];
  const push = (v?: any) => { if (v != null && String(v).trim()) addressParts.push(String(v).trim()); };
  if (addressObj) {
    push(addressObj.line1 || addressObj.addressLine1 || addressObj.street);
    push(addressObj.line2 || addressObj.addressLine2);
    push(addressObj.city);
    push(addressObj.state || addressObj.region || addressObj.province);
    push(addressObj.postalCode || addressObj.zip);
    push(addressObj.country);
  }

  const composedAddress = addressParts.length ? addressParts.join(', ') : (typeof raw.address === 'string' ? raw.address : undefined);

  return {
    id: String(raw.id ?? raw._id ?? ''),
    name: String(raw.name ?? ''),
    contactName: raw.contactName ?? raw.contact_name ?? contact.name ?? contact.fullName ?? undefined,
    email: raw.email ?? raw.emailAddress ?? contact.email ?? undefined,
    phone: raw.phone ?? raw.phoneNumber ?? contact.phone ?? contact.phoneNumber ?? undefined,
    address: composedAddress,
    isActive: typeof raw.isActive === 'boolean'
      ? raw.isActive
      : (typeof raw.status === 'boolean'
        ? raw.status
        : (typeof raw.status === 'string' ? String(raw.status).toLowerCase() === 'active' : undefined))
  };
}

function pickArray<T = unknown>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.items)) return payload.items as T[];
  if (Array.isArray(payload?.results)) return payload.results as T[];
  if (Array.isArray(payload?.data?.suppliers)) return payload.data.suppliers as T[];
  if (Array.isArray(payload?.data?.items)) return payload.data.items as T[];
  if (Array.isArray(payload?.data?.results)) return payload.data.results as T[];
  return [] as T[];
}

export async function listSuppliers(): Promise<Supplier[]> {
  const { data } = await apiClient.get<any>(suppliersPath);
  return pickArray<any>(data).map(normalizeSupplier);
}

export async function getSupplier(id: string): Promise<Supplier> {
  const { data } = await apiClient.get<any>(`${suppliersPath}/${id}`);
  const payload = data?.data ?? data?.supplier ?? data;
  return normalizeSupplier(payload);
}

export async function createSupplier(input: { name: string; contactName?: string; email?: string; phone?: string; address?: string }): Promise<Supplier> {
  const { data } = await apiClient.post<any>(suppliersPath, input);
  const payload = data?.data ?? data?.supplier ?? data;
  return normalizeSupplier(payload);
}

export async function updateSupplier(id: string, input: { name: string; contactName?: string; email?: string; phone?: string; address?: string }): Promise<Supplier> {
  const { data } = await apiClient.put<any>(`${suppliersPath}/${id}`, input);
  const payload = data?.data ?? data?.supplier ?? data;
  return normalizeSupplier(payload);
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiClient.delete(`${suppliersPath}/${id}`);
}

