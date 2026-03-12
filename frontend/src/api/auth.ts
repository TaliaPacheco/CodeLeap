import type { AuthTokens, RegisterPayload, LoginPayload } from '../types/auth';
import client, { setTokens, clearTokens, getRefreshToken } from './client';

export async function register(payload: RegisterPayload): Promise<AuthTokens> {
  const { data } = await client.post<AuthTokens>('/auth/register/', payload);
  setTokens(data.access, data.refresh);
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const { data } = await client.post<AuthTokens>('/auth/login/', payload);
  setTokens(data.access, data.refresh);
  return data;
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  try {
    if (refresh) await client.post('/auth/logout/', { refresh });
  } finally {
    clearTokens();
  }
}
