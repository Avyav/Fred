"use client";

import { useEffect, useState } from "react";
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
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-sm"
          size="sm"
          onClick={handleNewConversation}
          disabled={isCreating}
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
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
          <div className="p-2 space-y-1">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-3 py-2.5 cursor-pointer transition-colors",
                  currentConversationId === convo.id
                    ? "bg-purple-100/60 text-foreground"
                    : "hover:bg-purple-50/60 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => handleSelectConversation(convo.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {convo.title || "New Conversation"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(convo.updatedAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(convo);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
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
