import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/auth/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — CampusSphare Multi-Role" },
      { name: "description", content: "Sign in to your CampusSphare account and switch between student, lab owner, volunteer and speaker roles." },
      { property: "og:title", content: "Sign in — CampusSphare" },
      { property: "og:description", content: "One account. Every role you play on campus." },
    ],
  }),
  component: LoginPage,
});
