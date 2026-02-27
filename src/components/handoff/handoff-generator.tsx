"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HandoffSummaryView,
  type HandoffSummary,
} from "./handoff-summary-view";

interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export function HandoffGenerator() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<HandoffSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  function toggleConversation(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    if (selected.size === conversations.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(conversations.map((c) => c.id)));
    }
  }

  async function handleGenerate() {
    if (selected.size === 0) return;
    setIsGenerating(true);
    setError(null);
    setSummary(null);

    try {
      const res = await fetch("/api/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationIds: Array.from(selected) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate summary");
      }

      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      {/* Summary result */}
      {summary && (
        <div className="print:m-0">
          <HandoffSummaryView summary={summary} />
        </div>
      )}

      {/* Conversation selector — hidden in print */}
      <div className="print:hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">
            Select conversations to include
          </h2>
          {conversations.length > 0 && (
            <button
              onClick={selectAll}
              className="text-xs text-primary hover:underline"
            >
              {selected.size === conversations.length
                ? "Deselect all"
                : "Select all"}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-3">
            {error}
          </div>
        )}

        {isLoadingList ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">
                No conversations yet. Start chatting with FRED to generate a
                summary.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto border border-border rounded-lg p-2">
            {conversations.map((convo) => (
              <label
                key={convo.id}
                className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(convo.id)}
                  onChange={() => toggleConversation(convo.id)}
                  className="h-4 w-4 rounded border-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {convo.title || "New Conversation"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(convo.createdAt)}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <Button
          className="w-full mt-4"
          onClick={handleGenerate}
          disabled={selected.size === 0 || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating summary...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Generate Comprehensive Summary
              {selected.size > 0 && ` (${selected.size})`}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
