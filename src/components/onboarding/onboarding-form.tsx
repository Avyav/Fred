"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const EDUCATION_OPTIONS = [
  { value: "primary", label: "Primary school" },
  { value: "year10", label: "Secondary school (Year 10)" },
  { value: "year12", label: "Year 12 / HSC" },
  { value: "tafe", label: "TAFE / Diploma" },
  { value: "university", label: "University degree" },
  { value: "postgraduate", label: "Postgraduate" },
] as const;

const PREFERENCE_LABELS: Record<number, string> = {
  1: "Keep it really simple",
  2: "Simple language",
  3: "Everyday language",
  4: "Some detail is fine",
  5: "I'm comfortable with detail",
};

export function OnboardingForm() {
  const router = useRouter();
  const [educationLevel, setEducationLevel] = useState("");
  const [communicationPreference, setCommunicationPreference] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!educationLevel) {
      setError("Please select your education level.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ educationLevel, communicationPreference }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save preferences");
      }

      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSkip() {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          educationLevel: "year12",
          communicationPreference: 3,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      router.push("/chat");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          Help FRED talk your way
        </CardTitle>
        <CardDescription>
          This helps us adjust how FRED communicates with you. You can change
          these preferences anytime in Settings.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Education level */}
        <div className="space-y-2">
          <Label htmlFor="education">What best describes your education?</Label>
          <select
            id="education"
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select...</option>
            {EDUCATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Communication preference */}
        <div className="space-y-3">
          <Label htmlFor="preference">
            How would you like FRED to communicate?
          </Label>
          <input
            id="preference"
            type="range"
            min={1}
            max={5}
            step={1}
            value={communicationPreference}
            onChange={(e) =>
              setCommunicationPreference(Number(e.target.value))
            }
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Simple</span>
            <span>Everyday</span>
            <span>Detailed</span>
          </div>
          <p className="text-sm text-center text-foreground font-medium">
            {PREFERENCE_LABELS[communicationPreference]}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-3">
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </Button>
        <button
          onClick={handleSkip}
          disabled={isSubmitting}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
      </CardFooter>
    </Card>
  );
}
