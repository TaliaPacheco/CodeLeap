import { createElement } from 'react';

export function parseMentions(text: string): (string | React.ReactElement)[] {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return createElement(
        'span',
        {
          key: i,
          className: 'text-[#7494EC] font-medium cursor-pointer hover:underline',
        },
        part
      );
    }
    return part;
  });
}
