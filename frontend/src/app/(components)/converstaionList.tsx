"use client";

import { Search } from "lucide-react";
import { Conversation } from "@/types/chatType";

interface Props {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelect: (conversation: Conversation) => void;
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  onSelect,
}: Props) {
  return (
    <aside className="flex w-full flex-col border-r border-border md:w-[350px] lg:w-[380px]">
      <div className="border-b border-border p-5">
        <h1 className="text-xl font-semibold text-foreground">
          Messages
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Your conversations
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
          <Search size={18} className="text-muted-foreground" />

          <input
            type="text"
            placeholder="Search conversations..."
            className="h-11 w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No conversations yet.
          </div>
        ) : (
          conversations.map((conversation) => {
            const isSelected =
              selectedConversationId === conversation.id;

            return (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={`flex w-full items-center gap-3 border-b border-border p-4 text-left transition hover:bg-muted ${
                  isSelected ? "bg-muted" : ""
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
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

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {conversation.otherUser.name}
                    </h3>

                    {conversation.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {conversation.lastMessage?.content ||
                      "Start a conversation"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}