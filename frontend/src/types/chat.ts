export interface ChatUser {
  id: number;
  username: string;
  profile_picture: string | null;
  role_title: string;
}

export interface Message {
  id: number;
  sender: ChatUser;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  other_user: ChatUser;
  last_message: Message | null;
  unread_count: number;
  updated_at: string;
}
