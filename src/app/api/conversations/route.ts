import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// GET /api/conversations — list user's conversations
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("List conversations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations — create new conversation
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check weekly conversation limit
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const daysSinceWeeklyReset = Math.floor(
      (now.getTime() - user.weeklyConvoResetAt.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const weeklyLimit = parseInt(
      process.env.WEEKLY_CONVERSATION_LIMIT || "5",
      10
    );

    if (daysSinceWeeklyReset >= 7) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { weeklyConvoCount: 0, weeklyConvoResetAt: now },
      });
    } else if (user.weeklyConvoCount >= weeklyLimit) {
      const resetAt = new Date(user.weeklyConvoResetAt);
      resetAt.setDate(resetAt.getDate() + 7);
      return NextResponse.json(
        {
          error: `Weekly conversation limit (${weeklyLimit}) reached`,
          resetAt,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const conversation = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        title: body.title || null,
      },
    });

    // Increment weekly count
    await prisma.user.update({
      where: { id: session.user.id },
      data: { weeklyConvoCount: { increment: 1 } },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
