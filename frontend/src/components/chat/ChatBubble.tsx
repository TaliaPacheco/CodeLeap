import type { Message } from '../../types/chat';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] px-4 py-2.5 rounded-[12px] ${
        isOwn
          ? 'bg-[var(--primary)] text-white rounded-br-[4px]'
          : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-accent)] rounded-bl-[4px]'
      }`}>
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/70' : 'text-[var(--text-placeholder)]'}`}>
          {time}
        </p>
      </div>
    </div>
  );
}
