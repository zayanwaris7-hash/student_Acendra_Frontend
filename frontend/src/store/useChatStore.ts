import { create } from "zustand";
import { chatService } from "@/services/chatService";
import {
  Conversation,
  ChatMessage,
} from "@/types/chatType";

interface ChatState {
  conversations: Conversation[];
  messages: ChatMessage[];
  selectedConversation: Conversation | null;

  isLoadingConversations: boolean;
  isLoadingMessages: boolean;

  fetchConversations: () => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  fetchMessages: (otherUserId: string) => Promise<void>;

  addMessage: (message: ChatMessage) => void;
  updateUnreadCount: (conversationId: string, count: number) => void;
  markConversationRead: (conversationId: string) => void;

  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  messages: [],
  selectedConversation: null,

  isLoadingConversations: false,
  isLoadingMessages: false,

  fetchConversations: async () => {
    try {
      set({ isLoadingConversations: true });

      const response = await chatService.getConversations();

      set({ conversations: response.data });
    } catch (error) {
      console.error("Fetch conversations error:", error);
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  selectConversation: (conversation) => {
    set({
      selectedConversation: conversation,
      messages: [],
    });
  },

  fetchMessages: async (otherUserId) => {
    try {
      set({ isLoadingMessages: true });

      const response = await chatService.getMessages(otherUserId);

      set({
        messages: response.messages,
      });
    } catch (error) {
      console.error("Fetch messages error:", error);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  addMessage: (message) => {
    set((state) => {
      const exists = state.messages.some(
        (item) => item.id === message.id
      );

      if (exists) return state;

      const messages = [...state.messages, message];

      const conversations = state.conversations.map((conversation) => {
        if (
          conversation.otherUser.id !== message.senderId &&
          conversation.otherUser.id !== message.receiverId
        ) {
          return conversation;
        }

        return {
          ...conversation,
          lastMessage: message,
          lastMessageAt: message.createdAt,
        };
      });

      return {
        messages,
        conversations,
      };
    });
  },

  updateUnreadCount: (conversationId, count) => {
    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: count }
          : conversation
      ),
    }));
  },

  markConversationRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      ),
    }));
  },

  clearChat: () => {
    set({
      selectedConversation: null,
      messages: [],
    });
  },
}));