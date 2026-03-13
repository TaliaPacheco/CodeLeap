import { useLanguage } from '../../i18n/LanguageContext';
import type { Conversation } from '../../types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (conversation: Conversation) => void;
  onNewChat: () => void;
  loading: boolean;
}

export default function ConversationList({ conversations, activeId, onSelect, onNewChat: _onNewChat, loading }: ConversationListProps) {
  const { t } = useLanguage();

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#7494EC] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-[var(--text-placeholder)] text-center py-8">{t('noConversations')}</p>
        ) : (
          conversations.map(conv => {
            const isActive = conv.id === activeId;
            const other = conv.other_user;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isActive ? 'bg-[rgba(116,148,236,0.1)]' : 'hover:bg-[var(--bg-input)]'
                }`}
              >
                {other.profile_picture ? (
                  <img
                    src={`data:image/png;base64,${other.profile_picture}`}
                    alt={other.username}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#7494EC] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {other.username[0].toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[var(--text-primary)] truncate">{other.username}</span>
                    {conv.last_message && (
                      <span className="text-[10px] text-[var(--text-placeholder)] shrink-0 ml-2">
                        {timeAgo(conv.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {conv.last_message?.content ?? t('noMessages')}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="ml-2 w-5 h-5 bg-[#7494EC] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
