import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { createConversation } from '../../api/chat';
import type { Conversation } from '../../types/chat';
import type { User } from '../../types/user';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (conversation: Conversation) => void;
  following: User[];
}

export default function NewChatModal({ isOpen, onClose, onCreated, following }: NewChatModalProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const filtered = following.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSelect(username: string) {
    setLoading(true);
    try {
      const conversation = await createConversation(username);
      onCreated(conversation);
      onClose();
    } catch { /* ignore */ }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-[var(--bg-card)] rounded-[12px] w-full max-w-[400px] border border-[var(--border)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="font-bold text-base text-[var(--text-primary)]">{t('newChat')}</h3>
          <button type="button" onClick={onClose} className="text-[var(--text-placeholder)] hover:text-[var(--text-muted)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('searchUser')}
            className="w-full h-10 px-4 rounded-[8px] border border-[var(--border)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-[var(--text-placeholder)] text-center py-6">{t('noResults')}</p>
          ) : (
            filtered.map(user => (
              <button
                key={user.id}
                type="button"
                disabled={loading}
                onClick={() => handleSelect(user.username)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-input)] transition-colors disabled:opacity-50"
              >
                {user.profile_picture ? (
                  <img
                    src={`data:image/png;base64,${user.profile_picture}`}
                    alt={user.username}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-medium text-sm">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <p className="font-semibold text-sm text-[var(--text-primary)]">{user.username}</p>
                  {user.role_title && (
                    <p className="text-xs text-[var(--text-muted)]">{user.role_title}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
