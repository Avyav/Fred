import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

function isAdmin(email: string | null | undefined): boolean {
  return !!email?.endsWith("@admin.mindsupport.vic.gov.au");
}

export async function GET() {
  try {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resources = await prisma.resource.findMany({
      orderBy: [{ priority: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("[Admin Resources GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, type, description, phone, website, address, region, tags, priority, active } = body;

    if (!name || !type || !description) {
      return NextResponse.json(
        { error: "Name, type, and description are required" },
        { status: 400 }
      );
    }

    const validTypes = ["hotline", "service", "hospital", "psychologist", "gp"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        type,
        description,
        phone: phone || null,
        website: website || null,
        address: address || null,
        region: region || "Victoria",
        tags: tags || [],
        priority: priority ?? 0,
        active: active ?? true,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("[Admin Resources POST]", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}
