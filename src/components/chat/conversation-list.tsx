"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAppStore, type Conversation } from "@/store";
import { animate, stagger } from "animejs";

export function ConversationList() {
  const {
    conversations,
    currentConversationId,
    setConversations,
    setCurrentConversation,
    setMessages,
    addConversation,
    removeConversation,
    setError,
    clearChat,
  } = useAppStore();

  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  // Fetch conversations on mount
  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch("/api/conversations");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setConversations(data);
      } catch {
        setError("Could not load conversations");
      } finally {
        setIsLoadingList(false);
      }
    }
    fetchConversations();
  }, [setConversations, setError]);

  // Slide-in animation for conversation items on first render
  useEffect(() => {
    if (isLoadingList || hasAnimated.current || !listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLElement>("[data-convo]");
    if (items.length === 0) return;
    hasAnimated.current = true;

    items.forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = "translateX(-12px)";
    });

    animate(items, {
      opacity: [0, 1],
      translateX: [-12, 0],
      duration: 300,
      ease: "outQuad",
      delay: stagger(50),
    });
  }, [isLoadingList, conversations]);

  async function handleNewConversation() {
    setIsCreating(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.status === 429) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      if (!res.ok) throw new Error("Failed to create");

      const conversation = await res.json();
      addConversation(conversation);
      setCurrentConversation(conversation.id);
      setMessages([]);
    } catch {
      setError("Could not create conversation");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSelectConversation(id: string) {
    setCurrentConversation(id);
    // Fetch messages for this conversation
    try {
      const res = await fetch(`/api/conversations/${id}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(
        data.messages.map(
          (m: { id: string; role: string; content: string; createdAt: string }) => ({
            id: m.id,
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
            createdAt: m.createdAt,
          })
        )
      );
    } catch {
      setError("Could not load messages");
    }
  }

  async function handleDeleteConversation() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/conversations/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      removeConversation(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      setError("Could not delete conversation");
    } finally {
      setIsDeleting(false);
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-AU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <Button
          className="w-full h-8 text-xs px-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-sm"
          onClick={handleNewConversation}
          disabled={isCreating}
        >
          {isCreating ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5 mr-1.5" />
          )}
          New Conversation
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoadingList ? (
          <div className="space-y-2 p-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-md bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No conversations yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start a new conversation to begin
            </p>
          </div>
        ) : (
          <div ref={listRef} className="p-2 space-y-1">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                data-convo
                className={cn(
                  "group flex items-center gap-2 rounded-md px-2.5 py-2 cursor-pointer transition-colors",
                  currentConversationId === convo.id
                    ? "border-l-2 border-primary bg-purple-50/40 text-foreground"
                    : "border-l-2 border-transparent hover:bg-purple-50/60 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => handleSelectConversation(convo.id)}
              >
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <p className="text-sm font-medium truncate flex-1">
                    {convo.title || "New Conversation"}
                  </p>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDate(convo.updatedAt)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(convo);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* New conversation hint at bottom */}
      <div className="p-3 border-t border-border">
        <button
          onClick={clearChat}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
        >
          Clear selection
        </button>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete conversation?</DialogTitle>
            <DialogDescription>
              This will permanently delete this conversation and all its
              messages. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConversation}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
