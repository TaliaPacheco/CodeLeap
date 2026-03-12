interface SpinnerProps {
  size?: number;
  className?: string;
}

export default function Spinner({ size = 24, className = '' }: SpinnerProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`border-[3px] border-[#7494EC] border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
