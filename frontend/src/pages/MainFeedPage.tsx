import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { usePosts } from '../hooks/usePosts';
import { useSuggestions } from '../hooks/useSuggestions';
import { useNotifications } from '../hooks/useNotifications';
import { createPost, deletePost as deletePostApi } from '../api/posts';
import type { Post } from '../types/post';
import TopBar from '../components/layout/TopBar';
import Sidebar from '../components/layout/Sidebar';
import RightSidebar from '../components/layout/RightSidebar';
import CreatePostBox from '../components/feed/CreatePostBox';
import PostList from '../components/feed/PostList';
import EditPostModal from '../components/modals/EditPostModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import EditProfileModal from '../components/modals/EditProfileModal';
import ChatWidget from '../components/chat/ChatWidget';

type View = 'feed' | 'my-posts' | 'liked';
type Sort = 'recent' | 'trending';

export default function MainFeedPage() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<View>('feed');
  const [sort, setSort] = useState<Sort>('recent');

  const {
    posts, loading, loadingMore, hasMore, loadMore,
    toggleLike, addPost, replacePost, removePost,
  } = usePosts({
    sort,
    author: activeView === 'my-posts' ? 'me' : undefined,
    liked: activeView === 'liked',
  });

  const { suggestions, following, loading: suggestionsLoading, loadingFollowing, follow, unfollow } = useSuggestions();
  const { notifications, unreadCount, loading: notifLoading, loadNotifications, markAllAsRead } = useNotifications();

  // Modal state
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleCreatePost = useCallback(async (payload: { title: string; content: string; media?: string }) => {
    const newPost = await createPost(payload);
    addPost(newPost);
  }, [addPost]);

  const handleDeleteConfirm = useCallback(async () => {
    if (deletingPostId === null) return;
    await deletePostApi(deletingPostId);
    removePost(deletingPostId);
    setDeletingPostId(null);
  }, [deletingPostId, removePost]);

  const handleSavePost = useCallback((updated: Post) => {
    replacePost(updated);
    setEditingPost(null);
  }, [replacePost]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <TopBar
        onLogout={logout}
        onEditProfile={() => setShowEditProfile(true)}
        notifications={notifications}
        unreadCount={unreadCount}
        onOpenNotifications={loadNotifications}
        onMarkAllRead={markAllAsRead}
        notificationsLoading={notifLoading}
      />

      <div className="flex max-w-[1200px] mx-auto pt-[72px] px-4 gap-6">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-[200px] shrink-0">
          <div className="sticky top-[72px]">
            <Sidebar
              activeView={activeView}
              onViewChange={setActiveView}
              sort={sort}
              onSortChange={setSort}
            />
          </div>
        </aside>

        {/* Main Feed */}
        <main className="flex-1 min-w-0 py-4 space-y-4">
          <CreatePostBox
            userAvatar={user.profile_picture}
            username={user.username}
            following={following}
            onSubmit={handleCreatePost}
          />

          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base text-[var(--text-primary)]">
              {activeView === 'my-posts' ? t('myPosts') : activeView === 'liked' ? t('likedPosts') : t('recentPosts')}
            </h2>
            <button className="text-xs font-semibold text-[var(--primary)] hover:underline">
              {t('markAllAsRead')}
            </button>
          </div>

          <PostList
            posts={posts}
            currentUserId={user.id}
            currentUserAvatar={user.profile_picture}
            currentUsername={user.username}
            following={following}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onLike={toggleLike}
            onEdit={setEditingPost}
            onDelete={setDeletingPostId}
          />
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:block w-[260px] shrink-0">
          <div className="sticky top-[72px] py-4">
            <RightSidebar
              suggestions={suggestions}
              following={following}
              onFollow={follow}
              onUnfollow={unfollow}
              loading={suggestionsLoading}
              loadingFollowing={loadingFollowing}
            />
          </div>
        </aside>
      </div>

      {/* Modals */}
      <EditPostModal
        isOpen={editingPost !== null}
        onClose={() => setEditingPost(null)}
        post={editingPost}
        onSave={handleSavePost}
      />

      <DeleteConfirmModal
        isOpen={deletingPostId !== null}
        onClose={() => setDeletingPostId(null)}
        onConfirm={handleDeleteConfirm}
      />

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />

      <ChatWidget />
    </div>
  );
}
