import { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { useLanguage } from '../../i18n/LanguageContext';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm }: DeleteConfirmModalProps) {
  const { t } = useLanguage();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // error handling can be added later
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="border border-[var(--danger)]">
      <div className="flex flex-col items-center text-center">
        {/* Warning Icon */}
        <div className="bg-[var(--danger-subtle)] p-3 rounded-full">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="font-semibold text-lg text-[var(--text-primary)] mt-4">{t('areYouSure')}</h2>

        {/* Description */}
        <p className="text-sm text-[var(--text-muted)] mt-2">
          {t('deleteWarning')}
        </p>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="ghost" onClick={onClose} className="min-w-[120px]">
            {t('cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting} className="min-w-[120px]">
            {t('delete')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
