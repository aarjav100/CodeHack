import { createFileRoute } from "@tanstack/react-router";
import { FeaturePreview } from "@/components/FeaturePreview";

export const Route = createFileRoute("/events/$id")({
  head: () => ({ meta: [{ title: "Program details — CampusSphare" }, { name: "description", content: "Program details on CampusSphare." }, { property: "og:title", content: "Program details — CampusSphare" }, { property: "og:description", content: "Program details on CampusSphare." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FeaturePreview title="Program details" subtitle="Detailed pages for this are coming next." features={["Registration & tokens", "Live updates", "Questions and feedback"]} />,
});

