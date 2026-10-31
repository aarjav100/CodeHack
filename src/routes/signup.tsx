import { createFileRoute } from "@tanstack/react-router";
import { SignupPage } from "@/pages/auth/SignupPage";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up for Multi-Role Account — CampusSphare" },
      { name: "description", content: "Create your single unified account for student, equipment steward, volunteer and speaker roles." },
      { property: "og:title", content: "Sign up — CampusSphare" },
      { property: "og:description", content: "One account. Every role you play on campus." },
    ],
  }),
  component: SignupPage,
});
