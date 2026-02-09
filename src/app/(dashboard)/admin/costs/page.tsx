"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CostData {
  period: string;
  totalMessages: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCachedTokens: number;
  totalCostCents: number;
  cacheHitRate: number;
  uniqueUsers: number;
  perUserAvgCost: number;
  monthlyProjection: number;
  dailyBreakdown: {
    date: string;
    messages: number;
    inputTokens: number;
    outputTokens: number;
    cachedTokens: number;
    costCents: number;
    uniqueUsers: number;
  }[];
}

export default function CostsDashboard() {
  const [data, setData] = useState<CostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchCosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/costs?days=${days}`);
      if (res.status === 403) {
        setError("Access denied. Admin privileges required.");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      setData(await res.json());
    } catch {
      setError("Could not load cost data.");
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  function formatCost(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function formatTokens(tokens: number): string {
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
    return String(tokens);
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
          <DollarSign className="h-6 w-6" />
          Cost Monitoring
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          API costs, token usage, and cache performance.
        </p>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2 mb-6">
        {[7, 14, 30, 90].map((d) => (
          <Button
            key={d}
            variant={days === d ? "default" : "outline"}
            size="sm"
            onClick={() => setDays(d)}
          >
            {d}d
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={fetchCosts}>
          Refresh
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center py-16 text-destructive">{error}</div>
      )}

      {!isLoading && !error && data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Total Cost ({days}d)
                  </p>
                </div>
                <p className="text-2xl font-bold">
                  {formatCost(data.totalCostCents)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Monthly Projection
                  </p>
                </div>
                <p className="text-2xl font-bold">
                  {formatCost(data.monthlyProjection)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Active Users</p>
                </div>
                <p className="text-2xl font-bold">{data.uniqueUsers}</p>
                <p className="text-xs text-muted-foreground">
                  Avg {formatCost(data.perUserAvgCost)}/user
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Cache Hit Rate
                  </p>
                </div>
                <p className="text-2xl font-bold">{data.cacheHitRate}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Token usage summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Token Usage Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Messages
                  </p>
                  <p className="text-lg font-semibold">
                    {data.totalMessages.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Input Tokens</p>
                  <p className="text-lg font-semibold">
                    {formatTokens(data.totalInputTokens)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Output Tokens</p>
                  <p className="text-lg font-semibold">
                    {formatTokens(data.totalOutputTokens)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Cached Tokens
                  </p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatTokens(data.totalCachedTokens)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily breakdown table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[400px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium">
                        Date
                      </th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">
                        Messages
                      </th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">
                        Users
                      </th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">
                        Input
                      </th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">
                        Output
                      </th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">
                        Cached
                      </th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.dailyBreakdown.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No usage data for this period.
                        </td>
                      </tr>
                    ) : (
                      [...data.dailyBreakdown].reverse().map((day) => (
                        <tr
                          key={day.date}
                          className="border-b border-border last:border-0 hover:bg-muted/50"
                        >
                          <td className="px-4 py-2 font-mono text-xs">
                            {day.date}
                          </td>
                          <td className="text-right px-4 py-2">
                            {day.messages}
                          </td>
                          <td className="text-right px-4 py-2">
                            {day.uniqueUsers}
                          </td>
                          <td className="text-right px-4 py-2 font-mono text-xs">
                            {formatTokens(day.inputTokens)}
                          </td>
                          <td className="text-right px-4 py-2 font-mono text-xs">
                            {formatTokens(day.outputTokens)}
                          </td>
                          <td className="text-right px-4 py-2 font-mono text-xs text-green-600 dark:text-green-400">
                            {formatTokens(day.cachedTokens)}
                          </td>
                          <td className="text-right px-4 py-2 font-semibold">
                            {formatCost(day.costCents)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
