import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Build the redirect response FIRST so we can attach cookies to it
  const redirectUrl = `${origin}${next}`;
  const response = NextResponse.redirect(redirectUrl);

  // Create a Supabase client that reads cookies from the request
  // and writes cookies onto the redirect response
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Provision based on role stored in user_metadata during signUp()
  const rawRole = data.user.user_metadata?.role as string | undefined;
  const metaRole = rawRole === "brand_user" || rawRole === "manufacturer_user" ? rawRole : undefined;

  const admin = createAdminClient();

  if (metaRole) {
    // Ensure user_roles row exists (idempotent)
    const { data: existing } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!existing) {
      await admin
        .from("user_roles")
        .upsert({ user_id: data.user.id, role: metaRole }, { onConflict: "user_id" });
    }

    // Brand-specific provisioning
    if (metaRole === "brand_user") {
      const brandName = data.user.user_metadata?.brand_name as string | undefined;

      if (brandName) {
        const { data: existingBrand } = await admin
          .from("brands")
          .select("id")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (!existingBrand) {
          const { data: brand } = await admin
            .from("brands")
            .insert({ user_id: data.user.id, name: brandName })
            .select("id")
            .single();

          if (brand) {
            await admin.from("brand_users").insert({
              brand_id: brand.id,
              user_id: data.user.id,
              invited_email: data.user.email ?? null,
              role: "owner",
              status: "active",
            });
          }
        }
      }
    }

    // Manufacturer-specific provisioning: create pending profile
    if (metaRole === "manufacturer_user") {
      const meta = data.user.user_metadata ?? {};

      const { data: existingProfile } = await admin
        .from("manufacturer_profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!existingProfile) {
        await admin.from("manufacturer_profiles").insert({
          user_id: data.user.id,
          company_name: (meta.company_name as string) || "Unnamed Company",
          company_description: (meta.company_description as string) || "",
          location: (meta.location as string) || "",
          moq: (meta.moq as string) || "",
        });
      }
    }
  }

  // Invitation-based signup: check if email has a pending invitation
  if (data.user.email) {
    const { data: invitation } = await admin
      .from("admin_manufacturer_invitations")
      .select("id, admin_manufacturer_id")
      .eq("email", data.user.email)
      .eq("status", "pending")
      .maybeSingle();

    if (invitation) {
      // Mark invitation as accepted
      await admin
        .from("admin_manufacturer_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      // Ensure user has manufacturer_user role
      await admin
        .from("user_roles")
        .upsert({ user_id: data.user.id, role: "manufacturer_user" as const }, { onConflict: "user_id" });

      // Record team membership in manufacturer_users (canonical link
      // between auth user and admin_manufacturer).
      await admin.from("manufacturer_users").upsert(
        {
          admin_manufacturer_id: invitation.admin_manufacturer_id,
          user_id: data.user.id,
          role: "member" as const,
        },
        { onConflict: "admin_manufacturer_id,user_id" }
      );

      // Ensure the invited user has a manufacturer profile so they can access
      // the dashboard. Create one if missing, using the admin_manufacturer's
      // company name as the seed.
      const { data: existingProfile } = await admin
        .from("manufacturer_profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!existingProfile) {
        const { data: mfgInfo } = await admin
          .from("admin_manufacturers")
          .select("company_name")
          .eq("id", invitation.admin_manufacturer_id)
          .maybeSingle();

        await admin.from("manufacturer_profiles").insert({
          user_id: data.user.id,
          company_name: mfgInfo?.company_name || "Unnamed Company",
        });
      }
    }
  }

  return response;
}
