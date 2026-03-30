import { useState, useRef, useEffect, useCallback } from 'react';
import type { User } from '../../types/user';
import Avatar from './Avatar';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  following: User[];
  placeholder?: string;
  className?: string;
}

export default function MentionInput({ value, onChange, onKeyDown, following, placeholder, className }: MentionInputProps) {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = mentionQuery !== null
    ? following.filter(u => u.username.toLowerCase().startsWith(mentionQuery.toLowerCase())).slice(0, 5)
    : [];

  const getMentionStart = useCallback(() => {
    const el = inputRef.current;
    if (!el) return -1;
    const pos = el.selectionStart ?? value.length;
    const text = value.slice(0, pos);
    const atIdx = text.lastIndexOf('@');
    if (atIdx === -1) return -1;
    const after = text.slice(atIdx + 1);
    if (atIdx > 0 && !/\s/.test(text[atIdx - 1])) return -1;
    if (/\s/.test(after)) return -1;
    return atIdx;
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const atIdx = getMentionStart();
      if (atIdx === -1) {
        setMentionQuery(null);
        return;
      }
      const el = inputRef.current;
      const pos = el?.selectionStart ?? value.length;
      setMentionQuery(value.slice(atIdx + 1, pos));
      setMentionIndex(0);
    }, 0);
    return () => clearTimeout(timer);
  }, [value, getMentionStart]);

  function insertMention(username: string) {
    const el = inputRef.current;
    if (!el) return;
    const atIdx = getMentionStart();
    if (atIdx === -1) return;
    const before = value.slice(0, atIdx);
    const pos = el.selectionStart ?? value.length;
    const after = value.slice(pos);
    onChange(`${before}@${username} ${after}`);
    setMentionQuery(null);

    requestAnimationFrame(() => {
      const newPos = atIdx + username.length + 2;
      el.selectionStart = newPos;
      el.selectionEnd = newPos;
      el.focus();
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (mentionQuery !== null && filtered.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % filtered.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        insertMention(filtered[mentionIndex].username);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(filtered[mentionIndex].username);
        return;
      }
      if (e.key === 'Escape') {
        setMentionQuery(null);
        return;
      }
    }
    onKeyDown?.(e);
  }

  useEffect(() => {
    if (mentionQuery === null) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setMentionQuery(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mentionQuery]);

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />

      {mentionQuery !== null && filtered.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 bg-[var(--bg-card)] border border-[var(--border)] rounded-[8px] shadow-lg py-1 w-[220px] max-h-[200px] overflow-y-auto bottom-full mb-1 left-0"
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
