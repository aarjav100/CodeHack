import { createFileRoute } from "@tanstack/react-router";
import { FeaturePreview } from "@/components/FeaturePreview";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin console — CampusSphere" }, { name: "description", content: "Manage people, roles, verification and Fair-Share settings." }, { property: "og:title", content: "Admin console — CampusSphere" }, { property: "og:description", content: "Manage people, roles, verification and Fair-Share settings." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FeaturePreview title="Admin console" subtitle="Manage people, roles, verification and Fair-Share settings." features={['Role management', 'Identity verification queue', 'Fair-Share weights & quotas']} />,
});
