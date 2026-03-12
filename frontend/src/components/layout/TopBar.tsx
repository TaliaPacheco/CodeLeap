import { useLanguage } from '../../i18n/LanguageContext';

interface TopBarProps {
  onLogout: () => void;
  onEditProfile: () => void;
}

export default function TopBar({ onLogout, onEditProfile }: TopBarProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="fixed top-0 w-full bg-white border-b border-[#E2E8F0] h-14 px-6 lg:px-10 flex items-center justify-between z-50">
      {/* Left side: Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#7494EC] rounded-[6px] flex items-center justify-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
            className={`px-2.5 py-1 rounded-full transition-colors ${
              language === 'en'
                ? 'bg-white text-[#7494EC] shadow-sm'
                : 'text-[#64748B] hover:text-[#475569]'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('pt')}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              language === 'pt'
                ? 'bg-white text-[#7494EC] shadow-sm'
                : 'text-[#64748B] hover:text-[#475569]'
            }`}
          >
            PT
          </button>
        </div>

        {/* Bell notification icon */}
        <button type="button" className="p-1">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        {/* Profile button */}
        <button
          type="button"
          onClick={onEditProfile}
          className="flex items-center gap-2 text-[#475569] hover:text-[#7494EC] font-semibold text-sm transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7494EC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
