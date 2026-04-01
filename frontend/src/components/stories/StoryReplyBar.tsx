import { useState } from 'react';

const EMOJIS = ['🔥', '❤️', '👏', '🚀', '💡'];

interface StoryReplyBarProps {
  onReact: (emoji: string) => void;
  onReply: (content: string) => void;
}

export default function StoryReplyBar({ onReact, onReply }: StoryReplyBarProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onReply(text.trim());
    setText('');
  };

  return (
    <div className="flex items-center gap-2 px-5 py-4">
      <form onSubmit={handleSubmit} className="flex-1">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Responder..."
          className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm placeholder-white/50 outline-none focus:border-white/40"
        />
      </form>
      <div className="flex gap-1">
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            className="text-xl hover:scale-125 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
