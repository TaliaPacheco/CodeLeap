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
import { useStories } from '../hooks/useStories';
import StoryBar from '../components/stories/StoryBar';
import StoryViewer from '../components/stories/StoryViewer';
import CreateStoryModal from '../components/stories/CreateStoryModal';

type View = 'feed' | 'my-posts' | 'liked';
type Sort = 'recent' | 'trending';

export default function MainFeedPage() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<View>('feed');
  const [sort, setSort] = useState<Sort>('recent');
  const [showMobilePeople, setShowMobilePeople] = useState(false);

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

  const { groups: storyGroups, loading: storiesLoading, createStory, markViewed, react: reactToStory, reply: replyToStory } = useStories();
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [viewerGroupIndex, setViewerGroupIndex] = useState<number | null>(null);

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

      <div className="flex max-w-[1200px] mx-auto pt-[72px] pb-16 lg:pb-0 px-2 sm:px-4 gap-6">
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
          <StoryBar
            groups={storyGroups}
            loading={storiesLoading}
            onOpenCreate={() => setShowCreateStory(true)}
            onOpenViewer={setViewerGroupIndex}
          />

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

      <CreateStoryModal
        isOpen={showCreateStory}
        onClose={() => setShowCreateStory(false)}
        onSubmit={createStory}
      />

      {viewerGroupIndex !== null && (
        <StoryViewer
          groups={storyGroups}
          initialGroupIndex={viewerGroupIndex}
          onClose={() => setViewerGroupIndex(null)}
          onViewed={markViewed}
          onReact={reactToStory}
          onReply={replyToStory}
        />
      )}

      <ChatWidget />

      {/* Mobile people panel */}
      {showMobilePeople && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobilePeople(false)} />
          <div className="absolute bottom-14 left-0 right-0 max-h-[70vh] overflow-y-auto bg-[var(--bg-page)] rounded-t-[16px] p-4">
            <RightSidebar
              suggestions={suggestions}
              following={following}
              onFollow={follow}
              onUnfollow={unfollow}
              loading={suggestionsLoading}
              loadingFollowing={loadingFollowing}
            />
          </div>
        </div>
      )}

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border)] flex items-center justify-around h-14 z-50 lg:hidden">
        <button
          type="button"
          onClick={() => { setActiveView('feed'); setShowMobilePeople(false); }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 ${activeView === 'feed' && !showMobilePeople ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9.5L12 2l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
          </svg>
          <span className="text-[10px] font-medium">{t('feed')}</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveView('my-posts'); setShowMobilePeople(false); }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 ${activeView === 'my-posts' && !showMobilePeople ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-[10px] font-medium">{t('myPosts')}</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveView('liked'); setShowMobilePeople(false); }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 ${activeView === 'liked' && !showMobilePeople ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="text-[10px] font-medium">{t('liked')}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowMobilePeople(!showMobilePeople)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 ${showMobilePeople ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="text-[10px] font-medium">{t('following')}</span>
        </button>
      </nav>
    </div>
  );
}
