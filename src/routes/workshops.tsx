import { createFileRoute } from "@tanstack/react-router";
import { FeaturePreview } from "@/components/FeaturePreview";

export const Route = createFileRoute("/workshops")({
  head: () => ({ meta: [{ title: "Workshops — CampusSphare" }, { name: "description", content: "Run multi-session workshops and mark attendance." }, { property: "og:title", content: "Workshops — CampusSphare" }, { property: "og:description", content: "Run multi-session workshops and mark attendance." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FeaturePreview title="Workshops" subtitle="Run multi-session workshops and mark attendance." features={['Session roster', 'Attendance marking', 'Badge awarding']} />,
});

