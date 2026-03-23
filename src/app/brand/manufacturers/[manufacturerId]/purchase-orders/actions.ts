"use server";

import { revalidatePath } from "next/cache";
import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createPurchaseOrderAction(data: {
  manufacturerId: string;
  readyByDate: string;
  note: string;
  placeOfDelivery: string;
  market: string;
  items: {
    approvedProductId: string;
    itemName: string;
    quantity: number;
  }[];
}) {
  const { user, brandId } = await requireBrandUser();
  const supabase = await createClient();

  if (data.items.length === 0) return { error: "No items selected." };

  // Verify accepted relationship
  const { data: rawApp } = await supabase
    .from("brand_manufacturer_applications")
    .select("id")
    .eq("brand_id", brandId)
    .eq("manufacturer_id", data.manufacturerId)
    .eq("status", "accepted")
    .maybeSingle();

  if (!rawApp) return { error: "No accepted relationship with this manufacturer." };

  // Create purchase order (defaults to 'pending' status)
  const { data: po, error: poError } = await supabase
    .from("purchase_orders")
    .insert({
      brand_id: brandId,
      manufacturer_id: data.manufacturerId,
      created_by_user_id: user.id,
      ready_by_date: data.readyByDate || null,
      note: data.note || null,
      place_of_delivery: data.placeOfDelivery || null,
      market: data.market || null,
    } as never)
    .select("id")
    .single();

  if (poError) return { error: poError.message };

  // Insert line items
  const lineItems = data.items.map((item) => ({
    purchase_order_id: (po as { id: string }).id,
    approved_product_id: item.approvedProductId,
    item_name: item.itemName,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("purchase_order_items")
    .insert(lineItems as never[]);

  if (itemsError) return { error: itemsError.message };

  revalidatePath(`/brand/manufacturers/${data.manufacturerId}/purchase-orders`);
  return { error: null };
}
