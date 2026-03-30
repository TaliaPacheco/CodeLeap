import { useState, useRef, useEffect } from 'react';
import type { Notification } from '../../types/notification';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../shared/Avatar';
import TimeAgo from '../shared/TimeAgo';

interface TopBarProps {
  onLogout: () => void;
  onEditProfile: () => void;
  notifications: Notification[];
  unreadCount: number;
  onOpenNotifications: () => void;
  onMarkAllRead: () => void;
  notificationsLoading?: boolean;
}

export default function TopBar({ onLogout, onEditProfile, notifications, unreadCount, onOpenNotifications, onMarkAllRead, notificationsLoading }: TopBarProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function handleBellClick() {
    if (!showDropdown) onOpenNotifications();
    setShowDropdown(!showDropdown);
  }

  // Close on outside click
  useEffect(() => {
    if (!showDropdown) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  function notifMessage(n: Notification): string {
    if (n.notification_type === 'follow') return t('notifFollow');
    if (n.notification_type === 'like') return t('notifLike');
    return t('notifComment');
  }

  return (
    <header className="fixed top-0 w-full bg-[var(--bg-card)]/95 backdrop-blur-sm border-b border-[var(--border)] h-14 px-6 lg:px-10 flex items-center justify-between z-50">
      {/* Left side: Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[var(--primary)] rounded-[8px] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <span className="text-[var(--text-primary)] font-bold">CodeLeap</span>
        <span className="text-[var(--primary)] font-bold">Network</span>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        {/* Language toggle */}
        <div className="flex items-center bg-[var(--bg-subtle)] rounded-full p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-full transition-colors ${language === 'en' ? 'bg-[var(--bg-card)] text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('pt')}
            className={`px-2.5 py-1 rounded-full transition-colors ${language === 'pt' ? 'bg-[var(--bg-card)] text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
          >
            PT
          </button>
        </div>

        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-full hover:bg-[var(--bg-subtle)] transition-colors"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Bell notification icon */}
        <div className="relative" ref={dropdownRef}>
          <button type="button" onClick={handleBellClick} className="p-1 relative cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--danger)] text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showDropdown && (
            <div className="absolute right-0 top-10 w-[340px] bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-light)]">
                <span className="font-semibold text-sm text-[var(--text-primary)]">{t('notifications')}</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-xs font-semibold text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    {t('markAllAsRead')}
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[360px] overflow-y-auto">
                {notificationsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="text-sm text-[var(--text-placeholder)] text-center py-6">{t('noNotifications')}</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-[var(--bg-input)] last:border-b-0 ${!n.is_read ? 'bg-[var(--primary-subtle)]' : ''}`}
                    >
                      <Avatar base64={n.actor.profile_picture} username={n.actor.username} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--text-primary)]">
                          <span className="font-semibold">@{n.actor.username}</span>{' '}
                          <span className="text-[var(--text-secondary)]">{notifMessage(n)}</span>
                        </p>
                        <TimeAgo date={n.created_at} className="text-xs text-[var(--text-placeholder)]" />
                      </div>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile button */}
        <button
          type="button"
          onClick={onEditProfile}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] font-semibold text-sm transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {t('profile')}
        </button>

        {/* Logout button */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 text-[var(--primary)] font-semibold text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {t('logout')}
        </button>
      </div>
    </header>
  );
}
