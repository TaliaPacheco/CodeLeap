import type { Comment } from '../types/comment';
import client from './client';

export async function fetchComments(postId: number): Promise<Comment[]> {
  const { data } = await client.get<Comment[]>(`/posts/${postId}/comments/`);
  return data;
}

export async function createComment(postId: number, content: string): Promise<Comment> {
  const { data } = await client.post<Comment>(`/posts/${postId}/comments/`, { content });
  return data;
}

export async function updateComment(commentId: number, content: string): Promise<Comment> {
  const { data } = await client.patch<Comment>(`/posts/comments/${commentId}/`, { content });
  return data;
}

export async function deleteComment(commentId: number): Promise<void> {
  await client.delete(`/posts/comments/${commentId}/`);
}
