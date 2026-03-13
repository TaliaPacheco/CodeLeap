import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function LoginPage() {
  const auth = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tokens = await login({ email, password });
      await auth.login(tokens);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(axiosErr.response?.data?.detail ?? t('invalidCredentials'));
      } else {
        setError(t('somethingWentWrong'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center px-4 relative">
      {/* Language toggle */}
      <div className="absolute top-4 right-6 flex items-center bg-[var(--bg-card)] rounded-full p-0.5 text-xs font-semibold shadow-sm border border-[var(--border)]">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 rounded-full transition-colors ${language === 'en' ? 'bg-[#7494EC] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('pt')}
          className={`px-2.5 py-1 rounded-full transition-colors ${language === 'pt' ? 'bg-[#7494EC] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
        >
          PT
        </button>
      </div>

      <div className="max-w-[480px] w-full bg-[var(--bg-card)] rounded-[12px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="h-32 bg-[rgba(116,148,236,0.1)] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 bg-[#7494EC] rounded-[8px] flex items-center justify-center">
            <svg
              width="20"
              height="20"
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
          <span className="font-bold text-xl text-[var(--text-primary)] tracking-tight">
            CodeLeap Network
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div>
            <h1 className="font-bold text-2xl text-[var(--text-primary)]">{t('welcomeBack')}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {t('loginSubtitle')}
            </p>
          </div>

          <div className="space-y-5">
            {/* Email / Username */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block font-semibold text-sm text-[var(--text-label)]"
              >
                {t('emailOrUsername')}
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailOrUsernamePlaceholder')}
                required
                className="w-full h-12 px-4 rounded-[8px] border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none focus:border-[#7494EC] focus:ring-1 focus:ring-[#7494EC] transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block font-semibold text-sm text-[var(--text-label)]"
              >
                {t('password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  className="w-full h-12 px-4 pr-12 rounded-[8px] border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none focus:border-[#7494EC] focus:ring-1 focus:ring-[#7494EC] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#7494EC] text-white font-bold rounded-[8px] shadow-md hover:bg-[#6384DC] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? t('entering') : t('enter')}
          </button>

          {/* Divider + Registration link */}
          <div className="border-t border-[var(--border-light)] pt-6 text-center text-sm text-[var(--text-muted)]">
            {t('noAccount')}{' '}
            <Link
              to="/register"
              className="font-bold text-[#7494EC] hover:underline"
            >
              {t('registration')}
            </Link>
          </div>
        </form>
      </div>

      {/* Copyright */}
      <p className="mt-6 text-xs text-[var(--text-placeholder)]">
        {t('copyright')}
      </p>
    </div>
  );
}
