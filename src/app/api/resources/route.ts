import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type");
    const region = searchParams.get("region");
    const tag = searchParams.get("tag");

    const resources = await prisma.resource.findMany({
      where: {
        active: true,
        ...(type ? { type } : {}),
        ...(region ? { region } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
      },
      orderBy: { priority: "desc" },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Resources error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
