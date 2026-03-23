import { requireManufacturerUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatusReportClient } from "./StatusReportClient";
import type { StatusReportRow } from "./StatusReportClient";

export default async function StatusReportPage() {
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

  // ── Fetch status report items ──
  const { data: rawSrItems } = await supabase
    .from("status_report_items")
    .select("id, purchase_order_id, purchase_order_item_id, brand_id, status, note, added_at, shipping_sent_at")
    .eq("manufacturer_id", manufacturerId)
    .order("added_at", { ascending: false });

  const srItems = (rawSrItems ?? []) as {
    id: string;
    purchase_order_id: string;
    purchase_order_item_id: string;
    brand_id: string;
    status: string;
    note: string | null;
    added_at: string;
    shipping_sent_at: string | null;
  }[];

  if (srItems.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="font-semibold text-2xl text-text-primary">Status Report</h2>
          <p className="text-sm text-text-secondary mt-1">Track purchase order items.</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">No items in your status report yet. Add items from your Purchase Orders.</p>
        </div>
      </div>
    );
  }

  // ── Batch fetch related data ──
  const poItemIds = srItems.map((s) => s.purchase_order_item_id);
  const poIds = [...new Set(srItems.map((s) => s.purchase_order_id))];
  const allBrandIds = [...new Set(srItems.map((s) => s.brand_id))];

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

  const { data: rawPos } = poIds.length > 0
    ? await supabase.from("purchase_orders").select("id, place_of_delivery, market, created_at").in("id", poIds)
    : { data: [] };

  const poMap = new Map<string, { place_of_delivery: string | null; market: string | null; created_at: string }>();
  for (const po of (rawPos ?? []) as { id: string; place_of_delivery: string | null; market: string | null; created_at: string }[]) {
    poMap.set(po.id, po);
  }

  const { data: rawBrands } = allBrandIds.length > 0
    ? await supabase.from("brands").select("id, name").in("id", allBrandIds)
    : { data: [] };

  const brandMap = new Map<string, string>();
  for (const b of (rawBrands ?? []) as { id: string; name: string }[]) {
    brandMap.set(b.id, b.name);
  }

  const approvedProductIds = [...new Set(poItems.map((i) => i.approved_product_id).filter(Boolean))] as string[];
  const { data: rawPrices } = approvedProductIds.length > 0
    ? await supabase.from("approved_products").select("id, price_per_unit").in("id", approvedProductIds)
    : { data: [] };

  const priceMap = new Map<string, number>();
  for (const p of (rawPrices ?? []) as { id: string; price_per_unit: number | null }[]) {
    if (p.price_per_unit != null) priceMap.set(p.id, p.price_per_unit);
  }

  // ── Serialize status report rows ──
  const rows: StatusReportRow[] = srItems.map((sr) => {
    const poItem = poItemMap.get(sr.purchase_order_item_id);
    const po = poMap.get(sr.purchase_order_id);
    const pricePerUnit = poItem?.approved_product_id ? priceMap.get(poItem.approved_product_id) ?? null : null;
    const quantity = poItem?.quantity ?? 0;
    const lineTotal = pricePerUnit != null ? quantity * pricePerUnit : null;

    return {
      id: sr.id,
      purchaseOrderId: sr.purchase_order_id,
      brandName: brandMap.get(sr.brand_id) ?? "—",
      itemName: poItem?.item_name ?? "—",
      quantity,
      pricePerUnit,
      lineTotal,
      destination: po?.place_of_delivery ?? null,
      market: po?.market ?? null,
      status: sr.status,
      requestedDate: po?.created_at ?? null,
      shippingSentAt: sr.shipping_sent_at,
    };
  });

  return <StatusReportClient items={rows} />;
}
