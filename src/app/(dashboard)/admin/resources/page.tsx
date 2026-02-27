"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ShieldAlert,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Card components available if needed for future layout changes
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const RESOURCE_TYPES = ["hotline", "service", "hospital", "psychologist", "gp"] as const;
const REGIONS = ["Victoria", "National"] as const;

const TYPE_COLORS: Record<string, string> = {
  hotline: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  service: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  hospital: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  psychologist: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  gp: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const emptyForm = {
  name: "",
  type: "service" as string,
  description: "",
  phone: "",
  website: "",
  address: "",
  region: "Victoria",
  tags: "",
  priority: 0,
  active: true,
};

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/resources");
      if (res.status === 403) {
        setError("Access denied. Admin privileges required.");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setResources(data);
    } catch {
      setError("Could not load resources.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(resource: Resource) {
    setEditingId(resource.id);
    setForm({
      name: resource.name,
      type: resource.type,
      description: resource.description,
      phone: resource.phone || "",
      website: resource.website || "",
      address: resource.address || "",
      region: resource.region,
      tags: resource.tags.join(", "),
      priority: resource.priority,
      active: resource.active,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        priority: Number(form.priority),
      };

      const url = editingId
        ? `/api/admin/resources/${editingId}`
        : "/api/admin/resources";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      setDialogOpen(false);
      await fetchResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchResources();
    } catch {
      setError("Failed to deactivate resource.");
    }
  }

  async function handleToggleActive(resource: Resource) {
    try {
      const res = await fetch(`/api/admin/resources/${resource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !resource.active }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchResources();
    } catch {
      setError("Failed to toggle resource status.");
    }
  }

  if (error === "Access denied. Admin privileges required.") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="h-6 w-6" />
            Resource Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add, edit, and manage mental health resources.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Add Resource
        </Button>
      </div>

      {error && error !== "Access denied. Admin privileges required." && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-muted-foreground">Name</th>
                  <th className="pb-2 font-medium text-muted-foreground">Type</th>
                  <th className="pb-2 font-medium text-muted-foreground hidden md:table-cell">Region</th>
                  <th className="pb-2 font-medium text-muted-foreground hidden md:table-cell">Phone</th>
                  <th className="pb-2 font-medium text-muted-foreground">Active</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No resources found. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  resources.map((resource) => (
                    <tr
                      key={resource.id}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="py-2.5 pr-3">
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {resource.description}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`text-xs font-medium rounded-full px-2 py-0.5 capitalize ${TYPE_COLORS[resource.type] || "bg-muted text-muted-foreground"}`}
                        >
                          {resource.type}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 hidden md:table-cell text-muted-foreground">
                        {resource.region}
                      </td>
                      <td className="py-2.5 pr-3 hidden md:table-cell text-muted-foreground">
                        {resource.phone || "—"}
                      </td>
                      <td className="py-2.5 pr-3">
                        <button
                          onClick={() => handleToggleActive(resource)}
                          className={`text-xs font-medium rounded-full px-2 py-0.5 cursor-pointer transition-colors ${
                            resource.active
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {resource.active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => openEdit(resource)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(resource.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Resource" : "Add Resource"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="res-name">Name *</Label>
              <Input
                id="res-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Lifeline Australia"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-type">Type *</Label>
              <select
                id="res-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-desc">Description *</Label>
              <textarea
                id="res-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Brief description of the service"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="res-phone">Phone</Label>
                <Input
                  id="res-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 13 11 14"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="res-website">Website</Label>
                <Input
                  id="res-website"
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-address">Address</Label>
              <Input
                id="res-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address (optional)"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="res-region">Region</Label>
                <select
                  id="res-region"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="res-priority">Priority</Label>
                <Input
                  id="res-priority"
                  type="number"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-tags">Tags (comma-separated)</Label>
              <Input
                id="res-tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="e.g. crisis, 24/7, free"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="res-active"
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.checked })
                }
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="res-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
