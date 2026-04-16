"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateManufacturerConfigAction(data: {
  manufacturerId: string;
  companyName: string;
  config: Record<string, unknown>;
}): Promise<{ error: string | null }> {
  await requireSuperAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("admin_manufacturers")
    .update({
      company_name: data.companyName,
      config: data.config,
    })
    .eq("id", data.manufacturerId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/manufacturers/${data.manufacturerId}`);
  return { error: null };
}
