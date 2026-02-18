"use client";

import { useState } from "react";
import { User, Copy, Check } from "lucide-react";
import { FredMorphIcon } from "@/components/ui/fred-morph-icon";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export function ChatMessage({ role, content, createdAt }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const timestamp = new Date(createdAt).toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "group flex gap-3 px-4 py-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {isUser ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      ) : (
        <FredMorphIcon size={32} className="shrink-0" />
      )}

      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-gradient-to-br from-primary to-purple-600 text-primary-foreground shadow-md shadow-purple-500/10"
            : "bg-white text-foreground shadow-sm border border-purple-50"
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:my-1">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}

        {/* Timestamp + copy on hover */}
        <div
          className={cn(
            "absolute -bottom-5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground",
            isUser ? "right-0" : "left-0"
          )}
        >
          <span>{timestamp}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 hover:bg-transparent"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
