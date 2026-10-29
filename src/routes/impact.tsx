import { createFileRoute } from "@tanstack/react-router";
import { FeaturePreview } from "@/components/FeaturePreview";

export const Route = createFileRoute("/impact")({
  head: () => ({ meta: [{ title: "Community impact — CampusSphere" }, { name: "description", content: "How shared spaces and programs help the community." }, { property: "og:title", content: "Community impact — CampusSphere" }, { property: "og:description", content: "How shared spaces and programs help the community." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FeaturePreview title="Community impact" subtitle="How shared spaces and programs help the community." features={['Hours of space shared', 'People reached by programs', 'Fairness over time']} />,
});
