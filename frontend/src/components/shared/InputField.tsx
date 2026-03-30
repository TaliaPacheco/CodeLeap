import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';

interface InputFieldProps extends ComponentPropsWithoutRef<'input'> {
  label: string;
  icon?: ReactNode;
  error?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, icon, error, className = '', type = 'text', ...rest }, ref) => {
    return (
      <div className={className}>
        <label className="block text-sm font-semibold text-[#334155] mb-1.5">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className={`w-full h-12 rounded-[8px] border bg-[var(--bg-input)] px-3 text-sm placeholder:text-[var(--text-placeholder)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition ${icon ? 'pl-11' : ''} ${error ? 'border-red-500' : 'border-[var(--border)]'}`}
            {...rest}
          />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
