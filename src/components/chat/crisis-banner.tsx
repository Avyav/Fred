"use client";

import { useState } from "react";
import { AlertTriangle, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CrisisBannerProps {
  forcedOpen?: boolean;
}

export function CrisisBanner({ forcedOpen = false }: CrisisBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed && !forcedOpen) return null;

  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mx-4 mt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-destructive">
              If you or someone you know is in crisis, please reach out now:
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="tel:000"
                className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                <Phone className="h-3 w-3" />
                000 Emergency
              </a>
              <a
                href="tel:131114"
                className="inline-flex items-center gap-1.5 rounded-md bg-destructive/80 px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/70 transition-colors"
              >
                <Phone className="h-3 w-3" />
                Lifeline 13 11 14
              </a>
              <a
                href="tel:1300842747"
                className="inline-flex items-center gap-1.5 rounded-md bg-destructive/80 px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/70 transition-colors"
              >
                <Phone className="h-3 w-3" />
                VIC Crisis 1300 842 747
              </a>
            </div>
          </div>
        </div>
        {!forcedOpen && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </div>
  );
}
