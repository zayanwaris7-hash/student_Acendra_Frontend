"use client";

import { MessageCircle } from "lucide-react";

import { Conversation, ChatMessage } from "@/types/chatType";
import MessageList from "./messageList";
import MessageInput from "./messageINput";

interface Props {
  conversation: Conversation | null;
  messages: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export default function ChatWindow({
  conversation,
  messages,
  isTyping,
  onSendMessage,
  onTyping,
}: Props) {
  if (!conversation) {
    return (
      <section className="hidden flex-1 flex-col items-center justify-center bg-background md:flex">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MessageCircle size={30} className="text-primary" />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Your messages
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Select a conversation to start chatting.
        </p>
      </section>
    );
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-border p-4">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary/10">
          {conversation.otherUser.avatarUrl ? (
            <img
              src={conversation.otherUser.avatarUrl}
              alt={conversation.otherUser.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-semibold text-primary">
              {conversation.otherUser.name?.charAt(0) ?? "U"}
            </span>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-foreground">
            {conversation.otherUser.name}
          </h2>

          <p className="text-xs text-muted-foreground">
            @{conversation.otherUser.username}
          </p>
        </div>
      </header>

      <MessageList
        messages={messages}
        otherUserId={conversation.otherUser.id}
        isTyping={isTyping}
      />

      <MessageInput
        onSend={onSendMessage}
        onTyping={onTyping}
      />
    </section>
  );
}