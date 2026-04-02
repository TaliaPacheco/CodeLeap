import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSuggestions } from '../hooks/useSuggestions';
import { useConversations } from '../hooks/useChat';
import { useNotifications } from '../hooks/useNotifications';
import type { Conversation, Message } from '../types/chat';
import TopBar from '../components/layout/TopBar';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import NewChatModal from '../components/chat/NewChatModal';
import EditProfileModal from '../components/modals/EditProfileModal';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const { following } = useSuggestions();
  const { conversations, loading, reload, updateConversationWithMessage } = useConversations();
  const { notifications, unreadCount, loading: notifLoading, loadNotifications, markAllAsRead } = useNotifications();

  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleSelectConversation = useCallback((conv: Conversation) => {
    setActiveConversation(conv);
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
    <div className="min-h-screen bg-[#F6F6F8]">
      <TopBar
        onLogout={logout}
        onEditProfile={() => setShowEditProfile(true)}
        notifications={notifications}
        unreadCount={unreadCount}
        onOpenNotifications={loadNotifications}
        onMarkAllRead={markAllAsRead}
        notificationsLoading={notifLoading}
      />

      <div className="flex max-w-[1200px] mx-auto pt-[72px] h-[calc(100vh-0px)]">
        {/* Conversation list */}
        <div className={`w-full md:w-[320px] shrink-0 bg-white border-r border-[#E2E8F0] ${activeConversation ? 'hidden md:block' : 'block'}`}>
          <ConversationList
            conversations={conversations}
            activeId={activeConversation?.id ?? null}
            onSelect={handleSelectConversation}
            onNewChat={() => setShowNewChat(true)}
            loading={loading}
          />
        </div>

        {/* Chat window */}
        <div className={`flex-1 min-w-0 ${activeConversation ? 'block' : 'hidden md:block'}`}>
          <ChatWindow
            conversation={activeConversation}
            currentUserId={user.id}
            onNewMessage={handleNewMessage}
            onBack={() => setActiveConversation(null)}
          />
        </div>
      </div>

      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        onCreated={handleNewChatCreated}
        following={following}
      />

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
    </div>
  );
}
