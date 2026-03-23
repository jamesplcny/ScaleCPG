"use server";

import { revalidatePath } from "next/cache";
import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function addToMyProductsAction(data: {
  approvedProductId: string;
}) {
  const { brandId } = await requireBrandUser();
  const supabase = await createClient();

  // Verify ownership
  const { data: product } = await supabase
    .from("approved_products")
    .select("id, brand_id, status, source_request_id")
    .eq("id", data.approvedProductId)
    .eq("brand_id", brandId)
    .maybeSingle();

  if (!product) return { error: "Product not found." };

  const p = product as { id: string; brand_id: string; status: string; source_request_id: string | null };

  // Idempotent: if already current, succeed silently
  if (p.status === "current") return { error: null };
  if (p.status !== "new") return { error: "Product is not in 'new' status." };

  const { error: updateError } = await supabase
    .from("approved_products")
    .update({ status: "current" } as never)
    .eq("id", data.approvedProductId);

  if (updateError) return { error: updateError.message };

  // Also update the source quote request status so it no longer appears
  if (p.source_request_id) {
    await supabase
      .from("product_catalog_requests")
      .update({ status: "added_to_products" } as never)
      .eq("id", p.source_request_id)
      .eq("brand_id", brandId);
  }

  revalidatePath("/brand/products");
  return { error: null };
}
