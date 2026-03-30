import { useState, useRef, useEffect, useCallback } from 'react';
import type { User } from '../../types/user';
import Avatar from './Avatar';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  following: User[];
  placeholder?: string;
  className?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function MentionTextarea({ value, onChange, following, placeholder, className, inputRef }: MentionTextareaProps) {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = inputRef ?? internalRef;

  const filtered = mentionQuery !== null
    ? following.filter(u => u.username.toLowerCase().startsWith(mentionQuery.toLowerCase())).slice(0, 5)
    : [];

  const getMentionStart = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return -1;
    const pos = el.selectionStart;
    const text = value.slice(0, pos);
    const atIdx = text.lastIndexOf('@');
    if (atIdx === -1) return -1;
    const after = text.slice(atIdx + 1);
    // Only trigger if @ is at start or preceded by whitespace/newline, and no spaces after @
    if (atIdx > 0 && !/\s/.test(text[atIdx - 1])) return -1;
    if (/\s/.test(after)) return -1;
    return atIdx;
  }, [value, textareaRef]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value;
    onChange(newValue);
  }

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    function check() {
      const atIdx = getMentionStart();
      if (atIdx === -1) {
        setMentionQuery(null);
        return;
      }
      const query = value.slice(atIdx + 1, el!.selectionStart);
      setMentionQuery(query);
      setMentionIndex(0);
    }

    // Check on every value change via a microtask so selectionStart is updated
    const timer = setTimeout(check, 0);
    return () => clearTimeout(timer);
  }, [value, getMentionStart, textareaRef]);

  function insertMention(username: string) {
    const el = textareaRef.current;
    if (!el) return;
    const atIdx = getMentionStart();
    if (atIdx === -1) return;
    const before = value.slice(0, atIdx);
    const after = value.slice(el.selectionStart);
    const newValue = `${before}@${username} ${after}`;
    onChange(newValue);
    setMentionQuery(null);

    // Move cursor after the inserted mention
    requestAnimationFrame(() => {
      const pos = atIdx + username.length + 2; // @username + space
      el.selectionStart = pos;
      el.selectionEnd = pos;
      el.focus();
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery === null || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMentionIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMentionIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(filtered[mentionIndex].username);
    } else if (e.key === 'Escape') {
      setMentionQuery(null);
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    if (mentionQuery === null) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        setMentionQuery(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mentionQuery, textareaRef]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />

      {/* Mention dropdown */}
      {mentionQuery !== null && filtered.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 bg-[var(--bg-card)] border border-[var(--border)] rounded-[8px] shadow-lg py-1 w-[220px] max-h-[200px] overflow-y-auto"
          style={{ top: '100%', left: 0 }}
        >
          {filtered.map((user, i) => (
            <button
              key={user.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); insertMention(user.username); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer ${i === mentionIndex ? 'bg-[var(--primary-subtle)]' : 'hover:bg-[var(--bg-input)]'}`}
            >
              <Avatar base64={user.profile_picture} username={user.username} size={24} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#0F172A] truncate">@{user.username}</p>
                {user.role_title && <p className="text-xs text-[#94A3B8] truncate">{user.role_title}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
