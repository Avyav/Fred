"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CrisisFlag {
  id: string;
  userId: string;
  conversationId: string | null;
  severity: string;
  indicators: string[];
  messageSnippet: string;
  handled: boolean;
  handledBy: string | null;
  handledAt: string | null;
  notes: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  unhandled: number;
  bySeverity: { high: number; medium: number; low: number };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function CrisisFlagsDashboard() {
  const [flags, setFlags] = useState<CrisisFlag[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [severityFilter, setSeverityFilter] = useState("");
  const [handledFilter, setHandledFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [handlingId, setHandlingId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const fetchFlags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (severityFilter) params.set("severity", severityFilter);
      if (handledFilter) params.set("handled", handledFilter);
      params.set("page", String(currentPage));

      const res = await fetch(`/api/crisis/flag?${params.toString()}`);
      if (res.status === 403) {
        setError("Access denied. Admin privileges required.");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFlags(data.flags);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch {
      setError("Could not load crisis flags.");
    } finally {
      setIsLoading(false);
    }
  }, [severityFilter, handledFilter, currentPage]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  async function handleMarkHandled(flagId: string) {
    setHandlingId(flagId);
    try {
      const res = await fetch("/api/crisis/flag", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flagId,
          notes: noteInputs[flagId] || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchFlags();
      setNoteInputs((prev) => {
        const next = { ...prev };
        delete next[flagId];
        return next;
      });
    } catch {
      setError("Failed to mark flag as handled.");
    } finally {
      setHandlingId(null);
    }
  }

  function severityColor(severity: string) {
    switch (severity) {
      case "high":
        return "text-destructive bg-destructive/10";
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "low":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
      default:
        return "text-muted-foreground bg-muted";
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (error === "Access denied. Admin privileges required.") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">
          Access Denied
        </h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="h-6 w-6" />
          Crisis Flags Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor and manage crisis-flagged conversations.
        </p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Total Flags</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/30">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-destructive">Unhandled</p>
              <p className="text-2xl font-bold text-destructive">
                {stats.unhandled}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">High Severity</p>
              <p className="text-2xl font-bold text-destructive">
                {stats.bySeverity.high}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Medium</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.bySeverity.medium}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Low</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.bySeverity.low}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-1" />
          Filters
        </Button>
        <Button variant="outline" size="sm" onClick={fetchFlags}>
          Refresh
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 mb-4 rounded-lg bg-muted/50 border border-border">
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={handledFilter}
            onChange={(e) => {
              setHandledFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="">All Status</option>
            <option value="false">Unhandled</option>
            <option value="true">Handled</option>
          </select>
          {(severityFilter || handledFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSeverityFilter("");
                setHandledFilter("");
                setCurrentPage(1);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="text-center py-16 text-destructive">{error}</div>
      )}

      {/* Flag list */}
      {!isLoading && !error && (
        <ScrollArea className="h-[calc(100vh-24rem)]">
          <div className="space-y-3 pr-4">
            {flags.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No crisis flags found.
              </div>
            ) : (
              flags.map((flag) => (
                <Card
                  key={flag.id}
                  className={
                    !flag.handled ? "border-destructive/20" : undefined
                  }
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-medium rounded-full px-2 py-0.5 capitalize ${severityColor(flag.severity)}`}
                        >
                          {flag.severity}
                        </span>
                        {flag.handled ? (
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Handled
                          </span>
                        ) : (
                          <span className="text-xs text-destructive flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Unhandled
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(flag.createdAt)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono shrink-0">
                        User: {flag.userId}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* Indicators */}
                    {flag.indicators.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {flag.indicators.map((indicator, i) => (
                          <span
                            key={i}
                            className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground"
                          >
                            {indicator}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Message snippet */}
                    {flag.messageSnippet && (
                      <div className="rounded-md bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground italic">
                          &quot;{flag.messageSnippet}&quot;
                        </p>
                      </div>
                    )}

                    {/* Handled info */}
                    {flag.handled && flag.handledAt && (
                      <p className="text-xs text-muted-foreground">
                        Handled at {formatDate(flag.handledAt)}
                        {flag.notes && ` — Notes: ${flag.notes}`}
                      </p>
                    )}

                    {/* Handle action */}
                    {!flag.handled && (
                      <div className="flex items-center gap-2 pt-1">
                        <Input
                          placeholder="Add notes (optional)"
                          value={noteInputs[flag.id] || ""}
                          onChange={(e) =>
                            setNoteInputs((prev) => ({
                              ...prev,
                              [flag.id]: e.target.value,
                            }))
                          }
                          className="text-sm h-8 flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 shrink-0"
                          disabled={handlingId === flag.id}
                          onClick={() => handleMarkHandled(flag.id)}
                        >
                          {handlingId === flag.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          )}
                          Mark Handled
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= pagination.pages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}
