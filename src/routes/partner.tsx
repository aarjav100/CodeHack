import { createFileRoute } from "@tanstack/react-router";
import { FeaturePreview } from "@/components/FeaturePreview";

export const Route = createFileRoute("/partner")({
  head: () => ({ meta: [{ title: "Partner dashboard — CampusSphare" }, { name: "description", content: "Manage the camps and programs your organisation runs." }, { property: "og:title", content: "Partner dashboard — CampusSphare" }, { property: "og:description", content: "Manage the camps and programs your organisation runs." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FeaturePreview title="Partner dashboard" subtitle="Manage the camps and programs your organisation runs." features={['Your programs', 'Volunteer requests', 'Reach & feedback']} />,
});

