import { createFileRoute } from "@tanstack/react-router";
import { FeaturePreview } from "@/components/FeaturePreview";

export const Route = createFileRoute("/helpdesk")({
  head: () => ({ meta: [{ title: "Help desk console — CampusSphare" }, { name: "description", content: "Serve walk-in and booked help desk appointments." }, { property: "og:title", content: "Help desk console — CampusSphare" }, { property: "og:description", content: "Serve walk-in and booked help desk appointments." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FeaturePreview title="Help desk console" subtitle="Serve walk-in and booked help desk appointments." features={["Today's queue", 'Case notes & summaries', 'Follow-ups']} />,
});

