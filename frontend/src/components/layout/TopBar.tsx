import { useState, useRef, useEffect } from 'react';
import type { Notification } from '../../types/notification';
import { useLanguage } from '../../i18n/LanguageContext';
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
    <header className="fixed top-0 w-full bg-white border-b border-[#E2E8F0] h-14 px-6 lg:px-10 flex items-center justify-between z-50">
      {/* Left side: Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#7494EC] rounded-[6px] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <span className="text-[#0F172A] font-bold">CodeLeap</span>
        <span className="text-[#7494EC] font-bold">Network</span>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        {/* Language toggle */}
        <div className="flex items-center bg-[#F1F5F9] rounded-full p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-full transition-colors ${language === 'en' ? 'bg-white text-[#7494EC] shadow-sm' : 'text-[#64748B] hover:text-[#475569]'}`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('pt')}
            className={`px-2.5 py-1 rounded-full transition-colors ${language === 'pt' ? 'bg-white text-[#7494EC] shadow-sm' : 'text-[#64748B] hover:text-[#475569]'}`}
          >
            PT
          </button>
        </div>

        {/* Bell notification icon */}
        <div className="relative" ref={dropdownRef}>
          <button type="button" onClick={handleBellClick} className="p-1 relative cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showDropdown && (
            <div className="absolute right-0 top-10 w-[340px] bg-white border border-[#E2E8F0] rounded-[12px] shadow-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9]">
                <span className="font-semibold text-sm text-[#0F172A]">{t('notifications')}</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-xs font-semibold text-[#7494EC] hover:underline cursor-pointer"
                  >
                    {t('markAllAsRead')}
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[360px] overflow-y-auto">
                {notificationsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-[#7494EC] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="text-sm text-[#94A3B8] text-center py-6">{t('noNotifications')}</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-[#F8FAFC] last:border-b-0 ${!n.is_read ? 'bg-[rgba(116,148,236,0.05)]' : ''}`}
                    >
                      <Avatar base64={n.actor.profile_picture} username={n.actor.username} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0F172A]">
                          <span className="font-semibold">@{n.actor.username}</span>{' '}
                          <span className="text-[#475569]">{notifMessage(n)}</span>
                        </p>
                        <TimeAgo date={n.created_at} className="text-xs text-[#94A3B8]" />
                      </div>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#7494EC] shrink-0 mt-1.5" />
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
          className="flex items-center gap-2 text-[#475569] hover:text-[#7494EC] font-semibold text-sm transition-colors"
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
          className="flex items-center gap-2 text-[#7494EC] font-semibold text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7494EC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
