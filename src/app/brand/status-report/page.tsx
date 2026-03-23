import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BrandAllStatusReport } from "./BrandAllStatusReport";

export default async function BrandStatusReportPage() {
  const { brandId } = await requireBrandUser();
  const supabase = await createClient();

  // Fetch ALL status report items for this brand (not just accepted)
  const { data: rawSrItems } = await supabase
    .from("status_report_items")
    .select("id, manufacturer_id, purchase_order_id, purchase_order_item_id, status, added_at, shipping_sent_at")
    .eq("brand_id", brandId)
    .order("added_at", { ascending: false });

  const srItems = (rawSrItems ?? []) as {
    id: string;
    manufacturer_id: string;
    purchase_order_id: string;
    purchase_order_item_id: string;
    status: string;
    added_at: string;
    shipping_sent_at: string | null;
  }[];

  if (srItems.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="font-semibold text-2xl text-text-primary">Status Report</h2>
          <p className="text-sm text-text-secondary mt-1">
            Track the status of your order items across all manufacturers.
          </p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">No items in your status report yet.</p>
        </div>
      </div>
    );
  }

  // Check which SR items are linked to completed shipment requests
  const srItemIds = srItems.map((s) => s.id);
  const { data: rawShipmentLinks } = srItemIds.length > 0
    ? await supabase
        .from("shipment_request_items")
        .select("status_report_item_id, shipment_request_id")
        .in("status_report_item_id", srItemIds)
    : { data: [] };

  const shipmentLinks = (rawShipmentLinks ?? []) as {
    status_report_item_id: string;
    shipment_request_id: string;
  }[];

  // Get shipment request statuses
  const shipmentRequestIds = [...new Set(shipmentLinks.map((l) => l.shipment_request_id))];
  const { data: rawShipmentStatuses } = shipmentRequestIds.length > 0
    ? await supabase
        .from("shipment_requests")
        .select("id, status")
        .in("id", shipmentRequestIds)
    : { data: [] };

  const shipmentStatusMap = new Map<string, string>();
  for (const s of (rawShipmentStatuses ?? []) as { id: string; status: string }[]) {
    shipmentStatusMap.set(s.id, s.status);
  }

  // Build set of SR item IDs that are in completed shipments
  const completedSrItemIds = new Set<string>();
  for (const link of shipmentLinks) {
    if (shipmentStatusMap.get(link.shipment_request_id) === "completed") {
      completedSrItemIds.add(link.status_report_item_id);
    }
  }

  // Batch fetch manufacturer names
  const mfgIds = [...new Set(srItems.map((s) => s.manufacturer_id))];
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

  // Serialize rows
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
      shippingSentAt: sr.shipping_sent_at,
      isCompleted: completedSrItemIds.has(sr.id),
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-semibold text-2xl text-text-primary">Status Report</h2>
        <p className="text-sm text-text-secondary mt-1">
          Track the status of your order items across all manufacturers.
        </p>
      </div>

      <BrandAllStatusReport items={rows} />
    </div>
  );
}
