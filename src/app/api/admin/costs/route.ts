import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (!user?.email?.endsWith("@admin.mindsupport.vic.gov.au")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30", 10);

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // Get all usage logs for the period
    const usageLogs = await prisma.usageLog.findMany({
      where: { date: { gte: sinceDate } },
      orderBy: { date: "desc" },
    });

    // Aggregate by day
    const dailyMap = new Map<
      string,
      {
        date: string;
        messages: number;
        inputTokens: number;
        outputTokens: number;
        cachedTokens: number;
        costCents: number;
        users: Set<string>;
      }
    >();

    for (const log of usageLogs) {
      const dateKey = log.date.toISOString().split("T")[0];
      const existing = dailyMap.get(dateKey);
      if (existing) {
        existing.messages += log.messageCount;
        existing.inputTokens += log.inputTokens;
        existing.outputTokens += log.outputTokens;
        existing.cachedTokens += log.cachedTokens;
        existing.costCents += log.estimatedCost;
        existing.users.add(log.userId);
      } else {
        dailyMap.set(dateKey, {
          date: dateKey,
          messages: log.messageCount,
          inputTokens: log.inputTokens,
          outputTokens: log.outputTokens,
          cachedTokens: log.cachedTokens,
          costCents: log.estimatedCost,
          users: new Set([log.userId]),
        });
      }
    }

    const dailyBreakdown = Array.from(dailyMap.values())
      .map((d) => ({
        date: d.date,
        messages: d.messages,
        inputTokens: d.inputTokens,
        outputTokens: d.outputTokens,
        cachedTokens: d.cachedTokens,
        costCents: Math.round(d.costCents * 100) / 100,
        uniqueUsers: d.users.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Totals
    const totals = usageLogs.reduce(
      (acc, log) => ({
        totalMessages: acc.totalMessages + log.messageCount,
        totalInputTokens: acc.totalInputTokens + log.inputTokens,
        totalOutputTokens: acc.totalOutputTokens + log.outputTokens,
        totalCachedTokens: acc.totalCachedTokens + log.cachedTokens,
        totalCostCents: acc.totalCostCents + log.estimatedCost,
      }),
      {
        totalMessages: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCachedTokens: 0,
        totalCostCents: 0,
      }
    );

    const totalInput = totals.totalInputTokens + totals.totalCachedTokens;
    const cacheHitRate =
      totalInput > 0
        ? Math.round((totals.totalCachedTokens / totalInput) * 100)
        : 0;

    // Unique users in period
    const uniqueUsers = new Set(usageLogs.map((l) => l.userId)).size;
    const perUserAvgCost =
      uniqueUsers > 0
        ? Math.round((totals.totalCostCents / uniqueUsers) * 100) / 100
        : 0;

    // Monthly projection (based on daily average)
    const daysWithData = dailyBreakdown.length || 1;
    const dailyAvgCost = totals.totalCostCents / daysWithData;
    const monthlyProjection = Math.round(dailyAvgCost * 30 * 100) / 100;

    return NextResponse.json({
      period: `${days}d`,
      ...totals,
      totalCostCents: Math.round(totals.totalCostCents * 100) / 100,
      cacheHitRate,
      uniqueUsers,
      perUserAvgCost,
      monthlyProjection,
      dailyBreakdown,
    });
  } catch (error) {
    console.error("Admin costs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost data" },
      { status: 500 }
    );
  }
}
