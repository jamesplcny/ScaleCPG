import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BrandProfileForm } from "./BrandProfileForm";

export default async function BrandProfilePage() {
  const { brandId, user } = await requireBrandUser();

  const supabase = await createClient();
  const { data: brand } = await supabase
    .from("brands")
    .select("name, description, website, primary_contact_name, sales_channels, product_categories")
    .eq("id", brandId)
    .single();

  const initial = {
    name: brand?.name ?? "",
    website: brand?.website ?? "",
    description: brand?.description ?? "",
    primary_contact_name: brand?.primary_contact_name ?? "",
    sales_channels: brand?.sales_channels ?? [],
    product_categories: brand?.product_categories ?? [],
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="font-semibold text-2xl text-text-primary">My Profile</h2>
        <p className="text-sm text-text-secondary mt-1">
          Update your brand information visible to manufacturers.
        </p>
      </div>

      <BrandProfileForm initial={initial} email={user.email} />
    </>
  );
}
