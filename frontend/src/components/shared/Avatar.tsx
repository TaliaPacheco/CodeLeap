import { toDataUri } from '../../utils/image';

interface AvatarProps {
  base64: string | null;
  username: string;
  size?: number;
  className?: string;
}

export default function Avatar({ base64, username, size = 40, className = '' }: AvatarProps) {
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div
      style={{ width: size, height: size, minWidth: size }}
      className={`rounded-full overflow-hidden ${className}`}
    >
      {base64 ? (
        <img
          src={toDataUri(base64)}
          alt={username}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[rgba(116,148,236,0.1)] flex items-center justify-center">
          <span
            style={{ fontSize: size * 0.38 }}
            className="font-semibold text-[#7494EC] select-none"
          >
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}
