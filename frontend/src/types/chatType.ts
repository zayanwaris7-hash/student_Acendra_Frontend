export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
}

export interface ChatUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}

export interface LastMessage {
  id: string;
  senderId: string;
  receiverId: string;
  type: MessageType;
  content: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  otherUser: ChatUser;
  lastMessage: LastMessage | null;
  unreadCount: number;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ConversationsResponse {
  data: Conversation[];
  pagination: Pagination;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  type: MessageType;
  content: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}