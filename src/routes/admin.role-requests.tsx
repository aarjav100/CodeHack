import { createFileRoute } from "@tanstack/react-router";
import { RoleRequestsPage } from "@/pages/admin/RoleRequests";

export const Route = createFileRoute("/admin/role-requests")({
  head: () => ({
    meta: [
      { title: "Role Requests — CampusSphare Governance" },
      { name: "description", content: "Review and approve multi-role requests for space owners, guest speakers, and campus organisations." },
    ],
  }),
  component: RoleRequestsPage,
});
