import type { StoryGroup } from '../../types/story';
import StoryAvatar from './StoryAvatar';

interface StoryBarProps {
  groups: StoryGroup[];
  loading: boolean;
  onOpenCreate: () => void;
  onOpenViewer: (groupIndex: number) => void;
}

export default function StoryBar({
  groups,
  loading,
  onOpenCreate,
  onOpenViewer,
}: StoryBarProps) {
  if (loading && groups.length === 0) return null;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-3">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
        {/* Create button */}
        <button
          onClick={onOpenCreate}
          className="flex flex-col items-center gap-1.5 min-w-[64px]"
        >
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-[var(--primary)] flex items-center justify-center text-[var(--primary)] text-xl hover:bg-[rgba(116,148,236,0.05)] transition-colors">
            +
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">Criar</span>
        </button>

        {/* Divider */}
        {groups.length > 0 && (
          <div className="w-px h-12 bg-[var(--border)] flex-shrink-0" />
        )}

        {/* Story avatars */}
        {groups.map((group, index) => (
          <StoryAvatar
            key={group.author.id}
            username={group.author.username}
            profilePicture={group.author.profile_picture}
            hasUnseen={group.has_unseen}
            onClick={() => onOpenViewer(index)}
          />
        ))}
      </div>
    </div>
  );
}
