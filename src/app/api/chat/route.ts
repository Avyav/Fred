import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { createCachedMessage, extractUsage } from "@/lib/ai/prompt-cache";
import { buildOptimizedContext } from "@/lib/ai/context-manager";
import { detectCrisis, shouldBlockResponse } from "@/lib/ai/safety-check";
import { checkRateLimits, incrementMessageCount } from "@/lib/utils/rate-limiter";
import { logUsage, calculateCost } from "@/lib/utils/cost-calculator";

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request
    const body = await req.json();
    const { message, conversationId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    // 3. Rate limiting
    const rateLimitCheck = await checkRateLimits(session.user.id);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: rateLimitCheck.reason,
          resetAt: rateLimitCheck.resetAt,
        },
        { status: 429 }
      );
    }

    // 4. Crisis detection (pre-processing)
    const crisisCheck = detectCrisis(message);
    if (crisisCheck.isCrisis) {
      // Log crisis event
      await prisma.crisisFlag.create({
        data: {
          userId: session.user.id,
          conversationId: conversationId || null,
          severity: crisisCheck.severity,
          indicators: crisisCheck.indicators,
          messageSnippet: message.substring(0, 500),
        },
      });

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Crisis] Detected — severity: ${crisisCheck.severity}, indicators: ${crisisCheck.indicators.join(", ")}`
        );
      }
    }

    // 5. Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, userId: session.user.id },
      });
      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title: message.substring(0, 50),
        },
      });

    }

    // 6. Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    // 7. Build optimized context
    const conversationHistory = await buildOptimizedContext(conversation.id);

    // 8. Determine max tokens based on situation
    const maxTokens = crisisCheck.isCrisis ? 500 : 300;

    // 9. Call Claude API with prompt caching
    const response = await createCachedMessage(conversationHistory, {
      maxTokens,
      temperature: 0.7,
    });

    // 10. Extract response content
    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    // 11. Safety check (post-processing)
    const safetyCheck = shouldBlockResponse(assistantMessage);
    if (safetyCheck.blocked) {
      console.error("[Safety] Response blocked:", safetyCheck.reason);
      // Save a safe fallback message instead
      const fallbackMessage =
        "I want to make sure I'm supporting you in the best way possible. Could you tell me a bit more about what you're going through? If you'd like to speak with a professional, your GP can set up a Mental Health Care Plan for subsidized psychology sessions.";

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "assistant",
          content: fallbackMessage,
          modelUsed: "sonnet-4.5",
        },
      });

      return NextResponse.json({
        message: fallbackMessage,
        conversationId: conversation.id,
        usage: { inputTokens: 0, outputTokens: 0, cachedTokens: 0, estimatedCost: 0 },
        isCrisis: crisisCheck.isCrisis,
      });
    }

    // 12. Extract usage and calculate cost
    const usage = extractUsage(response);
    const cost = calculateCost(usage);

    // 13. Save assistant message with usage data
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: assistantMessage,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        cachedTokens: usage.cacheReadTokens,
        modelUsed: "sonnet-4.5",
      },
    });

    // 14. Update conversation title if it was auto-generated
    if (!conversationId) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    } else {
      // Touch updatedAt for ordering
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    }

    // 15. Log usage for cost tracking
    await logUsage(session.user.id, usage);

    // 16. Increment message count for rate limiting
    await incrementMessageCount(session.user.id);

    // 17. Return response
    return NextResponse.json({
      message: assistantMessage,
      conversationId: conversation.id,
      usage: {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        cachedTokens: usage.cacheReadTokens,
        estimatedCost: cost,
      },
      isCrisis: crisisCheck.isCrisis,
    });
  } catch (error: unknown) {
    console.error("[Chat API] Error:", error);

    // Surface Anthropic API errors (credits, rate limits, auth)
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      typeof (error as { status: unknown }).status === "number"
    ) {
      const apiError = error as { status: number; message?: string };
      if (apiError.status === 429) {
        return NextResponse.json(
          { error: "AI service rate limit or credit limit reached. Please check your Anthropic billing." },
          { status: 503 }
        );
      }
      if (apiError.status === 401) {
        return NextResponse.json(
          { error: "AI service authentication failed. Please check the API key configuration." },
          { status: 503 }
        );
      }
      if (apiError.status === 400) {
        return NextResponse.json(
          { error: `AI service error: ${apiError.message || "Bad request"}` },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "An error occurred processing your message. Please try again." },
      { status: 500 }
    );
  }
}
