import { useState, useEffect, useRef } from 'react';
import type { Post } from '../../types/post';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { updatePost } from '../../api/posts';
import { fileToBase64, toDataUri } from '../../utils/image';
import { useLanguage } from '../../i18n/LanguageContext';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onSave: (updated: Post) => void;
}

export default function EditPostModal({ isOpen, onClose, post, onSave }: EditPostModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newMedia, setNewMedia] = useState<string | null>(null);
  const [mediaChanged, setMediaChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setNewMedia(null);
      setMediaChanged(false);
      setSaving(false);
    }
  }, [post]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setNewMedia(base64);
    setMediaChanged(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!post) return;
    setSaving(true);
    try {
      const payload: Record<string, string | null | undefined> = {};
      if (title !== post.title) payload.title = title;
      if (content !== post.content) payload.content = content;
      if (mediaChanged) payload.media = newMedia;
      const updated = await updatePost(post.id, payload);
      onSave(updated);
    } catch {
      // error handling can be added later
    } finally {
      setSaving(false);
    }
  };

  const currentMedia = mediaChanged ? newMedia : post?.media ?? null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg text-[var(--text-primary)]">{t('editPost')}</h2>
        <button onClick={onClose} className="cursor-pointer text-[var(--text-placeholder)] hover:text-[var(--text-primary)] transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Form */}
      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-label)] mb-1.5">{t('title')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-10 rounded-[8px] border border-[var(--border)] bg-[var(--bg-input)] px-3 text-sm focus:border-[#7494EC] focus:ring-1 focus:ring-[#7494EC] outline-none transition"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-label)] mb-1.5">{t('content')}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[120px] rounded-[8px] border border-[var(--border)] bg-[var(--bg-input)] p-3 text-sm resize-none focus:border-[#7494EC] focus:ring-1 focus:ring-[#7494EC] outline-none transition"
          />
        </div>

        {/* Media Update */}
        <div>
          <label className="block text-sm font-semibold text-[var(--text-label)] mb-1.5">{t('mediaUpdate')}</label>

          {currentMedia ? (
            <div className="bg-[var(--bg-input)] rounded-[8px] p-3 flex items-center gap-3">
              <img
                src={toDataUri(currentMedia)}
                alt="Post media"
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm text-[var(--text-secondary)]">current_photo.jpg</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-[#7494EC] cursor-pointer hover:underline text-left"
                >
                  {t('changeMedia')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-[#7494EC] cursor-pointer hover:underline"
            >
              {t('addMedia')}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="primary" type="submit" loading={saving}>
            {t('save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
