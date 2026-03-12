import { useEffect, useRef } from 'react';
import type { Post } from '../../types/post';
import Spinner from '../shared/Spinner';
import PostCard from './PostCard';
import { useLanguage } from '../../i18n/LanguageContext';

interface PostListProps {
  posts: Post[];
  currentUserId: number;
  currentUserAvatar: string | null;
  currentUsername: string;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onLike: (postId: number, isLiked: boolean) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: number) => void;
}

export default function PostList({
  posts,
  currentUserId,
  currentUserAvatar,
  currentUsername,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onLike,
  onEdit,
  onDelete,
}: PostListProps) {
  const { t } = useLanguage();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingMore, onLoadMore]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={32} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-sm text-[#94A3B8]">
          {t('noPostsYet')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          currentUserAvatar={currentUserAvatar}
          currentUsername={currentUsername}
          onLike={onLike}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {loadingMore && (
        <div className="flex justify-center py-4">
          <Spinner size={24} />
        </div>
      )}
    </div>
  );
}
