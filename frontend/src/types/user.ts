export interface User {
  id: number;
  username: string;
  email: string;
  profile_picture: string | null;
  bio: string;
  role_title: string;
  followers_count: number;
  following_count: number;
  date_joined: string;
  updated_at: string;
}

export interface UserUpdatePayload {
  username?: string;
  bio?: string;
  role_title?: string;
  profile_picture?: string;
}
