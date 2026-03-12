import { useState, useEffect, useCallback } from 'react';
import type { Post } from '../types/post';
import * as postsApi from '../api/posts';

interface UsePostsParams {
  sort: 'recent' | 'trending';
  author?: 'me';
  liked?: boolean;
}

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  toggleLike: (postId: number, isLiked: boolean) => Promise<void>;
  addPost: (post: Post) => void;
  replacePost: (post: Post) => void;
  removePost: (postId: number) => void;
}

export function usePosts({ sort, author, liked }: UsePostsParams): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (page: number, append: boolean) => {
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      const data = await postsApi.fetchPosts({ sort, author, liked: liked ? 'true' : undefined, page });
      setPosts(prev => append ? [...prev, ...data.results] : data.results);
      setNextPage(data.next ? page + 1 : null);
      setError(null);
    } catch {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sort, author, liked]);

  useEffect(() => {
    setPosts([]);
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (nextPage && !loadingMore) fetchPage(nextPage, true);
  }, [nextPage, loadingMore, fetchPage]);

  const toggleLike = useCallback(async (postId: number, isLiked: boolean) => {
    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, is_liked: !isLiked, likes_count: p.likes_count + (isLiked ? -1 : 1) }
        : p
    ));
    try {
      if (isLiked) await postsApi.unlikePost(postId);
      else await postsApi.likePost(postId);
    } catch {
      // Rollback
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, is_liked: isLiked, likes_count: p.likes_count + (isLiked ? 1 : -1) }
          : p
      ));
    }
  }, []);

  const addPost = useCallback((post: Post) => {
    setPosts(prev => [post, ...prev]);
  }, []);

  const replacePost = useCallback((post: Post) => {
    setPosts(prev => prev.map(p => p.id === post.id ? post : p));
  }, []);

  const removePost = useCallback((postId: number) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }, []);

  return { posts, loading, loadingMore, hasMore: nextPage !== null, error, loadMore, toggleLike, addPost, replacePost, removePost };
}
