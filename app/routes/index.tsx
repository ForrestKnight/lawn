import { createFileRoute, redirect } from "@tanstack/react-router";
import { dashboardHomePath } from "@/lib/routes";

// Self-hosted: no marketing site. "/" goes straight to the dashboard, which
// bounces to sign-in when there is no session.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: dashboardHomePath(), replace: true });
  },
});
