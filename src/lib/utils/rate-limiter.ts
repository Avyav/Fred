import { prisma } from "@/lib/db/prisma";

const DAILY_MESSAGE_LIMIT = parseInt(
  process.env.DAILY_MESSAGE_LIMIT || "20",
  10
);
const WEEKLY_CONVERSATION_LIMIT = parseInt(
  process.env.WEEKLY_CONVERSATION_LIMIT || "5",
  10
);

export async function checkRateLimits(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  resetAt?: Date;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { allowed: false, reason: "User not found" };
  }

  const now = new Date();

  // Check daily message limit
  const daysSinceReset = Math.floor(
    (now.getTime() - user.dailyMessageResetAt.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysSinceReset >= 1) {
    // Reset daily counter
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyMessageCount: 0,
        dailyMessageResetAt: now,
      },
    });
  } else if (user.dailyMessageCount >= DAILY_MESSAGE_LIMIT) {
    const resetAt = new Date(user.dailyMessageResetAt);
    resetAt.setDate(resetAt.getDate() + 1);
    return {
      allowed: false,
      reason: `Daily message limit (${DAILY_MESSAGE_LIMIT}) reached. Please try again tomorrow.`,
      resetAt,
    };
  }

  // Check weekly conversation limit
  const daysSinceWeeklyReset = Math.floor(
    (now.getTime() - user.weeklyConvoResetAt.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysSinceWeeklyReset >= 7) {
    // Reset weekly counter
    await prisma.user.update({
      where: { id: userId },
      data: {
        weeklyConvoCount: 0,
        weeklyConvoResetAt: now,
      },
    });
  } else if (user.weeklyConvoCount >= WEEKLY_CONVERSATION_LIMIT) {
    const resetAt = new Date(user.weeklyConvoResetAt);
    resetAt.setDate(resetAt.getDate() + 7);
    return {
      allowed: false,
      reason: `Weekly conversation limit (${WEEKLY_CONVERSATION_LIMIT}) reached.`,
      resetAt,
    };
  }

  return { allowed: true };
}

export async function incrementMessageCount(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      dailyMessageCount: { increment: 1 },
    },
  });
}

export async function incrementConversationCount(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      weeklyConvoCount: { increment: 1 },
    },
  });
}
