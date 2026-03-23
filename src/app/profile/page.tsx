import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";
import type { ManufacturerProfile, ManufacturerCapability } from "@/types/database";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("manufacturer_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle() as { data: ManufacturerProfile | null; error: unknown };

  const { data: capData } = await supabase
    .from("manufacturer_capabilities")
    .select("*")
    .eq("user_id", user.id) as { data: ManufacturerCapability[] | null; error: unknown };

  const profile = profileData ?? {
    company_name: "",
    company_description: "",
    location: "",
    years_in_business: 0,
    moq: "",
    lead_time: "",
    verified: false,
    public_slug: "",
    profile_visibility: "draft",
  };

  const capabilities = (capData ?? []).map((c) => c.capability);

  return (
    <>
      <div className="mb-8">
        <h2 className="font-semibold text-2xl text-text-primary">My Profile</h2>
        <p className="text-sm text-text-secondary mt-1">Manage your company info and public listing.</p>
      </div>

      <ProfileForm
        initial={{
          company_name: profile.company_name,
          company_description: profile.company_description,
          location: profile.location,
          years_in_business: profile.years_in_business,
          capabilities,
          moq: profile.moq,
          lead_time: profile.lead_time,
          verified: profile.verified,
          public_slug: profile.public_slug,
          profile_visibility: profile.profile_visibility,
        }}
      />
    </>
  );
}
