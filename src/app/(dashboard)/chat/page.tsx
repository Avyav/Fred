"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationList } from "@/components/chat/conversation-list";
import { ChatInterface } from "@/components/chat/chat-interface";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { isSidebarOpen, setIsSidebarOpen } = useAppStore();

  return (
    <div className="flex h-[calc(100vh-theme(spacing.24))]">
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r border-border bg-muted/30 transition-all duration-200 flex-shrink-0",
          isSidebarOpen ? "w-72" : "w-0 overflow-hidden",
          // Mobile: overlay
          "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:top-[theme(spacing.24)]",
          !isSidebarOpen && "max-md:w-0"
        )}
      >
        <ConversationList />
      </aside>

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <span className="text-xs text-muted-foreground">
            Ctrl+K for new conversation
          </span>
        </div>

        <ChatInterface />
      </div>
    </div>
  );
}
