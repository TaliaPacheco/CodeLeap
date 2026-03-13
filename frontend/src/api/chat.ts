import client from './client';
import type { Conversation, Message } from '../types/chat';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function fetchConversations(): Promise<PaginatedResponse<Conversation>> {
  const { data } = await client.get<PaginatedResponse<Conversation>>('/chat/conversations/');
  return data;
}

export async function createConversation(username: string): Promise<Conversation> {
  const { data } = await client.post<Conversation>('/chat/conversations/', { username });
  return data;
}

export async function fetchMessages(conversationId: number, page = 1): Promise<PaginatedResponse<Message>> {
  const { data } = await client.get<PaginatedResponse<Message>>(
    `/chat/conversations/${conversationId}/messages/`,
    { params: { page } },
  );
  return data;
}

export async function markAsRead(conversationId: number): Promise<void> {
  await client.post(`/chat/conversations/${conversationId}/read/`);
}
