"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Send } from "lucide-react";

interface Props {
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export default function MessageInput({
  onSend,
  onTyping,
}: Props) {
  const [content, setContent] = useState("");
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleChange = (value: string) => {
    setContent(value);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    const isTyping = value.trim().length > 0;
    onTyping(isTyping);

    if (isTyping) {
      typingTimeout.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const message = content.trim();

    if (!message) return;

    onSend(message);
    setContent("");
    onTyping(false);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 border-t border-border p-4"
    >
      <input
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Write a message..."
        maxLength={5000}
        className="h-12 flex-1 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary"
      />

      <button
        type="submit"
        disabled={!content.trim()}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={19} />
      </button>
    </form>
  );
}
