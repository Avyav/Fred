import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

function isAdmin(email: string | null | undefined): boolean {
  return !!email?.endsWith("@admin.mindsupport.vic.gov.au");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const validTypes = ["hotline", "service", "hospital", "psychologist", "gp"];
    if (body.type && !validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.website !== undefined && { website: body.website || null }),
        ...(body.address !== undefined && { address: body.address || null }),
        ...(body.region !== undefined && { region: body.region }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.active !== undefined && { active: body.active }),
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("[Admin Resources PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Soft delete — set active to false
    const resource = await prisma.resource.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("[Admin Resources DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}
