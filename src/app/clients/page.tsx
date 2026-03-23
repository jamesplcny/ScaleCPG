import { requireManufacturerUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { BrandManufacturerApplication, Brand } from "@/types/database";
import { ClientApplicationsList } from "./ClientApplicationsList";

export default async function ClientsPage() {
  const { user } = await requireManufacturerUser();

  const supabase = await createClient();

  // Get this manufacturer's profile id
  const { data: profile } = await supabase
    .from("manufacturer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <>
        <div className="mb-8">
          <h2 className="font-semibold text-2xl text-text-primary">Clients</h2>
          <p className="text-sm text-text-secondary mt-1">Manage your client partnerships.</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
          <p className="text-text-muted text-sm">Complete your manufacturer profile first.</p>
        </div>
      </>
    );
  }

  // Fetch applications for this manufacturer
  const { data: rawApps } = await supabase
    .from("brand_manufacturer_applications")
    .select("*")
    .eq("manufacturer_id", profile.id)
    .order("created_at", { ascending: false });

  const applications = (rawApps ?? []) as BrandManufacturerApplication[];

  // Fetch brand details for all applications
  const brandIds = applications.map((a) => a.brand_id);
  const { data: rawBrands } = brandIds.length > 0
    ? await supabase
        .from("brands")
        .select("id, name, description, website, sales_channels, product_categories")
        .in("id", brandIds)
    : { data: [] };

  const brands = (rawBrands ?? []) as Pick<Brand, "id" | "name" | "description" | "website" | "sales_channels" | "product_categories">[];

  const brandsMap = new Map<string, (typeof brands)[number]>();
  for (const b of brands) {
    brandsMap.set(b.id, b);
  }

  const appData = applications.map((app) => {
    const brand = brandsMap.get(app.brand_id);
    return {
      id: app.id,
      brand_id: app.brand_id,
      brand_name: brand?.name ?? "Unknown Brand",
      brand_description: brand?.description ?? "",
      brand_website: brand?.website ?? "",
      brand_sales_channels: brand?.sales_channels ?? [],
      brand_product_categories: brand?.product_categories ?? [],
      tell_us_about_yourself: app.tell_us_about_yourself,
      what_are_you_looking_for: app.what_are_you_looking_for,
      already_selling: app.already_selling,
      selling_details: app.selling_details,
      packaging_preference: app.packaging_preference,
      expected_order_quantity: app.expected_order_quantity,
      status: app.status,
      created_at: app.created_at,
    };
  });

  return (
    <>
      <div className="mb-8">
        <h2 className="font-semibold text-2xl text-text-primary">Clients</h2>
        <p className="text-sm text-text-secondary mt-1">
          Review brand applications and manage your client partnerships.
        </p>
      </div>

      <ClientApplicationsList applications={appData} />
    </>
  );
}
