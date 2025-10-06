import apiClient from './http';
import type { User, UserInput } from '../types/user';

const usersPath = import.meta.env.VITE_API_USERS_PATH || '/api/v1/users';

function normalizeUser(raw: any): User {
  console.log('Raw user data from API:', raw); // Debug log
  
  // Try to extract firstname and lastname from various possible field names
  let firstname = '';
  let lastname = '';
  
  // Check for various possible field names
  if (raw.firstname) firstname = String(raw.firstname);
  else if (raw.first_name) firstname = String(raw.first_name);
  else if (raw.firstName) firstname = String(raw.firstName);
  else if (raw.name) {
    // If there's a single name field, try to split it
    const nameParts = String(raw.name).split(' ');
    firstname = nameParts[0] || '';
    lastname = nameParts.slice(1).join(' ') || '';
  }
  
  if (raw.lastname) lastname = String(raw.lastname);
  else if (raw.last_name) lastname = String(raw.last_name);
  else if (raw.lastName) lastname = String(raw.lastName);
  
  const normalized = {
    id: String(raw.id ?? raw._id ?? ''),
    firstname,
    lastname,
    email: raw.email ? String(raw.email) : undefined,
    username: raw.username ? String(raw.username) : undefined
  };
  console.log('Normalized user data:', normalized); // Debug log
  return normalized;
}

function pickArray<T = unknown>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.users)) return payload.users as T[];
  if (Array.isArray(payload?.results)) return payload.results as T[];
  if (Array.isArray(payload?.data?.users)) return payload.data.users as T[];
  if (Array.isArray(payload?.data?.results)) return payload.data.results as T[];
  return [] as T[];
}

export async function listUsers(): Promise<User[]> {
  const { data } = await apiClient.get<any>(usersPath);
  console.log('Full API response for users:', data); // Debug log
  const usersArray = pickArray<any>(data);
  console.log('Picked users array:', usersArray); // Debug log
  return usersArray.map(normalizeUser);
}

export async function getUser(id: string): Promise<User> {
  const { data } = await apiClient.get<any>(`${usersPath}/${id}`);
  const payload = data?.data ?? data?.user ?? data;
  return normalizeUser(payload);
}

export async function createUser(input: any): Promise<User> {
  const { data } = await apiClient.post<any>(usersPath, input);
  const payload = data?.data ?? data?.user ?? data;
  return normalizeUser(payload);
}

export async function updateUser(id: string, input: any): Promise<User> {
  const { data } = await apiClient.put<any>(`${usersPath}/${id}`, input);
  const payload = data?.data ?? data?.user ?? data;
  return normalizeUser(payload);
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`${usersPath}/${id}`);
}
