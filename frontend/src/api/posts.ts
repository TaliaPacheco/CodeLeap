import type { Post, PostCreatePayload, PostUpdatePayload } from '../types/post';
import type { PaginatedResponse } from '../types/api';
import client from './client';

export async function fetchPosts(params: {
  sort?: 'recent' | 'trending';
  author?: 'me';
  liked?: 'true';
  page?: number;
}): Promise<PaginatedResponse<Post>> {
  const { data } = await client.get<PaginatedResponse<Post>>('/posts/', { params });
  return data;
}

export async function fetchPost(id: number): Promise<Post> {
  const { data } = await client.get<Post>(`/posts/${id}/`);
  return data;
}

export async function createPost(payload: PostCreatePayload): Promise<Post> {
  const { data } = await client.post<Post>('/posts/', payload);
  return data;
}

export async function updatePost(id: number, payload: PostUpdatePayload): Promise<Post> {
  const { data } = await client.patch<Post>(`/posts/${id}/`, payload);
  return data;
}

export async function deletePost(id: number): Promise<void> {
  await client.delete(`/posts/${id}/`);
}

export async function likePost(id: number): Promise<void> {
  await client.post(`/posts/${id}/like/`);
}

export async function unlikePost(id: number): Promise<void> {
  await client.delete(`/posts/${id}/like/`);
}
