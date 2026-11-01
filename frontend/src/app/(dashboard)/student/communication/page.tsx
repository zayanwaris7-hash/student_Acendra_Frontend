
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";

import {
  connectChatSocket,
  disconnectChatSocket,
} from "@/utils/sockets";

import type {
  Conversation,
  ChatMessage,
} from "@/types/chatType";

import ConversationList from "@/app/(components)/converstaionList";
import ChatWindow from "@/app/(components)/communication-window";

interface NewMessagePayload {
  conversationId: string;
  message: ChatMessage;
}

interface TypingPayload {
  senderId: string;
  isTyping: boolean;
}

export default function CommunicationPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );
  const hydrated = useAuthStore((state) => state.hydrated);

  const conversations = useChatStore(
    (state) => state.conversations
  );
  const messages = useChatStore((state) => state.messages);
  const selectedConversation = useChatStore(
    (state) => state.selectedConversation
  );

  const fetchConversations = useChatStore(
    (state) => state.fetchConversations
  );
  const selectConversation = useChatStore(
    (state) => state.selectConversation
  );
  const fetchMessages = useChatStore(
    (state) => state.fetchMessages
  );
  const addMessage = useChatStore(
    (state) => state.addMessage
  );
  const markConversationRead = useChatStore(
    (state) => state.markConversationRead
  );

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  // Fetch conversations
  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;

    void fetchConversations();
  }, [hydrated, isAuthenticated, fetchConversations]);

  // Connect socket and register listeners
  useEffect(() => {
    if (!hydrated || !isAuthenticated || !accessToken) {
      return;
    }

    const chatSocket = connectChatSocket(accessToken);

    setSocket(chatSocket);

    const handleNewMessage = (payload: NewMessagePayload) => {
      const message = payload?.message;

      if (
        !payload?.conversationId ||
        !message?.id ||
        !message?.senderId ||
        !message?.receiverId
      ) {
        console.error(
          "Invalid chat message payload:",
          payload
        );
        return;
      }

      addMessage(message);

      const currentChat =
        useChatStore.getState().selectedConversation;

      const isCurrentConversation =
        currentChat?.id === payload.conversationId;

      if (isCurrentConversation) {
        // Only mark messages from the other user as read.
        if (message.senderId === currentChat.otherUser.id) {
          markConversationRead(currentChat.id);

          chatSocket.emit("chat:messages:read", {
            senderId: currentChat.otherUser.id,
          });
        }
      } else {
        void fetchConversations();
      }
    };

    const handleTyping = (payload: TypingPayload) => {
      const currentChat =
        useChatStore.getState().selectedConversation;

      if (!currentChat) return;

      if (currentChat.otherUser.id === payload?.senderId) {
        setIsOtherUserTyping(payload.isTyping);
      }
    };

    const handleConnect = () => {
      console.log("Chat socket connected:", chatSocket.id);

      const currentChat =
        useChatStore.getState().selectedConversation;

      if (!currentChat) return;

      chatSocket.emit("chat:join", {
        conversationId: currentChat.id,
      });

      chatSocket.emit("chat:messages:read", {
        senderId: currentChat.otherUser.id,
      });

      markConversationRead(currentChat.id);
    };

    const handleDisconnect = (reason: string) => {
      console.log("Chat socket disconnected:", reason);
      setIsOtherUserTyping(false);
    };

    chatSocket.on("connect", handleConnect);
    chatSocket.on("disconnect", handleDisconnect);
    chatSocket.on("chat:message:new", handleNewMessage);
    chatSocket.on("chat:typing", handleTyping);

    // Handle an already-connected socket.
    if (chatSocket.connected) {
      handleConnect();
    }

    return () => {
      chatSocket.off("connect", handleConnect);
      chatSocket.off("disconnect", handleDisconnect);
      chatSocket.off("chat:message:new", handleNewMessage);
      chatSocket.off("chat:typing", handleTyping);

      disconnectChatSocket();
      setSocket(null);
    };
  }, [
    hydrated,
    isAuthenticated,
    accessToken,
    addMessage,
    markConversationRead,
    fetchConversations,
  ]);

  // Join conversation when the user switches chats.
  useEffect(() => {
    if (!socket?.connected || !selectedConversation) {
      setIsOtherUserTyping(false);
      return;
    }

    socket.emit("chat:join", {
      conversationId: selectedConversation.id,
    });

    socket.emit("chat:messages:read", {
      senderId: selectedConversation.otherUser.id,
    });

    markConversationRead(selectedConversation.id);
    setIsOtherUserTyping(false);
  }, [socket, selectedConversation, markConversationRead]);

  // Select conversation and load message history.
  const handleSelectConversation = useCallback(
    async (conversation: Conversation) => {
      selectConversation(conversation);
      setIsOtherUserTyping(false);

      await fetchMessages(conversation.otherUser.id);
    },
    [selectConversation, fetchMessages]
  );

  // Send text message.
  const handleSendMessage = useCallback(
    (content: string) => {
      if (!socket?.connected || !selectedConversation) {
        console.error("Chat socket is not connected.");
        return;
      }

      socket.emit("chat:message:send", {
        receiverId: selectedConversation.otherUser.id,
        content,
      });
    },
    [socket, selectedConversation]
  );

  // Send typing status.
  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket?.connected || !selectedConversation) {
        return;
      }

      socket.emit("chat:typing", {
        receiverId: selectedConversation.otherUser.id,
        isTyping,
      });
    },
    [socket, selectedConversation]
  );

  return (
    <main className="h-[calc(100vh-80px)] p-4 md:p-6">
      <div className="mx-auto flex h-full max-w-7xl overflow-hidden rounded-2xl border border-border bg-card">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          onSelect={handleSelectConversation}
        />

        <ChatWindow
          conversation={selectedConversation}
          messages={messages}
          isTyping={isOtherUserTyping}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      </div>
    </main>
  );
}
