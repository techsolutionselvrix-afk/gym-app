import { supabase } from './supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function api<T = unknown>(
  path: string,
  init: Omit<RequestInit, 'body'> & { body?: unknown } = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError(0, 'EXPO_PUBLIC_API_BASE_URL is not set', null);
  }
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(await authHeader()),
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (data as any)?.error?.message ||
      (data as any)?.detail ||
      res.statusText ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

// --- Typed helpers (extend as endpoints grow) ---

export const Api = {
  me: () => api<Profile>('/me'),
  updateMe: (patch: Partial<Profile>) => api<Profile>('/me', { method: 'PATCH', body: patch }),
  listGyms: () => api<Gym[]>('/gyms'),
  listPlans: (gymId?: string) =>
    api<Plan[]>(`/plans${gymId ? `?gym_id=${encodeURIComponent(gymId)}` : ''}`),
  checkIn: (gym_id: string) =>
    api<Attendance>('/attendance/check-in', { method: 'POST', body: { gym_id, method: 'qr' } }),
  myAttendance: () => api<Attendance[]>('/attendance/me'),
};

export type Role = 'member' | 'admin' | 'super_admin';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface Profile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  gender?: Gender | null;
  role: Role;
  gym_id?: string | null;
}

export interface Gym {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logo_url?: string | null;
  status: 'active' | 'suspended' | 'trial';
}

export interface Plan {
  id: string;
  gym_id: string;
  name: string;
  price_cents: number;
  currency: string;
  duration_days: number;
  active: boolean;
}

export interface Attendance {
  id: string;
  gym_id: string;
  member_id: string;
  checked_in_at: string;
  checked_out_at?: string | null;
  method: 'qr' | 'manual' | 'biometric';
}
