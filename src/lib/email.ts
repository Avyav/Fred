import { Resend } from "resend";

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await getResendClient().emails.send({
    from: "FRED <onboarding@resend.dev>",
    to: email,
    subject: "Reset your FRED password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/Logo2.jpeg" alt="FRED" style="max-width: 200px; height: auto;" />
        </div>
        <h2 style="color: #1a1a1a; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #4a4a4a; line-height: 1.6;">
          We received a request to reset the password for your FRED account. Click the button below to choose a new password.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">
          Reset Password
        </a>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          This link will expire in 1 hour. If you didn&apos;t request a password reset, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          FRED - Free Resources for Emotional Distress
        </p>
      </div>
    `,
  });
}
