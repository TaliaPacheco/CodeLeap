import type { User } from '../../types/user';
import Avatar from '../shared/Avatar';
import { useLanguage } from '../../i18n/LanguageContext';

interface RightSidebarProps {
  suggestions: User[];
  following: User[];
  onFollow: (username: string) => void;
  onUnfollow: (username: string) => void;
  loading?: boolean;
  loadingFollowing?: boolean;
}

export default function RightSidebar({ suggestions, following, onFollow, onUnfollow, loading, loadingFollowing }: RightSidebarProps) {
  const { t } = useLanguage();

  return (
    <div className="sticky top-[72px] w-full space-y-4">
      {/* Who to follow */}
      {(loading || suggestions.length > 0) && (
        <div className="bg-[var(--bg-card)] rounded-[12px] border border-[var(--border)] p-4">
          <h3 className="font-semibold text-sm text-[var(--text-primary)]">{t('whoToFollow')}</h3>

          {loading ? (
            <div className="mt-3 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-[var(--bg-subtle)]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-20 bg-[var(--bg-subtle)] rounded" />
                    <div className="h-2.5 w-14 bg-[var(--bg-subtle)] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {suggestions.map((user) => (
                <li key={user.id} className="flex items-center gap-3">
                  <Avatar base64={user.profile_picture} username={user.username} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">@{user.username}</p>
                    <p className="text-xs text-[var(--text-muted)]">{user.role_title || t('popular')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFollow(user.username)}
                    className="text-[var(--primary)] font-medium text-sm hover:underline shrink-0 cursor-pointer"
                  >
                    {t('follow')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Following */}
      {(loadingFollowing || following.length > 0) && (
        <div className="bg-[var(--bg-card)] rounded-[12px] border border-[var(--border)] p-4">
          <h3 className="font-semibold text-sm text-[var(--text-primary)]">{t('following')}</h3>

          {loadingFollowing ? (
            <div className="mt-3 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-[var(--bg-subtle)]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-20 bg-[var(--bg-subtle)] rounded" />
                    <div className="h-2.5 w-14 bg-[var(--bg-subtle)] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {following.map((user) => (
                <li key={user.id} className="flex items-center gap-3">
                  <Avatar base64={user.profile_picture} username={user.username} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">@{user.username}</p>
                    <p className="text-xs text-[var(--text-muted)]">{user.role_title || ''}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUnfollow(user.username)}
                    className="text-[var(--text-placeholder)] font-medium text-sm hover:text-[var(--danger)] hover:underline shrink-0 transition-colors duration-150 cursor-pointer"
                  >
                    {t('unfollow')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* CodeLeap Premium */}
      <div className="bg-[var(--primary-subtle)] rounded-[12px] p-4 border border-[var(--primary-muted)]">
        <h3 className="font-semibold text-sm text-[var(--primary)]">{t('codeleapPremium')}</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1">{t('premiumDescription')}</p>
        <button
          type="button"
          className="mt-3 w-full bg-[var(--primary)] text-white text-sm font-medium py-2.5 rounded-[8px] hover:bg-[var(--primary-hover)] transition-colors duration-150 cursor-pointer"
        >
          {t('learnMore')}
        </button>
      </div>

      {/* Footer links */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-placeholder)]">
          <span>{t('termsOfServiceFooter')}</span>
          <span>{t('privacyPolicyFooter')}</span>
          <span>{t('cookiePolicy')}</span>
          <span>{t('accessibility')}</span>
        </div>
        <p className="text-xs text-[var(--text-placeholder)] mt-2">&copy; 2024 CodeLeap</p>
      </div>
    </div>
  );
}
