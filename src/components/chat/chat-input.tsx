"use client";

import { useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_MESSAGE_LENGTH = 2000;

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  rateLimited?: boolean;
  rateLimitMessage?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  rateLimited = false,
  rateLimitMessage,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [value]);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !isLoading && !rateLimited) {
          onSend();
        }
      }
    },
    [value, isLoading, rateLimited, onSend]
  );

  const canSend = value.trim().length > 0 && !isLoading && !rateLimited;
  const charCount = value.length;
  const isOverLimit = charCount > MAX_MESSAGE_LENGTH;

  return (
    <div className="border-t border-purple-100 backdrop-blur-xl bg-background/80 px-3 py-2">
      {rateLimited && rateLimitMessage && (
        <div className="mb-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          {rateLimitMessage}
        </div>
      )}

      <div className="relative flex items-end gap-2 max-w-3xl mx-auto">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              rateLimited
                ? "Message limit reached"
                : "Type your message..."
            }
            disabled={rateLimited}
            rows={1}
            className="w-full resize-none rounded-xl border border-purple-200/60 bg-white/60 px-3 py-2.5 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
          <Button
            size="sm"
            className="absolute right-1.5 bottom-1.5 h-6 w-6 p-0 bg-gradient-to-br from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-sm"
            onClick={onSend}
            disabled={!canSend || isOverLimit}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between max-w-3xl mx-auto mt-1.5 px-1">
        <p className="text-xs text-muted-foreground">
          Shift+Enter for new line
        </p>
        <p
          className={`text-xs ${isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"}`}
        >
          {charCount}/{MAX_MESSAGE_LENGTH}
        </p>
      </div>
    </div>
  );
}
