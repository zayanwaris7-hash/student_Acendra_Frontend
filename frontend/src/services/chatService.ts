import { ChatMessage, ConversationsResponse } from "@/types/chatType";
import { api } from "@/utils/axios";

export const chatService = {
  // Get all conversations
  getConversations: async (
    page = 1,
    limit = 20
  ): Promise<ConversationsResponse> => {
    const response = await api.get(
      `/chats/conversations?page=${page}&limit=${limit}`
    );

    return response.data;
  },

  // Get messages between two users
  getMessages: async (
    otherUserId: string,
    page = 1,
    limit = 30
  ) => {
    const response = await api.get(
      `/chats/${otherUserId}/messages?page=${page}&limit=${limit}`
    );

    return response.data as {
      conversationId: string;
      messages: ChatMessage[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  },

  // Mark messages as read
  markAsRead: async (otherUserId: string) => {
    const response = await api.patch(
      `/chats/${otherUserId}/read`
    );

    return response.data;
  },
};