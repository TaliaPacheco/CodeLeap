import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components, ExtraProps } from 'react-markdown';

interface MentionTextProps {
  text: string;
  className?: string;
}

function injectMentions(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      const parts = child.split(/(@\w+)/);
      if (parts.length === 1) return child;
      return (
        <>
          {parts.map((part, i) =>
            part.startsWith('@') ? (
              <span key={i} className="text-[var(--primary)] font-medium cursor-pointer hover:underline">
                {part}
              </span>
            ) : (
              part
            )
          )}
        </>
      );
    }
    if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
      return React.cloneElement(child, {}, injectMentions(child.props.children));
    }
    return child;
  });
}

function withMentions<T extends { children?: React.ReactNode }>(
  Tag: keyof React.JSX.IntrinsicElements,
  className?: string,
) {
  return function Comp({ children }: T & ExtraProps) {
    return React.createElement(Tag, { className }, injectMentions(children));
  };
}

const components: Components = {
  p: withMentions('p', 'mb-2 last:mb-0'),
  strong: withMentions('strong', 'font-semibold'),
  em: withMentions('em', undefined),
  li: withMentions('li', undefined),
  h1: withMentions('h1', 'text-2xl font-bold mb-2'),
  h2: withMentions('h2', 'text-xl font-bold mb-2'),
  h3: withMentions('h3', 'text-lg font-semibold mb-1'),
  h4: withMentions('h4', 'text-base font-semibold mb-1'),
  h5: withMentions('h5', 'text-sm font-semibold mb-1'),
  h6: withMentions('h6', 'text-xs font-semibold mb-1'),
  a({ href, children }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">
        {children}
      </a>
    );
  },
  code({ children, className }) {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className={`block bg-[#1E293B] text-[#E2E8F0] rounded-[8px] p-3 text-xs font-mono overflow-x-auto my-2 ${className ?? ''}`}>
          {children}
        </code>
      );
    }
    return (
      <code className="bg-[#F1F5F9] text-[#334155] rounded px-1.5 py-0.5 text-xs font-mono">
        {children}
      </code>
    );
  },
  pre({ children }) {
    return <pre className="my-2">{children}</pre>;
  },
  ul({ children }) {
    return <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-3 border-[var(--primary)] pl-3 my-2 text-[var(--text-muted)] italic">
        {children}
      </blockquote>
    );
  },
  hr() {
    return <hr className="border-[#E2E8F0] my-3" />;
  },
};

// Each single \n becomes \n\n so markdown treats every Enter as a new block
function preserveLineBreaks(text: string): string {
  return text.split('\n').join('\n\n');
}

export default function MentionText({ text, className = '' }: MentionTextProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {preserveLineBreaks(text)}
      </ReactMarkdown>
    </div>
  );
}
