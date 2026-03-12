import { useRef, useState, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { fileToBase64, toDataUri } from '../../utils/image';
import Avatar from '../shared/Avatar';
import MentionText from '../shared/MentionText';
import { useLanguage } from '../../i18n/LanguageContext';

interface CreatePostBoxProps {
  userAvatar: string | null;
  username: string;
  onSubmit: (payload: { title: string; content: string; media?: string }) => Promise<void>;
}

export default function CreatePostBox({ userAvatar, username, onSubmit }: CreatePostBoxProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;
    function handleClick(e: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showEmojiPicker]);

  function handleEmojiSelect(emoji: { native: string }) {
    setContent(prev => prev + emoji.native);
    contentRef.current?.focus();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    setMedia(base64);

    // Reset input so the same file can be re-selected
    e.target.value = '';
  }

  function removeMedia() {
    setMedia(null);
  }

  async function handleSubmit() {
    if (!title.trim() || !content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const payload: { title: string; content: string; media?: string } = {
        title: title.trim(),
        content: content.trim(),
      };
      if (media) payload.media = media;

      await onSubmit(payload);

      setTitle('');
      setContent('');
      setMedia(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-[12px] border border-[rgba(116,148,236,0.1)] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-5">
      <div className="flex items-start gap-3">
        <Avatar base64={userAvatar} username={username} size={40} />

        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('postTitle')}
            className="w-full text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] border-b border-[#F1F5F9] pb-2 mb-2 outline-none bg-transparent"
          />
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('whatsOnYourMind')}
            className="w-full resize-none border-none outline-none text-sm placeholder:text-[#94A3B8] text-[#0F172A] min-h-[60px] bg-transparent"
          />
        </div>
      </div>

      {/* Media preview */}
      {media && (
        <div className="relative mt-3 ml-[52px] rounded-[8px] overflow-hidden border border-[#E2E8F0]">
          <img
            src={toDataUri(media)}
            alt="Preview"
            className="w-full max-h-[250px] object-cover"
          />
          <button
            type="button"
            onClick={removeMedia}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors cursor-pointer"
            aria-label="Remove media"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-[12px] shadow-xl w-full max-w-[560px] mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
              <span className="font-semibold text-base text-[#0F172A]">{t('preview')}</span>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal body — simulates PostCard */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Avatar base64={userAvatar} username={username} size={40} />
                <span className="font-semibold text-sm text-[#0F172A]">@{username}</span>
              </div>

              {title.trim() && (
                <h3 className="font-semibold text-base text-[#0F172A] mb-2">{title}</h3>
              )}

              <MentionText text={content} className="text-sm text-[#475569] leading-relaxed" />

              {media && (
                <div className="mt-3 rounded-[8px] overflow-hidden">
                  <img src={toDataUri(media)} alt="Preview" className="w-full object-cover max-h-[300px]" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F1F5F9]">
        <div className="flex items-center gap-3">
          {/* Image attach */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[#94A3B8] hover:text-[#7494EC] transition-colors cursor-pointer"
            aria-label="Attach image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Emoji picker */}
          <div className="relative flex items-center" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-[#94A3B8] hover:text-[#7494EC] transition-colors cursor-pointer"
              aria-label="Add emoji"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>
            {showEmojiPicker && (
              <div className="absolute left-0 top-10 z-50 shadow-lg rounded-[12px]">
                <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" previewPosition="none" skinTonePosition="none" perLine={8} maxFrequentRows={1} />
              </div>
            )}
          </div>

          {/* Code placeholder */}
          <button
            type="button"
            className="text-[#94A3B8] hover:text-[#7494EC] transition-colors cursor-pointer"
            aria-label="Add code"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            disabled={!content.trim()}
            className={`font-semibold text-sm px-4 py-2 rounded-[8px] cursor-pointer transition-colors border disabled:opacity-40 disabled:cursor-not-allowed ${showPreview ? 'bg-[#7494EC] text-white border-[#7494EC]' : 'text-[#7494EC] border-[#7494EC] hover:bg-[rgba(116,148,236,0.1)]'}`}
          >
            {t('preview')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || submitting}
            className="bg-[#7494EC] text-white font-semibold text-sm px-6 py-2 rounded-[8px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {submitting ? t('creating') : t('create')}
          </button>
        </div>
      </div>
    </div>
  );
}
