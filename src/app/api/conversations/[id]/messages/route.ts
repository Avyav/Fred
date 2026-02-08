import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// GET /api/conversations/[id]/messages — paginated message history
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify conversation ownership
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      50
    );

    const messages = await prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: "asc" },
      take: limit,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    });

    const nextCursor =
      messages.length === limit ? messages[messages.length - 1].id : null;

    return NextResponse.json({
      messages,
      nextCursor,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
