"use server";

import { requireManufacturerUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ReviewedItem = {
  purchaseOrderItemId: string;
  status: "accepted" | "delayed" | "rejected";
  note?: string;
};

export async function submitPOReviewAction(data: {
  purchaseOrderId: string;
  items: ReviewedItem[];
}) {
  const { user } = await requireManufacturerUser();
  const supabase = await createClient();

  // Get manufacturer profile
  const { data: profile } = await supabase
    .from("manufacturer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) return { error: "No manufacturer profile found." };
  const manufacturerId = (profile as { id: string }).id;

  // Verify the PO belongs to this manufacturer
  const { data: po } = await supabase
    .from("purchase_orders")
    .select("id, brand_id, manufacturer_id")
    .eq("id", data.purchaseOrderId)
    .eq("manufacturer_id", manufacturerId)
    .maybeSingle();

  if (!po) return { error: "Purchase order not found." };
  const brandId = (po as { brand_id: string }).brand_id;

  // Check which items already exist in status report (idempotency)
  const itemIds = data.items.map((i) => i.purchaseOrderItemId);
  const { data: existing } = await supabase
    .from("status_report_items")
    .select("purchase_order_item_id")
    .in("purchase_order_item_id", itemIds);

  const existingIds = new Set(
    ((existing ?? []) as { purchase_order_item_id: string }[]).map(
      (e) => e.purchase_order_item_id
    )
  );

  // Filter to only new items
  const newItems = data.items.filter(
    (i) => !existingIds.has(i.purchaseOrderItemId)
  );

  if (newItems.length > 0) {
    const rows = newItems.map((item) => ({
      manufacturer_id: manufacturerId,
      purchase_order_id: data.purchaseOrderId,
      purchase_order_item_id: item.purchaseOrderItemId,
      brand_id: brandId,
      status: item.status,
      note: item.note ?? null,
    }));

    const { error: insertError } = await supabase
      .from("status_report_items")
      .insert(rows);

    if (insertError) return { error: insertError.message };
  }

  // Update PO status to completed (manufacturer has reviewed all items)
  await supabase
    .from("purchase_orders")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", data.purchaseOrderId)
    .eq("manufacturer_id", manufacturerId);

  revalidatePath("/purchase-orders");
  revalidatePath("/status-report");

  return { success: true, added: newItems.length };
}

export type ShippingDetails = {
  statusReportItemId: string;
  boxLength: number;
  boxWidth: number;
  boxHeight: number;
  boxWeight: number;
  boxCount: number;
  palletLength: number;
  palletWidth: number;
  palletHeight: number;
  palletWeight: number;
  palletCount: number;
  lotNumber: string | null;
  expirationDate: string;
};

export async function sendShippingDetailsAction(data: ShippingDetails) {
  const { user } = await requireManufacturerUser();
  const supabase = await createClient();

  // Server-side required field validation
  if (
    data.boxLength == null || data.boxWidth == null || data.boxHeight == null ||
    data.boxWeight == null || data.boxCount == null ||
    data.palletLength == null || data.palletWidth == null || data.palletHeight == null ||
    data.palletWeight == null || data.palletCount == null ||
    !data.expirationDate
  ) {
    return { error: "All fields are required except Lot Number." };
  }

  // Get manufacturer profile
  const { data: profile } = await supabase
    .from("manufacturer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) return { error: "No manufacturer profile found." };
  const manufacturerId = (profile as { id: string }).id;

  // Verify this status report item belongs to this manufacturer and hasn't been sent already
  const { data: srItem } = await supabase
    .from("status_report_items")
    .select("id, manufacturer_id, shipping_sent_at")
    .eq("id", data.statusReportItemId)
    .eq("manufacturer_id", manufacturerId)
    .maybeSingle();

  if (!srItem) return { error: "Status report item not found." };

  const item = srItem as { id: string; shipping_sent_at: string | null };
  if (item.shipping_sent_at) return { error: "Shipping details already sent for this item." };

  // Update with shipping details + set status to "requested"
  const { error: updateError } = await supabase
    .from("status_report_items")
    .update({
      box_length: data.boxLength,
      box_width: data.boxWidth,
      box_height: data.boxHeight,
      box_weight: data.boxWeight,
      box_count: data.boxCount,
      pallet_length: data.palletLength,
      pallet_width: data.palletWidth,
      pallet_height: data.palletHeight,
      pallet_weight: data.palletWeight,
      pallet_count: data.palletCount,
      lot_number: data.lotNumber || null,
      expiration_date: data.expirationDate,
      shipping_sent_at: new Date().toISOString(),
    })
    .eq("id", data.statusReportItemId)
    .eq("manufacturer_id", manufacturerId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/status-report");
  revalidatePath("/brand/status-report");
  revalidatePath("/brand/shipments");

  return { success: true };
}

export async function completeShipmentRequestAction(shipmentRequestId: string) {
  const { user } = await requireManufacturerUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("manufacturer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) return { error: "No manufacturer profile found." };
  const manufacturerId = (profile as { id: string }).id;

  const { error: updateError } = await supabase
    .from("shipment_requests")
    .update({ status: "completed" })
    .eq("id", shipmentRequestId)
    .eq("manufacturer_id", manufacturerId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/shipments");
  revalidatePath("/status-report");
  revalidatePath("/brand/status-report");
  revalidatePath("/brand/shipments");

  return { success: true };
}
