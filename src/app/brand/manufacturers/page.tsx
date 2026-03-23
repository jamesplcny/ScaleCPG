import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ManufacturerProfile, ManufacturerCapability, BrandManufacturerApplication } from "@/types/database";
import { ManufacturersGrid } from "./ManufacturersGrid";

export default async function BrandManufacturersPage() {
  const { brandId } = await requireBrandUser();

  const supabase = await createClient();

  const { data: profiles } = (await supabase
    .from("manufacturer_profiles")
    .select("*")
    .eq("status", "approved")
    .order("company_name")) as { data: ManufacturerProfile[] | null; error: unknown };

  const manufacturers = profiles ?? [];

  // Bulk fetch capabilities
  const userIds = manufacturers.map((m) => m.user_id);
  const { data: capData } = (await supabase
    .from("manufacturer_capabilities")
    .select("*")
    .in("user_id", userIds)) as { data: ManufacturerCapability[] | null; error: unknown };

  const capsByUser = new Map<string, string[]>();
  for (const cap of capData ?? []) {
    const existing = capsByUser.get(cap.user_id) ?? [];
    existing.push(cap.capability);
    capsByUser.set(cap.user_id, existing);
  }

  // Fetch ALL applications for this brand (including rejected ones for cooldown)
  const { data: rawApps } = await supabase
    .from("brand_manufacturer_applications")
    .select("*")
    .eq("brand_id", brandId);

  const apps = (rawApps ?? []) as BrandManufacturerApplication[];

  // Build a map: manufacturer_id -> latest application
  // For each manufacturer, use the most recent application
  const appsByMfg = new Map<string, BrandManufacturerApplication>();
  for (const app of apps) {
    const existing = appsByMfg.get(app.manufacturer_id);
    if (!existing || new Date(app.created_at) > new Date(existing.created_at)) {
      appsByMfg.set(app.manufacturer_id, app);
    }
  }

  // Serialize for client component
  const mfgData = manufacturers.map((mfg) => {
    const latestApp = appsByMfg.get(mfg.id);
    return {
      id: mfg.id,
      user_id: mfg.user_id,
      company_name: mfg.company_name,
      company_description: mfg.company_description,
      location: mfg.location,
      moq: mfg.moq,
      lead_time: mfg.lead_time,
      verified: mfg.verified,
      public_slug: mfg.public_slug,
      capabilities: capsByUser.get(mfg.user_id) ?? [],
      applicationStatus: latestApp?.status ?? null,
      rejectedUntil: latestApp?.rejected_until ?? null,
    };
  });

  return (
    <>
      <div className="mb-8">
        <h2 className="font-semibold text-2xl text-text-primary">
          Manufacturers
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Your manufacturer partners and available production partners.
        </p>
      </div>

      <ManufacturersGrid manufacturers={mfgData} brandId={brandId} />
    </>
  );
}
