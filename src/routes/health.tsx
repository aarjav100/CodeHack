import { createFileRoute } from "@tanstack/react-router";
import { FeaturePreview } from "@/components/FeaturePreview";

export const Route = createFileRoute("/health")({
  head: () => ({ meta: [{ title: "Health camps — CampusSphare" }, { name: "description", content: "Get a token for free check-ups at community health camps." }, { property: "og:title", content: "Health camps — CampusSphare" }, { property: "og:description", content: "Get a token for free check-ups at community health camps." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FeaturePreview title="Health camps" subtitle="Get a token for free check-ups at community health camps." features={['Digital tokens with live queue', 'Anonymous services', 'Camp schedules']} />,
});

