"use client";

import { useState } from "react";
import {
  Phone,
  Globe,
  MapPin,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  name: string;
  type: string;
  description: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  region: string;
  tags: string[];
  priority: number;
  isCrisis?: boolean;
}

export function ResourceCard({
  name,
  type,
  description,
  phone,
  website,
  address,
  region,
  tags,
  priority,
  isCrisis,
}: ResourceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCrisisResource =
    isCrisis || tags.includes("crisis") || priority >= 90;

  async function handleShare() {
    const text = [
      name,
      phone ? `Phone: ${phone}` : null,
      website ? `Website: ${website}` : null,
      address ? `Address: ${address}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const shortDescription =
    description.length > 120
      ? description.substring(0, 120) + "..."
      : description;

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        isCrisisResource && "border-destructive/30 bg-destructive/5"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs rounded-full bg-muted px-2 py-0.5 capitalize text-muted-foreground">
                {type}
              </span>
              <span className="text-xs text-muted-foreground">{region}</span>
              {isCrisisResource && (
                <span className="text-xs rounded-full bg-destructive/10 text-destructive px-2 py-0.5 font-medium">
                  Crisis
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            onClick={handleShare}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">Copy details</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {expanded ? description : shortDescription}
        </p>
        {description.length > 120 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        )}

        <div className="flex flex-wrap gap-2">
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                isCrisisResource
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Phone className="h-3 w-3" />
              {phone}
            </a>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
            >
              <Globe className="h-3 w-3" />
              Website
            </a>
          )}
        </div>

        {address && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{address}</span>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
