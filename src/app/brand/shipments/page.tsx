import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BrandShipmentsClient } from "./BrandShipmentsClient";

export default async function BrandShipmentsPage() {
  const { brandId } = await requireBrandUser();
  const supabase = await createClient();

  // Fetch status report items for this brand (excluding rejected)
  const { data: rawSrItems } = await supabase
    .from("status_report_items")
    .select("id, manufacturer_id, purchase_order_id, purchase_order_item_id, status, shipping_sent_at, shipping_method, added_at, box_length, box_width, box_height, box_weight, box_count, pallet_length, pallet_width, pallet_height, pallet_weight, pallet_count, lot_number, expiration_date")
    .eq("brand_id", brandId)
    .neq("status", "rejected")
    .order("added_at", { ascending: false });

  const srItems = (rawSrItems ?? []) as {
    id: string;
    manufacturer_id: string;
    purchase_order_id: string;
    purchase_order_item_id: string;
    status: string;
    shipping_sent_at: string | null;
    shipping_method: string | null;
    added_at: string;
    box_length: number | null;
    box_width: number | null;
    box_height: number | null;
    box_weight: number | null;
    box_count: number | null;
    pallet_length: number | null;
    pallet_width: number | null;
    pallet_height: number | null;
    pallet_weight: number | null;
    pallet_count: number | null;
    lot_number: string | null;
    expiration_date: string | null;
  }[];

  // Fetch shipment requests for this brand
  const { data: rawShipments } = await supabase
    .from("shipment_requests")
    .select("id, manufacturer_id, shipping_method, pickup_date, status, created_at")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });

  const shipments = (rawShipments ?? []) as {
    id: string;
    manufacturer_id: string;
    shipping_method: string;
    pickup_date: string | null;
    status: string;
    created_at: string;
  }[];

  // Fetch shipment request items
  const shipmentIds = shipments.map((s) => s.id);
  const { data: rawShipmentItems } = shipmentIds.length > 0
    ? await supabase
        .from("shipment_request_items")
        .select("shipment_request_id, status_report_item_id")
        .in("shipment_request_id", shipmentIds)
    : { data: [] };

  const shipmentItems = (rawShipmentItems ?? []) as {
    shipment_request_id: string;
    status_report_item_id: string;
  }[];

  if (srItems.length === 0 && shipments.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="font-semibold text-2xl text-text-primary">Shipments</h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage shipments across all manufacturers.
          </p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">No shipments yet.</p>
        </div>
      </div>
    );
  }

  // Batch fetch manufacturer names
  const mfgIds = [...new Set([
    ...srItems.map((s) => s.manufacturer_id),
    ...shipments.map((s) => s.manufacturer_id),
  ])];
  const { data: rawMfgs } = await supabase
    .from("manufacturer_profiles")
    .select("id, company_name")
    .in("id", mfgIds);

  const mfgMap = new Map<string, string>();
  for (const m of (rawMfgs ?? []) as { id: string; company_name: string }[]) {
    mfgMap.set(m.id, m.company_name);
  }

  // Batch fetch PO items
  const poItemIds = srItems.map((s) => s.purchase_order_item_id);
  const { data: rawPoItems } = poItemIds.length > 0
    ? await supabase
        .from("purchase_order_items")
        .select("id, purchase_order_id, approved_product_id, item_name, quantity")
        .in("id", poItemIds)
    : { data: [] };

  const poItems = (rawPoItems ?? []) as {
    id: string;
    purchase_order_id: string;
    approved_product_id: string | null;
    item_name: string;
    quantity: number;
  }[];

  const poItemMap = new Map<string, (typeof poItems)[0]>();
  for (const item of poItems) {
    poItemMap.set(item.id, item);
  }

  // Batch fetch PO details
  const poIds = [...new Set(srItems.map((s) => s.purchase_order_id))];
  const { data: rawPos } = poIds.length > 0
    ? await supabase.from("purchase_orders").select("id, place_of_delivery, market, created_at").in("id", poIds)
    : { data: [] };

  const poMap = new Map<string, { place_of_delivery: string | null; market: string | null; created_at: string }>();
  for (const po of (rawPos ?? []) as { id: string; place_of_delivery: string | null; market: string | null; created_at: string }[]) {
    poMap.set(po.id, po);
  }

  // Batch fetch prices
  const approvedProductIds = [...new Set(poItems.map((i) => i.approved_product_id).filter(Boolean))] as string[];
  const { data: rawPrices } = approvedProductIds.length > 0
    ? await supabase.from("approved_products").select("id, price_per_unit").in("id", approvedProductIds)
    : { data: [] };

  const priceMap = new Map<string, number>();
  for (const p of (rawPrices ?? []) as { id: string; price_per_unit: number | null }[]) {
    if (p.price_per_unit != null) priceMap.set(p.id, p.price_per_unit);
  }

  // Check which items already have shipment requests
  const srItemIds = srItems.map((s) => s.id);
  const { data: rawShipmentLinks } = srItemIds.length > 0
    ? await supabase
        .from("shipment_request_items")
        .select("status_report_item_id")
        .in("status_report_item_id", srItemIds)
    : { data: [] };

  const itemsWithShipment = new Set(
    ((rawShipmentLinks ?? []) as { status_report_item_id: string }[]).map((l) => l.status_report_item_id)
  );

  // Serialize items for Ready for Pickup
  const rows = srItems.map((sr) => {
    const poItem = poItemMap.get(sr.purchase_order_item_id);
    const po = poMap.get(sr.purchase_order_id);
    const pricePerUnit = poItem?.approved_product_id ? priceMap.get(poItem.approved_product_id) ?? null : null;
    const quantity = poItem?.quantity ?? 0;
    const lineTotal = pricePerUnit != null ? quantity * pricePerUnit : null;

    return {
      id: sr.id,
      manufacturerId: sr.manufacturer_id,
      manufacturerName: mfgMap.get(sr.manufacturer_id) ?? "—",
      poId: sr.purchase_order_id,
      itemName: poItem?.item_name ?? "—",
      quantity,
      lineTotal,
      pricePerUnit,
      destination: po?.place_of_delivery ?? null,
      market: po?.market ?? null,
      requestedDate: po?.created_at ?? null,
      status: sr.status,
      shippingMethod: sr.shipping_method,
      shippingSentAt: sr.shipping_sent_at,
      hasShipmentRequest: itemsWithShipment.has(sr.id),
      boxLength: sr.box_length,
      boxWidth: sr.box_width,
      boxHeight: sr.box_height,
      boxWeight: sr.box_weight,
      boxCount: sr.box_count,
      palletLength: sr.pallet_length,
      palletWidth: sr.pallet_width,
      palletHeight: sr.pallet_height,
      palletWeight: sr.pallet_weight,
      palletCount: sr.pallet_count,
      lotNumber: sr.lot_number,
      expirationDate: sr.expiration_date,
    };
  });

  // Build SR item lookup for shipment request items
  const srItemLookup = new Map<string, { itemName: string; quantity: number; boxCount: number | null; palletCount: number | null }>();
  for (const sr of srItems) {
    const poItem = poItemMap.get(sr.purchase_order_item_id);
    srItemLookup.set(sr.id, {
      itemName: poItem?.item_name ?? "—",
      quantity: poItem?.quantity ?? 0,
      boxCount: sr.box_count,
      palletCount: sr.pallet_count,
    });
  }

  // Serialize shipment request rows
  const shipmentRequestRows = shipments.map((s) => ({
    id: s.id,
    manufacturerName: mfgMap.get(s.manufacturer_id) ?? "—",
    shippingMethod: s.shipping_method,
    pickupDate: s.pickup_date,
    status: s.status,
    createdAt: s.created_at,
    items: shipmentItems
      .filter((si) => si.shipment_request_id === s.id)
      .map((si) => {
        const info = srItemLookup.get(si.status_report_item_id);
        return {
          itemName: info?.itemName ?? "—",
          quantity: info?.quantity ?? 0,
          boxCount: info?.boxCount ?? null,
          palletCount: info?.palletCount ?? null,
        };
      }),
  }));

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-semibold text-2xl text-text-primary">Shipments</h2>
        <p className="text-sm text-text-secondary mt-1">
          Manage shipments across all manufacturers.
        </p>
      </div>

      <BrandShipmentsClient items={rows} shipmentRequests={shipmentRequestRows} />
    </div>
  );
}
