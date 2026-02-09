"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResourceCard } from "@/components/resources/resource-card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  region: string;
  tags: string[];
  priority: number;
  active: boolean;
}

interface ResourceSuggestionsProps {
  conversationId: string | null;
}

export function ResourceSuggestions({
  conversationId,
}: ResourceSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [handoffMessage, setHandoffMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function fetchSuggestions() {
    setIsLoading(true);
    setError(null);
    setIsOpen(true);

    try {
      const res = await fetch("/api/resources/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });

      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json();
      setResources(data.resources || []);
      setHandoffMessage(data.handoffMessage || "");
    } catch {
      setError("Could not load resource suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={fetchSuggestions}
      >
        <Heart className="h-3.5 w-3.5" />
        Find Support Services
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Recommended Support Services
            </DialogTitle>
          </DialogHeader>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Finding relevant resources...
              </span>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={fetchSuggestions}
              >
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !error && resources.length > 0 && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                {handoffMessage && (
                  <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                    {handoffMessage}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-3">
                  {resources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      name={resource.name}
                      type={resource.type}
                      description={resource.description}
                      phone={resource.phone}
                      website={resource.website}
                      address={resource.address}
                      region={resource.region}
                      tags={resource.tags}
                      priority={resource.priority}
                    />
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}

          {!isLoading && !error && resources.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">
                No specific resources matched. Visit the{" "}
                <a href="/resources" className="text-primary underline">
                  Resources page
                </a>{" "}
                to browse all available services.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
