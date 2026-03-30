import { useState, useEffect, useRef } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Avatar from '../shared/Avatar';
import { useAuth } from '../../context/AuthContext';
import { updateMe } from '../../api/users';
import { fileToBase64 } from '../../utils/image';
import { useLanguage } from '../../i18n/LanguageContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [newProfilePicture, setNewProfilePicture] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      setUsername(user.username);
      setBio(user.bio);
      setNewProfilePicture(null);
      setSaving(false);
    }
  }, [user, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setNewProfilePicture(base64);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload: Record<string, string | undefined> = {};
      if (username !== user.username) payload.username = username;
      if (bio !== user.bio) payload.bio = bio;
      if (newProfilePicture) payload.profile_picture = newProfilePicture;
      const updated = await updateMe(payload);
      updateUser(updated);
      onClose();
    } catch {
      // error handling can be added later
    } finally {
      setSaving(false);
    }
  };

  const displayPicture = newProfilePicture ?? user?.profile_picture ?? null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg text-[var(--text-primary)]">{t('editProfile')}</h2>
        <button onClick={onClose} className="cursor-pointer text-[var(--text-placeholder)] hover:text-[var(--text-primary)] transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col items-center mt-4">
        <div className="relative">
          <Avatar
            base64={displayPicture}
            username={username || user?.username || ''}
            size={80}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-[var(--primary)] rounded-full p-1.5 cursor-pointer hover:bg-[var(--primary-hover)] transition"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" fill="none" />
            </svg>
          </button>
        </div>
        <span className="text-xs text-[var(--text-placeholder)] mt-2">{t('recommended')}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Form */}
      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        {/* Username */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-label)] mb-1.5">{t('username')}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)] text-sm select-none">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-10 rounded-[8px] border border-[var(--border)] bg-[var(--bg-input)] pl-9 pr-3 text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-label)] mb-1.5">{t('bio')}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            className="w-full min-h-[100px] rounded-[8px] border border-[var(--border)] bg-[var(--bg-input)] p-3 text-sm resize-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition"
          />
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="primary" type="submit" loading={saving}>
            {t('updateProfile')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
