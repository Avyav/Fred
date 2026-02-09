import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// Helper: redact PII from message snippets
function redactPII(text: string): string {
  return text
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, "[REDACTED_EMAIL]")
    .replace(/\b04\d{2}\s?\d{3}\s?\d{3}\b/g, "[REDACTED_PHONE]")
    .replace(/\b\d{2}\s?\d{4}\s?\d{4}\b/g, "[REDACTED_PHONE]");
}

// POST: Log a crisis event
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, severity, indicators, messageSnippet } =
      await req.json();

    const flag = await prisma.crisisFlag.create({
      data: {
        userId: session.user.id,
        conversationId: conversationId || null,
        severity: severity || "medium",
        indicators: indicators || [],
        messageSnippet: redactPII((messageSnippet || "").substring(0, 500)),
      },
    });

    return NextResponse.json(flag, { status: 201 });
  } catch (error) {
    console.error("Crisis flag error:", error);
    return NextResponse.json(
      { error: "Failed to log crisis event" },
      { status: 500 }
    );
  }
}

// GET: List crisis flags (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Basic admin check: check if user email matches admin pattern
    // In production, add a proper role field to the User model
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (!user?.email?.endsWith("@admin.mindsupport.vic.gov.au")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const severity = searchParams.get("severity");
    const handled = searchParams.get("handled");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;

    const where = {
      ...(severity ? { severity } : {}),
      ...(handled !== null
        ? { handled: handled === "true" }
        : {}),
    };

    const [flags, total] = await Promise.all([
      prisma.crisisFlag.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          userId: true,
          conversationId: true,
          severity: true,
          indicators: true,
          messageSnippet: true,
          handled: true,
          handledBy: true,
          handledAt: true,
          notes: true,
          createdAt: true,
        },
      }),
      prisma.crisisFlag.count({ where }),
    ]);

    // Anonymize user IDs for the admin view
    const anonymizedFlags = flags.map((f) => ({
      ...f,
      userId: f.userId.substring(0, 8) + "...",
    }));

    // Stats
    const [totalFlags, unhandledCount, highCount, mediumCount, lowCount] =
      await Promise.all([
        prisma.crisisFlag.count(),
        prisma.crisisFlag.count({ where: { handled: false } }),
        prisma.crisisFlag.count({ where: { severity: "high" } }),
        prisma.crisisFlag.count({ where: { severity: "medium" } }),
        prisma.crisisFlag.count({ where: { severity: "low" } }),
      ]);

    return NextResponse.json({
      flags: anonymizedFlags,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: {
        total: totalFlags,
        unhandled: unhandledCount,
        bySeverity: { high: highCount, medium: mediumCount, low: lowCount },
      },
    });
  } catch (error) {
    console.error("List crisis flags error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crisis flags" },
      { status: 500 }
    );
  }
}

// PATCH: Mark a crisis flag as handled
export async function PATCH(req: NextRequest) {
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

    const { flagId, notes } = await req.json();

    if (!flagId) {
      return NextResponse.json(
        { error: "Flag ID is required" },
        { status: 400 }
      );
    }

    const flag = await prisma.crisisFlag.update({
      where: { id: flagId },
      data: {
        handled: true,
        handledBy: session.user.id,
        handledAt: new Date(),
        notes: notes || null,
      },
    });

    return NextResponse.json(flag);
  } catch (error) {
    console.error("Handle crisis flag error:", error);
    return NextResponse.json(
      { error: "Failed to update crisis flag" },
      { status: 500 }
    );
  }
}
