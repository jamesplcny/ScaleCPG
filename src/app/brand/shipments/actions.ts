"use server";

import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createShipmentAction(data: {
  manufacturerId: string;
  shippingMethod: string;
  statusReportItemIds: string[];
  pickupDate?: string | null;
}) {
  const { brandId } = await requireBrandUser();
  const supabase = await createClient();

  if (data.statusReportItemIds.length === 0) {
    return { error: "No items selected." };
  }

  // Verify all status report items belong to this brand and manufacturer with shipping details
  const { data: rawItems } = await supabase
    .from("status_report_items")
    .select("id, brand_id, manufacturer_id, status, shipping_sent_at")
    .in("id", data.statusReportItemIds)
    .eq("brand_id", brandId)
    .eq("manufacturer_id", data.manufacturerId)
    .not("shipping_sent_at", "is", null);

  const validItems = (rawItems ?? []) as {
    id: string;
    brand_id: string;
    manufacturer_id: string;
    status: string;
    shipping_sent_at: string | null;
  }[];

  if (validItems.length !== data.statusReportItemIds.length) {
    return { error: "Some items are not valid for shipment." };
  }

  // Check none are already in a shipment request
  const { data: existingLinks } = await supabase
    .from("shipment_request_items")
    .select("status_report_item_id")
    .in("status_report_item_id", data.statusReportItemIds);

  if ((existingLinks ?? []).length > 0) {
    return { error: "Some items are already in a shipment request." };
  }

  // Create the shipment request
  const insertPayload: {
    brand_id: string;
    manufacturer_id: string;
    shipping_method: string;
    pickup_date?: string;
  } = {
    brand_id: brandId,
    manufacturer_id: data.manufacturerId,
    shipping_method: data.shippingMethod,
  };
  if (data.pickupDate) {
    insertPayload.pickup_date = data.pickupDate;
  }

  const { data: shipment, error: insertError } = await supabase
    .from("shipment_requests")
    .insert(insertPayload)
    .select("id")
    .single();

  if (insertError || !shipment) {
    return { error: insertError?.message ?? "Failed to create shipment request." };
  }

  const shipmentId = (shipment as { id: string }).id;

  // Link items to the shipment request
  const linkRows = data.statusReportItemIds.map((srItemId) => ({
    shipment_request_id: shipmentId,
    status_report_item_id: srItemId,
  }));

  const { error: linkError } = await supabase
    .from("shipment_request_items")
    .insert(linkRows);

  if (linkError) {
    return { error: linkError.message };
  }

  revalidatePath("/brand/shipments");
  revalidatePath("/brand/status-report");
  revalidatePath("/status-report");

  return { success: true };
}
