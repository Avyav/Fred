import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

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
        messageSnippet: (messageSnippet || "").substring(0, 500),
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
