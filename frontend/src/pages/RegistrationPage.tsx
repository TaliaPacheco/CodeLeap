import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { fileToBase64, toDataUri } from '../utils/image';
import { useLanguage } from '../i18n/LanguageContext';

export default function RegistrationPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t, language, setLanguage } = useLanguage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setProfilePicture(base64);
    } catch {
      setError(t('failedReadImage'));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError(t('fillAllFields'));
      return;
    }

    if (!agreedTerms) {
      setError(t('mustAgreeTerms'));
      return;
    }

    setLoading(true);
    try {
      const tokens = await register({
        username: username.trim(),
        email: email.trim(),
        password,
        ...(profilePicture ? { profile_picture: profilePicture } : {}),
      });
      await login(tokens);
      navigate('/');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const resp = (err as { response?: { data?: Record<string, unknown> } }).response;
        if (resp?.data) {
          const apiErrors: Record<string, string> = {
            'A user with that username already exists.': t('errorUsernameExists'),
            'A user with that email already exists.': t('errorEmailExists'),
            'This password is too short. It must contain at least 8 characters.': t('errorPasswordTooShort'),
            'This password is too common.': t('errorPasswordTooCommon'),
            'This password is entirely numeric.': t('errorPasswordNumeric'),
          };
          const messages = Object.values(resp.data)
            .flat()
            .map((msg) => (typeof msg === 'string' && apiErrors[msg]) ? apiErrors[msg] : msg)
            .join(' ');
          setError(messages || t('registrationFailed'));
        } else {
          setError(t('registrationFailed'));
        }
      } else {
        setError(t('registrationFailed'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[var(--bg-page)] overflow-hidden">
      {/* Language toggle */}
      <div className="absolute top-4 right-6 z-20 flex items-center bg-[var(--bg-card)] rounded-full p-0.5 text-xs font-semibold shadow-sm border border-[var(--border)]">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 rounded-full transition-colors ${language === 'en' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('pt')}
          className={`px-2.5 py-1 rounded-full transition-colors ${language === 'pt' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
        >
          PT
        </button>
      </div>

      {/* Decorative blurred circles */}
      <div className="absolute top-24 left-16 w-64 h-64 bg-[var(--primary-muted)] blur-[32px] rounded-full" />
      <div className="absolute bottom-24 right-16 w-96 h-96 bg-[var(--primary-subtle)] blur-[32px] rounded-full" />

      {/* Top-left header */}
      <div className="absolute top-4 left-40 flex items-center gap-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--primary)]"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        <span className="font-bold text-lg text-[var(--text-primary)]">Nudos</span>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-w-[480px] w-full rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] p-8"
      >
        {/* Title */}
        <h1 className="font-black text-3xl text-center text-[var(--text-primary)] tracking-tight">
          {t('joinTheNetwork')}
        </h1>
        <p className="text-base text-[var(--text-muted)] text-center mt-2">
          {t('registerSubtitle')}
        </p>

        {/* Profile picture upload */}
        <div className="flex flex-col items-center mt-6 mb-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full border-2 border-dashed border-[var(--primary-muted)] bg-[var(--primary-subtle)] flex items-center justify-center overflow-hidden cursor-pointer"
          >
            {profilePicture ? (
              <img
                src={toDataUri(profilePicture)}
                alt="Profile preview"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}

            {/* Camera button */}
            <span className="absolute bottom-0 right-0 bg-[var(--primary)] rounded-full p-1.5 shadow-lg flex items-center justify-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="white"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" fill="none" />
              </svg>
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <span className="font-semibold text-sm text-[var(--primary)] mt-2">
            {t('uploadProfilePicture')}
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-sm text-[var(--danger)] text-center mb-4">{error}</div>
        )}

        {/* Input fields */}
        <div className="space-y-4">
          {/* Username */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-placeholder)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
              </svg>
            </span>
            <input
              id="username"
              name="username"
              type="text"
              placeholder={t('username')}
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-[var(--bg-input)] border border-[var(--border)] rounded-[8px] text-[var(--text-primary)] placeholder-[var(--text-placeholder)] outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-placeholder)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder={t('email')}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-[var(--bg-input)] border border-[var(--border)] rounded-[8px] text-[var(--text-primary)] placeholder-[var(--text-placeholder)] outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                width="14"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-placeholder)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('password')}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-10 pr-10 bg-[var(--bg-input)] border border-[var(--border)] rounded-[8px] text-[var(--text-primary)] placeholder-[var(--text-placeholder)] outline-none focus:border-[var(--primary)] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)] hover:text-[var(--text-muted)] transition-colors"
            >
              {showPassword ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
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

        {/* Terms checkbox */}
        <label className="flex items-start gap-3 mt-5 cursor-pointer select-none">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[var(--primary)] rounded cursor-pointer"
          />
          <span className="text-sm text-[var(--text-secondary)] leading-snug">
            {t('termsText')}{' '}
            <span className="text-[var(--primary)] cursor-pointer">{t('termsOfService')}</span> {t('and')}{' '}
            <span className="text-[var(--primary)] cursor-pointer">{t('privacyPolicy')}</span>.
          </span>
        </label>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-3.5 bg-[var(--primary)] text-white font-semibold rounded-[8px] hover:bg-[var(--primary-hover)] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? t('creatingAccount') : `${t('registerNow')} \u2192`}
        </button>

        {/* Divider */}
        <div className="border-t border-[var(--border-light)] mt-8 pt-6 text-center">
          <span className="text-sm text-[var(--text-muted)]">{t('alreadyHaveAccount')} </span>
          <Link to="/login" className="text-sm font-bold text-[var(--primary)] hover:underline">
            {t('loginHere')}
          </Link>
        </div>
      </form>
    </div>
  );
}
