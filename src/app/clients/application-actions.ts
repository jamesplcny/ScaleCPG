"use server";

import { revalidatePath } from "next/cache";
import { requireManufacturerUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { BrandManufacturerApplication } from "@/types/database";

export async function acceptApplicationAction(applicationId: string) {
  const { user } = await requireManufacturerUser();
  const supabase = await createClient();

  // Fetch the application and verify ownership
  const { data: app } = await supabase
    .from("brand_manufacturer_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle() as { data: BrandManufacturerApplication | null; error: unknown };

  if (!app) return { error: "Application not found." };

  // Verify manufacturer owns this application
  const { data: profile } = await supabase
    .from("manufacturer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .eq("id", app.manufacturer_id)
    .maybeSingle();

  if (!profile) return { error: "You do not own this application." };

  const now = new Date().toISOString();

  // Update application status
  const { error: updateError } = await supabase
    .from("brand_manufacturer_applications")
    .update({
      status: "accepted",
      accepted_at: now,
      reviewed_at: now,
    })
    .eq("id", applicationId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/clients");
  return { error: null };
}

export async function rejectApplicationAction(
  applicationId: string,
  rejectionReason: string
) {
  const { user } = await requireManufacturerUser();
  const supabase = await createClient();

  // Fetch the application and verify ownership
  const { data: app } = await supabase
    .from("brand_manufacturer_applications")
    .select("id, manufacturer_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (!app) return { error: "Application not found." };

  // Verify manufacturer owns this application
  const { data: profile } = await supabase
    .from("manufacturer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .eq("id", (app as { manufacturer_id: string }).manufacturer_id)
    .maybeSingle();

  if (!profile) return { error: "You do not own this application." };

  const now = new Date().toISOString();
  const rejectedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error: updateError } = await supabase
    .from("brand_manufacturer_applications")
    .update({
      status: "rejected",
      rejection_reason: rejectionReason.trim(),
      rejected_until: rejectedUntil,
      reviewed_at: now,
    })
    .eq("id", applicationId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/clients");
  return { error: null };
}
