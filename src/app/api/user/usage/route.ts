import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usageLogs = await prisma.usageLog.findMany({
      where: {
        userId: session.user.id,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: "desc" },
    });

    // Aggregate totals
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

    // Cache hit rate
    const totalInputWithCache =
      totals.totalInputTokens + totals.totalCachedTokens;
    const cacheHitRate =
      totalInputWithCache > 0
        ? Math.round(
            (totals.totalCachedTokens / totalInputWithCache) * 100
          )
        : 0;

    return NextResponse.json({
      period: "30d",
      ...totals,
      cacheHitRate,
      dailyBreakdown: usageLogs.map((log) => ({
        date: log.date,
        messages: log.messageCount,
        inputTokens: log.inputTokens,
        outputTokens: log.outputTokens,
        cachedTokens: log.cachedTokens,
        costCents: log.estimatedCost,
      })),
    });
  } catch (error) {
    console.error("Usage stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage stats" },
      { status: 500 }
    );
  }
}
