import { Phone } from "lucide-react";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign Up - MindSupport Victoria",
  description: "Create an account for free mental health support",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Emergency Banner */}
      <div className="bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm">
        <Phone className="inline-block h-3.5 w-3.5 mr-1" />
        Emergency: <a href="tel:000" className="underline font-bold">000</a>
        {" | "}Lifeline: <a href="tel:131114" className="underline font-bold">13 11 14</a>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <SignUpForm />
      </main>
    </div>
  );
}
