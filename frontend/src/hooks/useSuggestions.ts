import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types/user';
import * as usersApi from '../api/users';

const PAGE_SIZE = 10;

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    usersApi.fetchSuggestions(PAGE_SIZE, 0)
      .then(({ results, total }) => {
        setSuggestions(results);
        setHasMore(results.length < total);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));

    usersApi.fetchFollowing()
      .then(data => setFollowing(Array.isArray(data) ? data : []))
      .catch(() => setFollowing([]))
      .finally(() => setLoadingFollowing(false));
  }, []);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const { results, total } = await usersApi.fetchSuggestions(PAGE_SIZE, suggestions.length);
      const all = [...suggestions, ...results];
      setSuggestions(all);
      setHasMore(all.length < total);
    } catch {
      // keep current list
    } finally {
      setLoadingMore(false);
    }
  }, [suggestions]);

  const follow = useCallback(async (username: string) => {
    await usersApi.followUser(username);
    const user = suggestions.find(u => u.username === username);
    setSuggestions(prev => prev.filter(u => u.username !== username));
    if (user) setFollowing(prev => [...prev, user]);
  }, [suggestions]);

  const unfollow = useCallback(async (username: string) => {
    await usersApi.unfollowUser(username);
    const user = following.find(u => u.username === username);
    setFollowing(prev => prev.filter(u => u.username !== username));
    if (user) setSuggestions(prev => [...prev, user]);
  }, [following]);

  return { suggestions, following, loading, loadingFollowing, loadingMore, hasMore, loadMore, follow, unfollow };
}
