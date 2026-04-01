import Avatar from '../shared/Avatar';

interface StoryAvatarProps {
  username: string;
  profilePicture: string | null;
  hasUnseen: boolean;
  onClick: () => void;
}

export default function StoryAvatar({ username, profilePicture, hasUnseen, onClick }: StoryAvatarProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 min-w-[64px] group"
    >
      <div
        className={`w-14 h-14 rounded-full p-[3px] ${
          hasUnseen
            ? 'border-[3px] border-[var(--primary)]'
            : 'border-2 border-[var(--border)]'
        }`}
      >
        <Avatar
          base64={profilePicture}
          username={username}
          size={44}
          className="w-full h-full"
        />
      </div>
      <span
        className={`text-[11px] truncate max-w-[64px] ${
          hasUnseen
            ? 'text-[var(--text-secondary)]'
            : 'text-[var(--text-muted)]'
        }`}
      >
        {username}
      </span>
    </button>
  );
}
