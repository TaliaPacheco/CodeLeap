import { useState, useEffect, useCallback } from 'react';
import { getAccessToken } from '../api/client';
import * as chatApi from '../api/chat';
import { useWebSocket } from './useWebSocket';
import type { Message, Conversation } from '../types/chat';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await chatApi.fetchConversations();
      setConversations(data.results ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateConversationWithMessage = useCallback((conversationId: number, message: Message) => {
    setConversations(prev => {
      const updated = prev.map(c =>
        c.id === conversationId
          ? { ...c, last_message: message, updated_at: message.created_at }
          : c
      );
      return updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    });
  }, []);

  return { conversations, loading, reload: load, updateConversationWithMessage };
}

export function useChat(conversationId: number | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState(2);

  const token = getAccessToken();
  const wsBase = import.meta.env.VITE_WS_URL
    || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
  const wsUrl = conversationId && token
    ? `${wsBase}/ws/chat/${conversationId}/?token=${token}`
    : null;

  const { sendMessage: wsSend, lastMessage, isConnected } = useWebSocket(wsUrl);

  // Carrega histórico
  useEffect(() => {
    if (!conversationId) return;
    setMessages([]);
    setLoading(true);
    chatApi.fetchMessages(conversationId, 1).then(data => {
      setMessages((data.results ?? []).reverse()); // API retorna desc, invertemos para asc
      setHasMore(data.next !== null);
      setNextPage(2);
      setLoading(false);
    }).catch(() => setLoading(false));

    chatApi.markAsRead(conversationId).catch(() => {});
  }, [conversationId]);

  // Recebe mensagem via WebSocket
  useEffect(() => {
    if (!lastMessage || !lastMessage.id) return;
    const msg = lastMessage as unknown as Message;
    setMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, [lastMessage]);

  const loadMore = useCallback(async () => {
    if (!conversationId || !hasMore) return;
    const data = await chatApi.fetchMessages(conversationId, nextPage);
    setMessages(prev => [...data.results.reverse(), ...prev]);
    setHasMore(data.next !== null);
    setNextPage(p => p + 1);
  }, [conversationId, hasMore, nextPage]);

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    wsSend({ content: content.trim() });
  }, [wsSend]);

  return { messages, loading, hasMore, loadMore, sendMessage, isConnected };
}
