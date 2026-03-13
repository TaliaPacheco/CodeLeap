import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketReturn {
  sendMessage: (data: Record<string, unknown>) => void;
  lastMessage: Record<string, unknown> | null;
  isConnected: boolean;
}

export function useWebSocket(url: string | null): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retryCount = useRef(0);
  const [lastMessage, setLastMessage] = useState<Record<string, unknown> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      retryCount.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        setLastMessage(JSON.parse(event.data));
      } catch { /* ignore invalid JSON */ }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Reconexão com backoff: 1s, 2s, 4s... max 10s
      const delay = Math.min(1000 * 2 ** retryCount.current, 10000);
      retryCount.current += 1;
      reconnectTimer.current = setTimeout(connect, delay);
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { sendMessage, lastMessage, isConnected };
}
