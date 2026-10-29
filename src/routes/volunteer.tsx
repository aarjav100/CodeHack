import { createFileRoute } from "@tanstack/react-router";
import { FeaturePreview } from "@/components/FeaturePreview";

export const Route = createFileRoute("/volunteer")({
  head: () => ({ meta: [{ title: "Volunteer dashboard — CampusSphare" }, { name: "description", content: "Your shifts, hours and the people waiting for help." }, { property: "og:title", content: "Volunteer dashboard — CampusSphare" }, { property: "og:description", content: "Your shifts, hours and the people waiting for help." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FeaturePreview title="Volunteer dashboard" subtitle="Your shifts, hours and the people waiting for help." features={['Upcoming shifts', 'Hours log & certificates', 'Doubt queue']} />,
});

