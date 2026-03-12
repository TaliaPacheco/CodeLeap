import { type ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
  loading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-[#7494EC] text-white hover:bg-[#6384DC] shadow',
  danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626]',
  ghost: 'bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]',
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
      className={`rounded-[8px] px-5 py-2.5 font-semibold text-sm transition inline-flex items-center justify-center gap-2 ${variantClasses[variant]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...rest}
    >
      {loading && <Spinner size={16} className="border-2" />}
      {children}
    </button>
  );
}
