"use client";

import { useEffect, useRef } from "react";
import { Check, CheckCheck, FileText, Download } from "lucide-react";

import {
  ChatMessage,
  MessageType,
} from "@/types/chatType";

interface Props {
  messages: ChatMessage[];
  otherUserId: string;
  isTyping: boolean;
}

export default function MessageList({
  messages,
  otherUserId,
  isTyping,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const formatTime = (date?: string) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-5">
      {messages.map((message, index) => {
        const isMine = message.receiverId === otherUserId;

        // Fallback prevents missing React keys while debugging.
        const messageKey =
          message.id || `${message.senderId}-${message.createdAt}-${index}`;

        return (
          <div
            key={messageKey}
            className={`flex ${
              isMine ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                isMine
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-muted text-foreground"
              }`}
            >
              {message.attachmentUrl ? (
                <a
                  href={message.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm underline"
                >
                  <FileText size={18} />
                  <span className="break-all">
                    {message.attachmentName || "Open attachment"}
                  </span>
                  <Download size={15} />
                </a>
              ) : (
                <p className="whitespace-pre-wrap break-words text-sm">
                  {message.content || "Attachment"}
                </p>
              )}

              <div className="mt-2 flex items-center justify-end gap-1">
                <span className="text-[10px] opacity-70">
                  {formatTime(message.createdAt)}
                </span>

                {isMine &&
                  (message.isRead ? (
                    <CheckCheck size={14} />
                  ) : (
                    <Check size={14} />
                  ))}
              </div>
            </div>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
