"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireBrandUser } from "@/lib/auth";

export async function addBrandProduct(formData: FormData) {
  const { brandId } = await requireBrandUser();
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  const sku = (formData.get("sku") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name) return { error: "Product name is required." };

  const { error } = await supabase.from("brand_products").insert({
    brand_id: brandId,
    name,
    sku,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath("/brand/dashboard");
  return { error: null };
}

export async function deleteBrandProduct(productId: string) {
  await requireBrandUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("brand_products")
    .delete()
    .eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/brand/dashboard");
  return { error: null };
}
