import { Suspense } from "react";
import { Phone } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { FredIconLarge } from "@/components/ui/fred-icon-wrapper";

export const metadata = {
  title: "Reset Password - FRED",
  description: "Set a new password for your FRED account",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Emergency Banner */}
      <div className="bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm">
        <Phone className="inline-block h-3.5 w-3.5 mr-1" />
        Emergency: <a href="tel:000" className="underline font-bold">000</a>
        {" | "}Lifeline: <a href="tel:131114" className="underline font-bold">13 11 14</a>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-8 gradient-lilac">
        <div className="w-full max-w-md">
          <FredIconLarge />
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg shadow-purple-500/5 border border-purple-100 p-1">
            <Suspense>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
