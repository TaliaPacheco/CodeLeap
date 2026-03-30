import { type ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
  loading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
  danger: 'bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)]',
  ghost: 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]',
};

export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`rounded-[8px] px-5 py-2.5 font-medium text-sm transition-colors duration-150 inline-flex items-center justify-center gap-2 cursor-pointer ${variantClasses[variant]} ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
      {...rest}
    >
      {loading && <Spinner size={16} className="border-2" />}
      {children}
    </button>
  );
}
