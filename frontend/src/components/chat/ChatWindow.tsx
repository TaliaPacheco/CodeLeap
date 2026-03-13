import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useChat } from '../../hooks/useChat';
import type { Conversation, Message } from '../../types/chat';
import ChatBubble from './ChatBubble';

interface ChatWindowProps {
  conversation: Conversation | null;
  currentUserId: number;
  onNewMessage?: (conversationId: number, message: Message) => void;
}

export default function ChatWindow({ conversation, currentUserId, onNewMessage }: ChatWindowProps) {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);

  const { messages, loading, hasMore, loadMore, sendMessage, isConnected } = useChat(
    conversation?.id ?? null
  );

  // Scroll para baixo quando chega mensagem nova
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  // Notifica conversa sobre nova mensagem
  useEffect(() => {
    if (messages.length > 0 && conversation) {
      const lastMsg = messages[messages.length - 1];
      onNewMessage?.(conversation.id, lastMsg);
    }
  }, [messages.length, conversation, onNewMessage]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-input)]">
        <div className="text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-sm text-[var(--text-placeholder)]">{t('selectConversation')}</p>
        </div>
      </div>
    );
  }

  const other = conversation.other_user;

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-input)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-[var(--bg-card)] border-b border-[var(--border)]">
        {other.profile_picture ? (
          <img
            src={`data:image/png;base64,${other.profile_picture}`}
            alt={other.username}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#7494EC] flex items-center justify-center text-white font-bold text-sm">
            {other.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-sm text-[var(--text-primary)]">{other.username}</p>
          <p className="text-[11px] text-[var(--text-placeholder)]">{other.role_title || '@' + other.username}</p>
        </div>
        {isConnected && (
          <span className="ml-auto w-2 h-2 bg-[#22C55E] rounded-full" title="Connected" />
        )}
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {hasMore && (
          <button
            type="button"
            onClick={loadMore}
            className="block mx-auto text-xs text-[#7494EC] hover:underline mb-2"
          >
            {t('loadMore')}
          </button>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#7494EC] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-[var(--text-placeholder)] text-center py-8">{t('noMessages')}</p>
        ) : (
          messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} isOwn={msg.sender.id === currentUserId} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 py-3 bg-[var(--bg-card)] border-t border-[var(--border)]">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t('typeMessage')}
          className="flex-1 h-10 px-4 rounded-full border border-[var(--border)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none focus:border-[#7494EC] focus:ring-1 focus:ring-[#7494EC] transition-colors"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-10 h-10 bg-[#7494EC] text-white rounded-full flex items-center justify-center hover:bg-[#6384DC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
