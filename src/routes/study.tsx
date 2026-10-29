import { createFileRoute } from "@tanstack/react-router";
import { FeaturePreview } from "@/components/FeaturePreview";

export const Route = createFileRoute("/study")({
  head: () => ({ meta: [{ title: "Study Center — CampusSphere" }, { name: "description", content: "Book a quiet seat, ask volunteer tutors for help, and track exam prep." }, { property: "og:title", content: "Study Center — CampusSphere" }, { property: "og:description", content: "Book a quiet seat, ask volunteer tutors for help, and track exam prep." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FeaturePreview title="Study Center" subtitle="Book a quiet seat, ask volunteer tutors for help, and track exam prep." features={['Live seat map by zone', 'Doubt queue with on-duty volunteers', 'Exam-week priority seats']} />,
});
