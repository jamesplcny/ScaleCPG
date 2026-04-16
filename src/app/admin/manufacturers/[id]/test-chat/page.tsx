import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AdminTestChatWidget } from "./AdminTestChatWidget";

export default async function TestChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdmin();
  const { id } = await params;

  const supabase = await createClient();

  const { data: manufacturer } = await supabase
    .from("admin_manufacturers")
    .select("id, company_name, config")
    .eq("id", id)
    .maybeSingle();

  if (!manufacturer) notFound();

  return (
    <AdminTestChatWidget
      manufacturerId={id}
      companyName={manufacturer.company_name}
    />
  );
}
