import { useState, useEffect, useCallback } from 'react';
import type { StoryGroup } from '../../types/story';
import Avatar from '../shared/Avatar';
import TimeAgo from '../shared/TimeAgo';
import StoryContent from './StoryContent';
import StoryReplyBar from './StoryReplyBar';

interface StoryViewerProps {
  groups: StoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
  onViewed: (storyId: number) => void;
  onReact: (storyId: number, emoji: string) => void;
  onReply: (storyId: number, content: string) => void;
}

const STORY_DURATION = 5000;
const TICK_INTERVAL = 50;

export default function StoryViewer({
  groups,
  initialGroupIndex,
  onClose,
  onViewed,
  onReact,
  onReply,
}: StoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];

  const goNext = useCallback(() => {
    const currentGroup = groups[groupIndex];
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex((i) => i + 1);
      setProgress(0);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [groupIndex, storyIndex, groups, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
      setProgress(0);
    } else if (groupIndex > 0) {
      setGroupIndex((i) => i - 1);
      const prevGroup = groups[groupIndex - 1];
      setStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  }, [groupIndex, storyIndex, groups]);

  // Mark story as viewed
  useEffect(() => {
    if (story && !story.is_viewed) {
      onViewed(story.id);
    }
  }, [story, onViewed]);

  // Auto-advance timer
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (TICK_INTERVAL / STORY_DURATION) * 100;
        if (next >= 100) {
          return 100;
        }
        return next;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [groupIndex, storyIndex]);

  // Advance when progress hits 100
  useEffect(() => {
    if (progress >= 100) {
      goNext();
    }
  }, [progress, goNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  if (!group || !story) return null;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const oneThird = rect.width / 3;

    if (x < oneThird) {
      goPrev();
    } else {
      goNext();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="relative w-full max-w-[420px] h-full max-h-[90vh] bg-[#1a1a2e] rounded-xl overflow-hidden flex flex-col">
        {/* Progress bars */}
        <div className="flex gap-1 px-3 pt-3 pb-1">
          {group.stories.map((s, i) => (
            <div
              key={s.id}
              className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white rounded-full transition-[width] duration-75 ease-linear"
                style={{
                  width:
                    i < storyIndex
                      ? '100%'
                      : i === storyIndex
                        ? `${progress}%`
                        : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <Avatar
              base64={group.author.profile_picture}
              username={group.author.username}
              size={36}
            />
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium">
                {group.author.username}
              </span>
              <TimeAgo
                date={story.created_at}
                className="text-white/50 text-xs"
              />
              {story.content_type === 'code' && story.language && (
                <span className="text-[11px] text-[#7494EC] font-medium bg-[rgba(116,148,236,0.2)] px-2 py-0.5 rounded">
                  {story.language}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Story content — click to navigate */}
        <div
          className="flex-1 flex cursor-pointer select-none overflow-hidden"
          onClick={handleClick}
        >
          <StoryContent story={story} />
        </div>

        {/* Reply bar */}
        <StoryReplyBar
          onReact={(emoji) => onReact(story.id, emoji)}
          onReply={(content) => onReply(story.id, content)}
        />
      </div>
    </div>
  );
}
