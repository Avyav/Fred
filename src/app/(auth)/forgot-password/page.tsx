import { Phone } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { FredIconLarge } from "@/components/ui/fred-icon-wrapper";

export const metadata = {
  title: "Forgot Password - FRED",
  description: "Reset your FRED account password",
};

export default function ForgotPasswordPage() {
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
            <ForgotPasswordForm />
          </div>
        </div>
      </main>
    </div>
  );
}
