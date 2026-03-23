"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveProfileAction(data: {
  company_name: string;
  company_description: string;
  location: string;
  years_in_business: number;
  capabilities: string[];
  moq: string;
  lead_time: string;
  public_slug: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const slug = data.public_slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

  // Save profile fields (capabilities stored in separate table)
  const { error } = await supabase
    .from("manufacturer_profiles")
    .upsert(
      {
        user_id: user.id,
        company_name: data.company_name.trim(),
        company_description: data.company_description.trim(),
        location: data.location.trim(),
        years_in_business: data.years_in_business,
        moq: data.moq.trim(),
        lead_time: data.lead_time.trim(),
        public_slug: slug,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("[manufacturer_profiles] upsert error:", error.message);
    return { error: error.message };
  }

  // Sync capabilities: delete all, re-insert selected
  await supabase
    .from("manufacturer_capabilities")
    .delete()
    .eq("user_id", user.id);

  if (data.capabilities.length > 0) {
    const rows = data.capabilities.map((c) => ({ user_id: user.id, capability: c }));
    const { error: capError } = await supabase
      .from("manufacturer_capabilities")
      .insert(rows as never[]);

    if (capError) {
      console.error("[manufacturer_capabilities] insert error:", capError.message);
      return { error: capError.message };
    }
  }

  revalidatePath("/profile");
  return { error: null };
}

export async function setProfileVisibilityAction(visibility: "draft" | "public") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("manufacturer_profiles")
    .update({ profile_visibility: visibility, updated_at: new Date().toISOString() } as never)
    .eq("user_id", user.id);

  if (error) {
    console.error("[manufacturer_profiles] visibility error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { error: null };
}


