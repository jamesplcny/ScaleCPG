import { requireManufacturerUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ShipmentsClient } from "./ShipmentsClient";
import type { ShipmentRow } from "./ShipmentsClient";

export default async function ShipmentsPage() {
  const { user } = await requireManufacturerUser();
  const supabase = await createClient();

  // Get manufacturer profile
  const { data: profile } = await supabase
    .from("manufacturer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted text-sm">No manufacturer profile found.</p>
      </div>
    );
  }

  const manufacturerId = (profile as { id: string }).id;

  // Fetch shipment requests
  const { data: rawShipments } = await supabase
    .from("shipment_requests")
    .select("id, brand_id, shipping_method, pickup_date, status, created_at")
    .eq("manufacturer_id", manufacturerId)
    .order("created_at", { ascending: false });

  const shipments = (rawShipments ?? []) as {
    id: string;
    brand_id: string;
    shipping_method: string;
    pickup_date: string | null;
    status: string;
    created_at: string;
  }[];

  if (shipments.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="font-semibold text-2xl text-text-primary">Shipments</h2>
          <p className="text-sm text-text-secondary mt-1">Manage shipment requests from your clients.</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">No shipments yet.</p>
        </div>
      </div>
    );
  }

  // Fetch shipment request items
  const shipmentIds = shipments.map((s) => s.id);
  const { data: rawShipmentItems } = await supabase
    .from("shipment_request_items")
    .select("id, shipment_request_id, status_report_item_id")
    .in("shipment_request_id", shipmentIds);

  const shipmentItems = (rawShipmentItems ?? []) as {
    id: string;
    shipment_request_id: string;
    status_report_item_id: string;
  }[];

  // Batch fetch SR items for item names/quantities
  const srItemIds = [...new Set(shipmentItems.map((si) => si.status_report_item_id))];
  const { data: rawSrItems } = srItemIds.length > 0
    ? await supabase
        .from("status_report_items")
        .select("id, purchase_order_item_id")
        .in("id", srItemIds)
    : { data: [] };

  const srItems = (rawSrItems ?? []) as { id: string; purchase_order_item_id: string }[];

  // Batch fetch PO items
  const poItemIds = [...new Set(srItems.map((s) => s.purchase_order_item_id))];
  const { data: rawPoItems } = poItemIds.length > 0
    ? await supabase
        .from("purchase_order_items")
        .select("id, item_name, quantity")
        .in("id", poItemIds)
    : { data: [] };

  const poItemMap = new Map<string, { item_name: string; quantity: number }>();
  for (const p of (rawPoItems ?? []) as { id: string; item_name: string; quantity: number }[]) {
    poItemMap.set(p.id, p);
  }

  // SR item → PO item lookup
  const srToPoItem = new Map<string, string>();
  for (const sr of srItems) {
    srToPoItem.set(sr.id, sr.purchase_order_item_id);
  }

  // Batch fetch brand names
  const brandIds = [...new Set(shipments.map((s) => s.brand_id))];
  const { data: rawBrands } = brandIds.length > 0
    ? await supabase.from("brands").select("id, name").in("id", brandIds)
    : { data: [] };

  const brandMap = new Map<string, string>();
  for (const b of (rawBrands ?? []) as { id: string; name: string }[]) {
    brandMap.set(b.id, b.name);
  }

  // Serialize
  const rows: ShipmentRow[] = shipments.map((s) => ({
    id: s.id,
    brandName: brandMap.get(s.brand_id) ?? "—",
    shippingMethod: s.shipping_method,
    pickupDate: s.pickup_date,
    status: s.status,
    createdAt: s.created_at,
    items: shipmentItems
      .filter((si) => si.shipment_request_id === s.id)
      .map((si) => {
        const poItemId = srToPoItem.get(si.status_report_item_id);
        const poItem = poItemId ? poItemMap.get(poItemId) : undefined;
        return {
          statusReportItemId: si.status_report_item_id,
          itemName: poItem?.item_name ?? "—",
          quantity: poItem?.quantity ?? 0,
        };
      }),
  }));

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-semibold text-2xl text-text-primary">Shipments</h2>
        <p className="text-sm text-text-secondary mt-1">Manage shipment requests from your clients.</p>
      </div>
      <ShipmentsClient shipments={rows} />
    </div>
  );
}
