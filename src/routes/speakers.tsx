import { createFileRoute } from "@tanstack/react-router";
import { FeaturePreview } from "@/components/FeaturePreview";

export const Route = createFileRoute("/speakers")({
  head: () => ({ meta: [{ title: "Speakers & invites — CampusSphere" }, { name: "description", content: "Find guest speakers and track invitations." }, { property: "og:title", content: "Speakers & invites — CampusSphere" }, { property: "og:description", content: "Find guest speakers and track invitations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FeaturePreview title="Speakers & invites" subtitle="Find guest speakers and track invitations." features={['Speaker directory', 'Send & track invites', 'Reschedule requests']} />,
});
