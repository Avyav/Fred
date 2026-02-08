import { prisma } from "@/lib/db/prisma";

// Claude Sonnet 4.5 pricing (per million tokens)
const SONNET_INPUT_COST = 3.0; // $3 per 1M tokens
const SONNET_OUTPUT_COST = 15.0; // $15 per 1M tokens
const SONNET_CACHE_WRITE_COST = 3.75; // $3.75 per 1M tokens
const SONNET_CACHE_READ_COST = 0.3; // $0.30 per 1M tokens

export function calculateCost(usage: {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
}): number {
  const { inputTokens, outputTokens, cacheCreationTokens, cacheReadTokens } =
    usage;

  const inputCost = (inputTokens / 1_000_000) * SONNET_INPUT_COST;
  const outputCost = (outputTokens / 1_000_000) * SONNET_OUTPUT_COST;
  const cacheWriteCost =
    (cacheCreationTokens / 1_000_000) * SONNET_CACHE_WRITE_COST;
  const cacheReadCost =
    (cacheReadTokens / 1_000_000) * SONNET_CACHE_READ_COST;

  const totalCost = inputCost + outputCost + cacheWriteCost + cacheReadCost;

  // Return in cents for storage
  return Math.round(totalCost * 100);
}

export async function logUsage(
  userId: string,
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
  }
) {
  const cost = calculateCost(usage);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.usageLog.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    create: {
      userId,
      date: today,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cachedTokens: usage.cacheReadTokens,
      estimatedCost: cost,
      messageCount: 1,
    },
    update: {
      inputTokens: { increment: usage.inputTokens },
      outputTokens: { increment: usage.outputTokens },
      cachedTokens: { increment: usage.cacheReadTokens },
      estimatedCost: { increment: cost },
      messageCount: { increment: 1 },
    },
  });

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Cost] Logged usage — input: ${usage.inputTokens}, output: ${usage.outputTokens}, cached: ${usage.cacheReadTokens}, cost: ${cost}¢`
    );
  }
}
