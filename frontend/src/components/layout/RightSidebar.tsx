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
        <div className="bg-white rounded-[12px] border border-[rgba(116,148,236,0.1)] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-4">
          <h3 className="font-semibold text-sm text-[#0F172A]">{t('whoToFollow')}</h3>

          {loading ? (
            <div className="mt-3 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-[#F1F5F9]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-20 bg-[#F1F5F9] rounded" />
                    <div className="h-2.5 w-14 bg-[#F1F5F9] rounded" />
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
                    <p className="font-semibold text-sm text-[#0F172A] truncate">@{user.username}</p>
                    <p className="text-xs text-[#64748B]">{user.role_title || t('popular')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFollow(user.username)}
                    className="text-[#7494EC] font-semibold text-sm hover:underline shrink-0"
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
        <div className="bg-white rounded-[12px] border border-[rgba(116,148,236,0.1)] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-4">
          <h3 className="font-semibold text-sm text-[#0F172A]">{t('following')}</h3>

          {loadingFollowing ? (
            <div className="mt-3 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-[#F1F5F9]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-20 bg-[#F1F5F9] rounded" />
                    <div className="h-2.5 w-14 bg-[#F1F5F9] rounded" />
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
                    <p className="font-semibold text-sm text-[#0F172A] truncate">@{user.username}</p>
                    <p className="text-xs text-[#64748B]">{user.role_title || ''}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUnfollow(user.username)}
                    className="text-[#94A3B8] font-semibold text-sm hover:text-[#EF4444] hover:underline shrink-0 transition-colors"
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
      <div className="bg-[rgba(116,148,236,0.1)] rounded-[12px] p-4">
        <h3 className="font-semibold text-sm text-[#7494EC]">{t('codeleapPremium')}</h3>
        <p className="text-xs text-[#475569] mt-1">{t('premiumDescription')}</p>
        <button
          type="button"
          className="mt-3 w-full bg-[#7494EC] text-white text-sm font-semibold py-2.5 rounded-[8px] hover:bg-[#6384DC] transition"
        >
          {t('learnMore')}
        </button>
      </div>

      {/* Footer links */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#94A3B8]">
          <span>{t('termsOfServiceFooter')}</span>
          <span>{t('privacyPolicyFooter')}</span>
          <span>{t('cookiePolicy')}</span>
          <span>{t('accessibility')}</span>
        </div>
        <p className="text-xs text-[#94A3B8] mt-2">&copy; 2024 CodeLeap</p>
      </div>
    </div>
  );
}
