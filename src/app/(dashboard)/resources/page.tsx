import { ResourceList } from "@/components/resources/resource-list";

export const metadata = {
  title: "Resources - FRED",
  description: "Victorian mental health support services and resources",
};

export default function ResourcesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Support Resources
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Victorian and national mental health services. In an emergency,
          always call{" "}
          <a href="tel:000" className="font-bold text-destructive underline">
            000
          </a>
          .
        </p>
      </div>
      <ResourceList />
    </div>
  );
}
