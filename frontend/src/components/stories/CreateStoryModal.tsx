import { useState } from 'react';
import type { StoryCreatePayload } from '../../types/story';
import { fileToBase64 } from '../../utils/image';
import Modal from '../shared/Modal';
import CodeHighlighter from './CodeHighlighter';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: StoryCreatePayload) => Promise<void>;
}

type StoryType = 'image' | 'text' | 'code';

const BG_COLORS = [
  '#7494EC',
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#8B5CF6',
  '#EC4899',
  '#0F172A',
];

const LANGUAGES = [
  'python',
  'javascript',
  'typescript',
  'go',
  'rust',
  'java',
  'c',
  'cpp',
  'html',
  'css',
  'sql',
  'bash',
];

export default function CreateStoryModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateStoryModalProps) {
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [type, setType] = useState<StoryType>('text');
  const [submitting, setSubmitting] = useState(false);

  // Image form
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');

  // Text form
  const [textContent, setTextContent] = useState('');
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);

  // Code form
  const [codeContent, setCodeContent] = useState('');
  const [language, setLanguage] = useState(LANGUAGES[0]);

  const reset = () => {
    setStep('select');
    setType('text');
    setImageFile(null);
    setImagePreview(null);
    setImageCaption('');
    setTextContent('');
    setBgColor(BG_COLORS[0]);
    setCodeContent('');
    setLanguage(LANGUAGES[0]);
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const selectType = (t: StoryType) => {
    setType(t);
    setStep('form');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const canSubmit = () => {
    if (submitting) return false;
    if (type === 'image') return !!imageFile;
    if (type === 'text') return textContent.trim().length > 0;
    if (type === 'code') return codeContent.trim().length > 0;
    return false;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    setSubmitting(true);

    try {
      const payload: StoryCreatePayload = { content_type: type };

      if (type === 'image') {
        payload.media = await fileToBase64(imageFile!);
        if (imageCaption.trim()) payload.text = imageCaption.trim();
      } else if (type === 'text') {
        payload.text = textContent.trim();
        payload.background_color = bgColor;
      } else if (type === 'code') {
        payload.code = codeContent;
        payload.language = language;
      }

      await onSubmit(payload);
      handleClose();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {step === 'select' ? (
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 text-center">
            Criar Story
          </h2>
          <div className="flex gap-4 justify-center">
            <TypeButton emoji="📷" label="Imagem" onClick={() => selectType('image')} />
            <TypeButton emoji="Aa" label="Texto" onClick={() => selectType('text')} />
            <TypeButton emoji="</>" label="Código" onClick={() => selectType('code')} />
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setStep('select')}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm"
            >
              &larr; Voltar
            </button>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {type === 'image' && 'Story de Imagem'}
              {type === 'text' && 'Story de Texto'}
              {type === 'code' && 'Story de Código'}
            </h2>
            <div className="w-12" />
          </div>

          {type === 'image' && (
            <div className="space-y-4">
              <label className="block border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center cursor-pointer hover:border-[var(--primary)] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg object-contain"
                  />
                ) : (
                  <div className="text-[var(--text-muted)]">
                    <span className="text-3xl block mb-2">📷</span>
                    <span className="text-sm">Clique para selecionar uma imagem</span>
                  </div>
                )}
              </label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Legenda (opcional)"
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] outline-none focus:border-[var(--primary)]"
              />
            </div>
          )}

          {type === 'text' && (
            <div className="space-y-4">
              <div
                className="rounded-lg p-6 min-h-[160px] flex items-center justify-center"
                style={{ backgroundColor: bgColor }}
              >
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Escreva algo..."
                  className="bg-transparent text-white text-xl font-semibold text-center w-full resize-none outline-none placeholder-white/50"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-center">
                {BG_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBgColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      bgColor === color
                        ? 'border-[var(--text-primary)] scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {type === 'code' && (
            <div className="space-y-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder="Cole ou escreva seu código..."
                className="w-full bg-[#1E293B] text-white font-mono text-sm rounded-lg px-4 py-3 min-h-[140px] resize-none outline-none border border-[var(--border)] focus:border-[var(--primary)]"
                rows={6}
              />
              {codeContent.trim() && (
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-2">Preview:</p>
                  <CodeHighlighter code={codeContent} language={language} />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-input)] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit()}
              className="flex-1 px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function TypeButton({
  emoji,
  label,
  onClick,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 w-24 py-4 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[rgba(116,148,236,0.05)] transition-colors"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
    </button>
  );
}
