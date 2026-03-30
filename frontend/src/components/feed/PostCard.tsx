import { useState } from 'react';
import type { Post } from '../../types/post';
import type { User } from '../../types/user';
import { toDataUri } from '../../utils/image';
import { useComments } from '../../hooks/useComments';
import { useLanguage } from '../../i18n/LanguageContext';
import Avatar from '../shared/Avatar';
import MentionText from '../shared/MentionText';
import MentionInput from '../shared/MentionInput';
import TimeAgo from '../shared/TimeAgo';
import Spinner from '../shared/Spinner';

interface PostCardProps {
  post: Post;
  currentUserId: number;
  currentUserAvatar: string | null;
  currentUsername: string;
  following: User[];
  onLike: (postId: number, isLiked: boolean) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: number) => void;
}

export default function PostCard({ post, currentUserId, currentUserAvatar, currentUsername, following, onLike, onEdit, onDelete }: PostCardProps) {
  const { t } = useLanguage();
  const isOwner = post.author.id === currentUserId;
  const [showComments, setShowComments] = useState(false);
  const { comments, loading: commentsLoading, submit, edit, remove } = useComments(showComments ? post.id : null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  function handleShare() {
    const url = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(url).catch(() => {
      alert(`Link: ${url}`);
    });
  }

  async function handleSubmitComment() {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await submit(commentText.trim());
      setCommentText('');
    } finally {
      setSubmitting(false);
    }
  }

  function startEditComment(commentId: number, content: string) {
    setEditingCommentId(commentId);
    setEditingCommentText(content);
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setEditingCommentText('');
  }

  async function handleSaveComment() {
    if (!editingCommentId || !editingCommentText.trim()) return;
    await edit(editingCommentId, editingCommentText.trim());
    setEditingCommentId(null);
    setEditingCommentText('');
  }

  async function handleConfirmDeleteComment() {
    if (!deletingCommentId) return;
    await remove(deletingCommentId);
    setDeletingCommentId(null);
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-[12px] border border-[var(--border)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar base64={post.author.profile_picture} username={post.author.username} size={40} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm text-[var(--text-primary)]">@{post.author.username}</span>
              <span className="text-xs text-[var(--text-placeholder)]">&middot;</span>
              <TimeAgo date={post.created_at} className="text-xs text-[var(--text-placeholder)]" />
            </div>
            {post.author.role_title && (
              <span className="text-xs text-[var(--primary)]">{post.author.role_title}</span>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(post)}
              className="text-[var(--text-placeholder)] hover:text-[var(--primary)] transition-colors cursor-pointer"
              aria-label="Edit post"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onDelete(post.id)}
              className="text-[var(--text-placeholder)] hover:text-[var(--danger)] transition-colors cursor-pointer"
              aria-label="Delete post"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      {post.title && (
        <h3 className="font-semibold text-base text-[var(--text-primary)] mt-3">{post.title}</h3>
      )}

      {/* Content */}
      <div className="mt-2">
        <MentionText text={post.content} className="text-sm text-[var(--text-secondary)] leading-relaxed" />
      </div>

      {/* Media */}
      {post.media && (
        <div className="mt-3 rounded-[8px] overflow-hidden">
          <img
            src={toDataUri(post.media)}
            alt="Post media"
            className="w-full object-cover max-h-[400px]"
          />
        </div>
      )}

      {/* Action bar */}
      <div className="mt-4 flex items-center gap-6 border-t border-[var(--border-light)] pt-3">
        {/* Like */}
        <button
          type="button"
          onClick={() => onLike(post.id, post.is_liked)}
          className="flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          {post.is_liked ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--danger)" stroke="var(--danger)" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-placeholder)]">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
          <span className={`text-sm ${post.is_liked ? 'text-[var(--danger)] font-medium' : 'text-[var(--text-placeholder)]'}`}>
            {post.likes_count}
          </span>
        </button>

        {/* Comments toggle */}
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 cursor-pointer transition-colors ${showComments ? 'text-[var(--primary)]' : 'text-[var(--text-placeholder)] hover:text-[var(--primary)]'}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-sm">{post.comments_count}</span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 text-[var(--text-placeholder)] hover:text-[var(--primary)] transition-colors cursor-pointer ml-auto"
          aria-label="Share post"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>

      {/* Comments panel */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-[var(--border-light)]">
          {/* Comments list */}
          {commentsLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size={20} />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-[var(--text-placeholder)] text-center py-3">{t('noComments')}</p>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto mb-3 pt-1">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5 group">
                  <Avatar base64={comment.user.profile_picture} username={comment.user.username} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-[var(--text-primary)]">@{comment.user.username}</span>
                      <TimeAgo date={comment.created_at} className="text-xs text-[var(--text-placeholder)]" />

                      {/* Edit / Delete / Confirm delete — only for own comments */}
                      {comment.user.id === currentUserId && editingCommentId !== comment.id && (
                        <div className="flex items-center gap-1.5 ml-auto">
                          {deletingCommentId === comment.id ? (
                            <>
                              <button
                                type="button"
                                onClick={handleConfirmDeleteComment}
                                className="text-[var(--danger)] font-semibold text-xs hover:underline cursor-pointer"
                              >
                                {t('deleteComment')}?
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingCommentId(null)}
                                className="text-[var(--text-placeholder)] font-semibold text-xs hover:underline cursor-pointer"
                              >
                                {t('cancelEdit')}
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => startEditComment(comment.id, comment.content)}
                                className="text-[var(--text-placeholder)] hover:text-[var(--primary)] transition-colors cursor-pointer"
                                aria-label={t('editComment')}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingCommentId(comment.id)}
                                className="text-[var(--text-placeholder)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                                aria-label={t('deleteComment')}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Inline edit mode */}
                    {editingCommentId === comment.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveComment(); if (e.key === 'Escape') cancelEditComment(); }}
                          className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-full px-3 py-1 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleSaveComment}
                          disabled={!editingCommentText.trim()}
                          className="text-[var(--primary)] font-semibold text-xs hover:underline disabled:opacity-40 cursor-pointer"
                        >
                          {t('saveComment')}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditComment}
                          className="text-[var(--text-placeholder)] font-semibold text-xs hover:underline cursor-pointer"
                        >
                          {t('cancelEdit')}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--text-secondary)] mt-0.5">{comment.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment input */}
          <div className="flex items-center gap-2.5">
            <Avatar base64={currentUserAvatar} username={currentUsername} size={28} />
            <div className="flex-1 flex items-center gap-2 bg-[var(--bg-input)] rounded-full px-3 py-1.5 border border-[var(--border)]">
              <MentionInput
                value={commentText}
                onChange={setCommentText}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitComment(); }}
                following={following}
                placeholder={t('writeComment')}
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none"
              />
              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submitting}
                className="text-[var(--primary)] font-semibold text-xs hover:underline disabled:opacity-40 disabled:no-underline"
              >
                {t('send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
