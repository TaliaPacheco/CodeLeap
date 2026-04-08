import type { User, UserUpdatePayload } from '../types/user';
import client from './client';

export async function fetchMe(): Promise<User> {
  const { data } = await client.get<User>('/users/me/');
  return data;
}

export async function updateMe(payload: UserUpdatePayload): Promise<User> {
  const { data } = await client.patch<User>('/users/me/', payload);
  return data;
}

export async function fetchUserProfile(username: string): Promise<User> {
  const { data } = await client.get<User>(`/users/${username}/`);
  return data;
}

export async function fetchSuggestions(limit = 10, offset = 0): Promise<{ results: User[]; total: number }> {
  const { data } = await client.get<{ results: User[]; total: number }>('/users/suggestions/', {
    params: { limit, offset },
  });
  return data;
}

export async function fetchFollowing(): Promise<User[]> {
  const { data } = await client.get<User[]>('/users/following/');
  return data;
}

export async function followUser(username: string): Promise<void> {
  await client.post(`/users/${username}/follow/`);
}

export async function unfollowUser(username: string): Promise<void> {
  await client.delete(`/users/${username}/follow/`);
}
