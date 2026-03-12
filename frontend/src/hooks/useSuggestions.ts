import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types/user';
import * as usersApi from '../api/users';

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);

  useEffect(() => {
    usersApi.fetchSuggestions()
      .then(setSuggestions)
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));

    usersApi.fetchFollowing()
      .then(setFollowing)
      .catch(() => setFollowing([]))
      .finally(() => setLoadingFollowing(false));
  }, []);

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

  return { suggestions, following, loading, loadingFollowing, follow, unfollow };
}
