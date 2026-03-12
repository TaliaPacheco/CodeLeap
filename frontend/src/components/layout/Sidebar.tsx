import { useLanguage } from '../../i18n/LanguageContext';

type View = 'feed' | 'my-posts' | 'liked';
type Sort = 'recent' | 'trending';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  sort: Sort;
  onSortChange: (sort: Sort) => void;
}

export default function Sidebar({ activeView, onViewChange, sort, onSortChange }: SidebarProps) {
  const { t } = useLanguage();

  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    {
      id: 'feed',
      label: t('feed'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9.5L12 2l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
        </svg>
      ),
    },
    {
      id: 'my-posts',
      label: t('myPosts'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: 'liked',
      label: t('liked'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
  ];

  const sortOptions: { id: Sort; label: string }[] = [
    { id: 'recent', label: t('recent') },
    { id: 'trending', label: t('trending') },
  ];

  return (
    <div className="sticky top-[72px] w-full">
      {/* Navigation */}
      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
        {t('navigation')}
      </p>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-[8px] text-sm transition ${
                isActive
                  ? 'bg-[#7494EC] text-white'
                  : 'text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-[#E2E8F0] my-4" />

      {/* Sort By */}
      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
        {t('sortBy')}
      </p>
      <div className="space-y-1">
        {sortOptions.map((option) => {
          const isSelected = sort === option.id;
          return (
            <label
              key={option.id}
              className="flex items-center gap-3 cursor-pointer py-2"
            >
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-[#7494EC]' : 'border-[#E2E8F0]'
                }`}
              >
                {isSelected && (
                  <span className="w-2 h-2 bg-[#7494EC] rounded-full" />
                )}
              </span>
              <input
                type="radio"
                name="sort"
                value={option.id}
                checked={isSelected}
                onChange={() => onSortChange(option.id)}
                className="sr-only"
              />
              <span className="text-sm text-[#0F172A]">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
