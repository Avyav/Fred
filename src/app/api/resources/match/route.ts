import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tags } = await req.json();

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one tag" },
        { status: 400 }
      );
    }

    const resources = await prisma.resource.findMany({
      where: {
        active: true,
        tags: { hasSome: tags },
      },
      orderBy: { priority: "desc" },
      take: 10,
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Resource match error:", error);
    return NextResponse.json(
      { error: "Failed to match resources" },
      { status: 500 }
    );
  }
}
