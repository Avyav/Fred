import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default function OnboardingPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.32))] px-4 py-8">
      <OnboardingForm />
    </div>
  );
}
