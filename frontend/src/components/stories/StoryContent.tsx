import { toDataUri } from '../../utils/image';
import type { Story } from '../../types/story';
import CodeHighlighter from './CodeHighlighter';

interface StoryContentProps {
  story: Story;
}

export default function StoryContent({ story }: StoryContentProps) {
  if (story.content_type === 'image') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-4">
        {story.media && (
          <img
            src={toDataUri(story.media)}
            alt=""
            className="max-h-[70vh] max-w-full rounded-xl object-contain"
          />
        )}
        {story.text && (
          <p className="text-white text-center mt-4 text-lg max-w-md">
            {story.text}
          </p>
        )}
      </div>
    );
  }

  if (story.content_type === 'text') {
    return (
      <div
        className="flex items-center justify-center flex-1 px-8"
        style={{ backgroundColor: story.background_color }}
      >
        <p className="text-white text-2xl font-semibold text-center max-w-lg leading-relaxed">
          {story.text}
        </p>
      </div>
    );
  }

  if (story.content_type === 'code') {
    return (
      <div className="flex items-center justify-center flex-1 px-4 bg-[#0F172A]">
        <div className="w-full max-w-lg">
          <CodeHighlighter code={story.code} language={story.language} />
        </div>
      </div>
    );
  }

  return null;
}
