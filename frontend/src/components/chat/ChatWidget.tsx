import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSuggestions } from '../../hooks/useSuggestions';
import { useConversations } from '../../hooks/useChat';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Conversation, Message } from '../../types/chat';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import NewChatModal from './NewChatModal';

export default function ChatWidget() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { following } = useSuggestions();
  const { conversations, loading, reload, updateConversationWithMessage } = useConversations();

  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // controla a animação
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);

  // Abre com animação: primeiro monta (isOpen), depois anima (isVisible)
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleSelectConversation = useCallback((conv: Conversation) => {
    setActiveConversation(conv);
  }, []);

  const handleBack = useCallback(() => {
    setActiveConversation(null);
  }, []);

  const handleNewChatCreated = useCallback((conv: Conversation) => {
    setActiveConversation(conv);
    reload();
  }, [reload]);

  const handleNewMessage = useCallback((conversationId: number, message: Message) => {
    updateConversationWithMessage(conversationId, message);
  }, [updateConversationWithMessage]);

  if (!user) return null;

  return (
    <>
      {/* Barra fechada */}
      {!isOpen && (
        <div className="fixed bottom-0 right-6 z-50">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-t-[12px] px-4 py-2.5 shadow-sm hover:shadow transition-shadow"
          >
            {user.profile_picture ? (
              <img
                src={`data:image/png;base64,${user.profile_picture}`}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-medium text-xs">
                {(user.username ?? '?')[0].toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-sm text-[var(--text-primary)]">{t('messages')}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        </div>
      )}

      {/* Painel aberto com animação */}
      {isOpen && (
        <div
          className={`fixed bottom-0 right-6 z-50 w-[360px] h-[500px] bg-[var(--bg-card)] border border-[var(--border)] rounded-t-[12px] shadow-lg flex flex-col transition-all duration-200 ease-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
        {/* Header do widget */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-3">
            {user.profile_picture ? (
              <img
                src={`data:image/png;base64,${user.profile_picture}`}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-medium text-xs">
                {(user.username ?? '?')[0].toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-sm text-[var(--text-primary)]">{t('messages')}</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Nova conversa */}
            <button
              type="button"
              onClick={() => setShowNewChat(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-subtle)] transition-colors"
              title={t('newChat')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
            {/* Minimizar */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeConversation ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Botão voltar */}
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--primary)] hover:bg-[var(--bg-input)] transition-colors shrink-0 border-b border-[var(--border)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                {t('messages')}
              </button>
              <div className="flex-1 overflow-hidden">
                <ChatWindow
                  conversation={activeConversation}
                  currentUserId={user.id}
                  onNewMessage={handleNewMessage}
                />
              </div>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeId={null}
              onSelect={handleSelectConversation}
              onNewChat={() => setShowNewChat(true)}
              loading={loading}
            />
          )}
        </div>
      </div>
      )}

      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        onCreated={handleNewChatCreated}
        following={following}
      />
    </>
  );
}
