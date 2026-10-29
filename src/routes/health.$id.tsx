import { createFileRoute } from "@tanstack/react-router";
import { FeaturePreview } from "@/components/FeaturePreview";

export const Route = createFileRoute("/health/$id")({
  head: () => ({ meta: [{ title: "Health camp — CampusSphare" }, { name: "description", content: "Health camp on CampusSphare." }, { property: "og:title", content: "Health camp — CampusSphare" }, { property: "og:description", content: "Health camp on CampusSphare." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FeaturePreview title="Health camp" subtitle="Detailed pages for this are coming next." features={["Registration & tokens", "Live updates", "Questions and feedback"]} />,
});

