interface SpinnerProps {
  size?: number;
  className?: string;
}

export default function Spinner({ size = 24, className = '' }: SpinnerProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`border-[2px] border-[var(--primary)] border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
