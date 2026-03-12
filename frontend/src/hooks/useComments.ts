import { useState, useEffect, useCallback } from 'react';
import type { Comment } from '../types/comment';
import * as commentsApi from '../api/comments';

export function useComments(postId: number | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    commentsApi.fetchComments(postId)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [postId]);

  const submit = useCallback(async (content: string) => {
    if (!postId) return;
    const comment = await commentsApi.createComment(postId, content);
    setComments(prev => [...prev, comment]);
  }, [postId]);

  const edit = useCallback(async (commentId: number, content: string) => {
    const updated = await commentsApi.updateComment(commentId, content);
    setComments(prev => prev.map(c => c.id === commentId ? updated : c));
  }, []);

  const remove = useCallback(async (commentId: number) => {
    await commentsApi.deleteComment(commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  }, []);

  return { comments, loading, submit, edit, remove };
}
