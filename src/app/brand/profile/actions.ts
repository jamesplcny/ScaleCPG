"use server";

import { revalidatePath } from "next/cache";
import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function saveBrandProfileAction(data: {
  name: string;
  website: string;
  description: string;
  primary_contact_name: string;
  sales_channels: string[];
  product_categories: string[];
}) {
  const { brandId } = await requireBrandUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("brands")
    .update({
      name: data.name,
      website: data.website,
      description: data.description,
      primary_contact_name: data.primary_contact_name,
      sales_channels: data.sales_channels,
      product_categories: data.product_categories,
    })
    .eq("id", brandId);

  if (error) return { error: error.message };

  revalidatePath("/brand/profile");
  return { error: null };
}
