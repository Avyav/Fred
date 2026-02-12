import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json(
      { message: "If an account with that email exists, a reset link has been sent." },
      { status: 200 }
    );

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return successResponse;
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    await sendPasswordResetEmail(email, token);

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
