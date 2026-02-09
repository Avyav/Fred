"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResourceCard } from "./resource-card";

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

const RESOURCE_TYPES = [
  { value: "", label: "All Types" },
  { value: "hotline", label: "Hotlines" },
  { value: "service", label: "Services" },
  { value: "hospital", label: "Hospitals" },
];

const REGIONS = [
  { value: "", label: "All Regions" },
  { value: "Victoria", label: "Victoria" },
  { value: "National", label: "National" },
];

export function ResourceList() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchResources() {
      try {
        const params = new URLSearchParams();
        if (typeFilter) params.set("type", typeFilter);
        if (regionFilter) params.set("region", regionFilter);

        const res = await fetch(`/api/resources?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setResources(data);
      } catch {
        setError("Could not load resources. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchResources();
  }, [typeFilter, regionFilter]);

  // Client-side search filtering
  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return resources;
    const q = searchQuery.toLowerCase();
    return resources.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [resources, searchQuery]);

  // Separate crisis resources for prominent display
  const crisisResources = filteredResources.filter(
    (r) => r.tags.includes("crisis") || r.priority >= 90
  );
  const otherResources = filteredResources.filter(
    (r) => !r.tags.includes("crisis") && r.priority < 90
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-destructive">{error}</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-1" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50 border border-border">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            {RESOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {(typeFilter || regionFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTypeFilter("");
                setRegionFilter("");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-6 pr-4">
          {/* Crisis resources - always first */}
          {crisisResources.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-destructive mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                Crisis & Emergency Services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {crisisResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    {...resource}
                    isCrisis
                  />
                ))}
              </div>
            </section>
          )}

          {/* Other resources */}
          {otherResources.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Support Services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {otherResources.map((resource) => (
                  <ResourceCard key={resource.id} {...resource} />
                ))}
              </div>
            </section>
          )}

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No resources found matching your search.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
