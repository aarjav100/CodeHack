import { createFileRoute } from "@tanstack/react-router";
import { FeaturePreview } from "@/components/FeaturePreview";

export const Route = createFileRoute("/partners")({
  head: () => ({ meta: [{ title: "Partner organisations — CampusSphere" }, { name: "description", content: "Hospitals, NGOs and companies working with the college." }, { property: "og:title", content: "Partner organisations — CampusSphere" }, { property: "og:description", content: "Hospitals, NGOs and companies working with the college." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FeaturePreview title="Partner organisations" subtitle="Hospitals, NGOs and companies working with the college." features={['Verified partner list', 'Focus areas', 'Contact the organiser']} />,
});
