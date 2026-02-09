import Link from "next/link";
import { Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      {/* Emergency resources — always visible */}
      <div className="bg-destructive/5 border-b border-destructive/10 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs">
          <span className="font-semibold text-destructive flex items-center gap-1">
            <Phone className="h-3 w-3" aria-hidden="true" />
            Crisis Support
          </span>
          <a
            href="tel:000"
            className="font-bold text-destructive underline"
            aria-label="Call emergency services triple zero"
          >
            Emergency: 000
          </a>
          <a
            href="tel:131114"
            className="font-bold text-destructive underline"
            aria-label="Call Lifeline 13 11 14"
          >
            Lifeline: 13 11 14
          </a>
          <a
            href="tel:1800011511"
            className="text-destructive underline"
            aria-label="Call Suicide Call Back Service"
          >
            Suicide Callback: 1800 011 511
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} MindSupport Victoria. Not a
            substitute for professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
