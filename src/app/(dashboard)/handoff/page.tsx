import { HandoffGenerator } from "@/components/handoff/handoff-generator";

export default function HandoffPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6 print:mb-2">
        <h1 className="text-2xl font-bold text-foreground">
          Handoff Summary
        </h1>
        <p className="text-sm text-muted-foreground mt-1 print:hidden">
          Generate a structured summary of your conversations to share with your
          GP or psychologist.
        </p>
      </div>
      <HandoffGenerator />
    </div>
  );
}
