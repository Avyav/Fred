import { Suspense } from "react";
import { Phone } from "lucide-react";
import { SignInForm } from "@/components/auth/signin-form";

export const metadata = {
  title: "Sign In - MindSupport Victoria",
  description: "Sign in to your mental health support account",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Emergency Banner */}
      <div className="bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm">
        <Phone className="inline-block h-3.5 w-3.5 mr-1" />
        Emergency: <a href="tel:000" className="underline font-bold">000</a>
        {" | "}Lifeline: <a href="tel:131114" className="underline font-bold">13 11 14</a>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Suspense>
          <SignInForm />
        </Suspense>
      </main>
    </div>
  );
}
