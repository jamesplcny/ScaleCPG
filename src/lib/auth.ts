import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthInfo = {
  user: { id: string; email: string };
  role: "manufacturer_user" | "brand_user";
};

export type ManufacturerAuthInfo = AuthInfo & {
  role: "manufacturer_user";
  manufacturerStatus: "pending" | "approved" | "rejected" | null;
};

export type BrandAuthInfo = {
  user: { id: string; email: string };
  role: "brand_user";
  brandId: string;
};

/**
 * Gets the current user's role.
 * Returns null if not authenticated or no role found.
 */
export async function getUserRole(): Promise<AuthInfo | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return null;

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleRow) {
    return {
      user: { id: user.id, email: user.email },
      role: roleRow.role as AuthInfo["role"],
    };
  }

  return null;
}

/**
 * Guard: requires manufacturer_user role.
 * Does NOT redirect for pending/rejected — returns the status so the
 * dashboard can show appropriate UI.
 */
export async function requireManufacturerUser(): Promise<ManufacturerAuthInfo> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) redirect("/login");

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = roleRow?.role;
  if (role !== "manufacturer_user" && role !== "manufacturer_admin") {
    redirect("/login");
  }

  // Get manufacturer profile status
  const { data: profile } = await supabase
    .from("manufacturer_profiles")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    user: { id: user.id, email: user.email },
    role: "manufacturer_user",
    manufacturerStatus: (profile?.status as ManufacturerAuthInfo["manufacturerStatus"]) ?? null,
  };
}

/**
 * Guard: requires brand_user role.
 * Unauthenticated or wrong role → /login.
 * Returns brandId from brand_users table.
 */
export async function requireBrandUser(): Promise<BrandAuthInfo> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) redirect("/login");

  // Redirect unconfirmed users to the confirm-email page
  if (!user.email_confirmed_at) {
    redirect(`/brand/confirm-email?email=${encodeURIComponent(user.email)}`);
  }

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "brand_user")
    .maybeSingle();

  if (!roleRow) redirect("/login");

  const { data: brandUser } = await supabase
    .from("brand_users")
    .select("brand_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!brandUser) redirect("/login");

  return {
    user: { id: user.id, email: user.email },
    role: "brand_user",
    brandId: brandUser.brand_id,
  };
}

export async function requireSuperAdmin(): Promise<{ user: { id: string; email: string } }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect("/login");

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "super_admin")
    .maybeSingle();

  if (!roleRow) redirect("/login");

  return { user: { id: user.id, email: user.email } };
}
