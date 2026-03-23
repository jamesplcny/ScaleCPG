"use server";

import { revalidatePath } from "next/cache";
import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function submitCatalogRequestAction(data: {
  manufacturerId: string;
  catalogItemId: string;
  itemName: string;
  requestType: "sample_request" | "modification_request" | "order_request" | "quote_request";
  requestBody: string;
  desiredQuantity?: string;
  ingredientList?: string;
  packagingSelection?: string | null;
  accessorySelections?: string[] | null;
  additionalComments?: string | null;
}) {
  const { user, brandId } = await requireBrandUser();
  const supabase = await createClient();

  // Verify accepted relationship
  const { data: rawApp } = await supabase
    .from("brand_manufacturer_applications")
    .select("id")
    .eq("brand_id", brandId)
    .eq("manufacturer_id", data.manufacturerId)
    .eq("status", "accepted")
    .maybeSingle();

  if (!rawApp) return { error: "No accepted relationship with this manufacturer." };

  // Insert structured request row
  const { error: reqError } = await supabase.from("product_catalog_requests").insert({
    brand_id: brandId,
    manufacturer_id: data.manufacturerId,
    popular_item_id: data.catalogItemId,
    request_type: data.requestType,
    item_name: data.itemName,
    request_body: data.requestBody.trim(),
    created_by_user_id: user.id,
    desired_quantity: data.desiredQuantity ?? null,
    packaging_selection: data.packagingSelection ?? null,
    accessory_selections: data.accessorySelections ? data.accessorySelections.join(", ") : null,
    additional_comments: data.additionalComments ?? null,
  } as never);

  if (reqError) {
    console.error("[catalog_request] insert error:", reqError.message);
    return { error: reqError.message };
  }

  revalidatePath(`/brand/manufacturers/${data.manufacturerId}/catalog`);
  return { error: null };
}
