import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        age: true,
        location: true,
        agreedToTerms: true,
        createdAt: true,
        dailyMessageCount: true,
        dailyMessageResetAt: true,
        weeklyConvoCount: true,
        weeklyConvoResetAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("User profile error:", error);
    return NextResponse.json(
      { error: "An error occurred fetching your profile" },
      { status: 500 }
    );
  }
}
