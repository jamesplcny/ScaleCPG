"use server";

import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createManufacturerAction(data: { companyName: string }): Promise<{ error: string | null; id?: string }> {
  const { user } = await requireSuperAdmin();
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("admin_manufacturers")
    .insert({
      company_name: data.companyName,
      created_by_user_id: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { error: null, id: row.id };
}

export async function sendInvitationAction(data: { adminManufacturerId: string; email: string }): Promise<{ error: string | null }> {
  const { user } = await requireSuperAdmin();
  const supabase = await createClient();
  const admin = createAdminClient();

  // Send Supabase invite email — this creates the auth user (if needed) and
  // emails them a link to set their password. The link routes through
  // /auth/callback, which then provisions their role + manufacturer profile.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const next = encodeURIComponent("/login?set_password=1");
  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=${next}`,
    data: {
      role: "manufacturer_user",
      admin_manufacturer_id: data.adminManufacturerId,
    },
  });

  // "User already registered" is fine — we still want to record the invitation.
  // Other errors should be surfaced.
  if (inviteError && !/already.*(registered|exists)/i.test(inviteError.message)) {
    return { error: inviteError.message };
  }

  const { error } = await supabase
    .from("admin_manufacturer_invitations")
    .insert({
      admin_manufacturer_id: data.adminManufacturerId,
      email: data.email,
      invited_by_user_id: user.id,
    });

  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteManufacturerAction(id: string): Promise<{ error: string | null }> {
  await requireSuperAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("admin_manufacturers")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}
