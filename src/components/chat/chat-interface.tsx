"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { MessageCircle, AlertCircle, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { CrisisBanner } from "./crisis-banner";
import { ResourceSuggestions } from "./resource-suggestions";
import { useAppStore } from "@/store";

export function ChatInterface() {
  const {
    currentConversationId,
    messages,
    isLoading,
    isCrisis,
    error,
    addMessage,
    setIsLoading,
    setIsCrisis,
    setError,
    setCurrentConversation,
    addConversation,
  } = useAppStore();

  const [inputValue, setInputValue] = useState("");
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(false);
  const [srAnnouncement, setSrAnnouncement] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard shortcut: Ctrl/Cmd+K for new conversation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        useAppStore.getState().clearChat();
        setInputValue("");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMessage = {
      id: `temp-${Date.now()}`,
      role: "user" as const,
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          conversationId: currentConversationId,
        }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setError(data.error);
        setSrAnnouncement("Rate limit reached. Please try again later.");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      const data = await res.json();

      // If this was a new conversation, update the conversation ID
      if (!currentConversationId && data.conversationId) {
        setCurrentConversation(data.conversationId);
        // Add to conversation list
        addConversation({
          id: data.conversationId,
          title: trimmed.substring(0, 50),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Add assistant response
      addMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        createdAt: new Date().toISOString(),
      });

      // Screen reader announcement
      setSrAnnouncement("New response received from MindSupport.");

      // Handle crisis flag
      if (data.isCrisis) {
        setIsCrisis(true);
        setSrAnnouncement(
          "Crisis support resources are now displayed. If you are in danger, please call triple zero."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    inputValue,
    isLoading,
    currentConversationId,
    addMessage,
    setIsLoading,
    setError,
    setIsCrisis,
    setCurrentConversation,
    addConversation,
  ]);

  return (
    <div className="flex flex-col h-full" role="region" aria-label="Chat conversation">
      {/* Screen reader live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {srAnnouncement}
      </div>

      {/* Disclaimer banner */}
      {!disclaimerDismissed && (
        <div className="flex items-center justify-between bg-muted/50 border-b border-border px-4 py-2">
          <p className="text-xs text-muted-foreground">
            This is a support tool, not professional medical advice. For
            emergencies, call{" "}
            <a href="tel:000" className="font-bold underline">
              000
            </a>{" "}
            or Lifeline{" "}
            <a href="tel:131114" className="font-bold underline">
              13 11 14
            </a>
          </p>
          <button
            onClick={() => setDisclaimerDismissed(true)}
            className="text-xs text-muted-foreground hover:text-foreground ml-4 shrink-0"
            aria-label="Dismiss disclaimer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Crisis banner */}
      {isCrisis && <CrisisBanner forcedOpen />}

      {/* Messages area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="max-w-3xl mx-auto py-4 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <MessageCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Welcome to MindSupport Victoria
              </h2>
              <p className="text-sm text-muted-foreground text-center max-w-md leading-relaxed">
                I&apos;m here to listen and support you. You can talk about
                what you&apos;re feeling, ask about coping strategies, or find
                local mental health resources.
              </p>
              <p className="text-xs text-muted-foreground text-center mt-4 max-w-md">
                Remember: I&apos;m an AI support tool, not a therapist. For
                professional help, consider asking your GP about a Mental Health
                Care Plan.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                createdAt={msg.createdAt}
              />
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 px-4 py-3" role="status" aria-label="Generating response">
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" />
                </div>
              </div>
              <div className="rounded-xl bg-muted px-4 py-2.5">
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2 mx-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-destructive hover:text-destructive"
                onClick={() => {
                  setError(null);
                  handleSend();
                }}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Retry
              </Button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Resource suggestions + Chat input */}
      {currentConversationId && messages.length > 0 && (
        <div className="flex items-center px-4 pt-2">
          <ResourceSuggestions conversationId={currentConversationId} />
        </div>
      )}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
}
