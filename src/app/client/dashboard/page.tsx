import { redirect } from "next/navigation";

export default async function ClientDashboardPage() {
  // Client portal disabled — redirect to main login
  redirect("/login");
}
