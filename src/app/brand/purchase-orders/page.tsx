import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BrandAllPurchaseOrders } from "./BrandAllPurchaseOrders";

export default async function BrandPurchaseOrdersPage() {
  const { brandId } = await requireBrandUser();
  const supabase = await createClient();

  // Fetch ALL purchase orders for this brand (across all manufacturers)
  const { data: rawOrders } = await supabase
    .from("purchase_orders")
    .select("id, manufacturer_id, status, place_of_delivery, market, ready_by_date, note, created_at")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });

  const orders = (rawOrders ?? []) as {
    id: string;
    manufacturer_id: string;
    status: string;
    place_of_delivery: string | null;
    market: string | null;
    ready_by_date: string | null;
    note: string | null;
    created_at: string;
  }[];

  // Get unique manufacturer IDs and fetch names
  const mfgIds = [...new Set(orders.map((o) => o.manufacturer_id))];
  const { data: rawMfgs } = mfgIds.length > 0
    ? await supabase
        .from("manufacturer_profiles")
        .select("id, company_name")
        .in("id", mfgIds)
    : { data: [] };

  const mfgMap = new Map<string, string>();
  for (const m of (rawMfgs ?? []) as { id: string; company_name: string }[]) {
    mfgMap.set(m.id, m.company_name);
  }

  // Fetch line items for all orders
  const orderIds = orders.map((o) => o.id);
  const { data: rawItems } = orderIds.length > 0
    ? await supabase
        .from("purchase_order_items")
        .select("id, purchase_order_id, approved_product_id, item_name, quantity")
        .in("purchase_order_id", orderIds)
    : { data: [] };

  const items = (rawItems ?? []) as {
    id: string;
    purchase_order_id: string;
    approved_product_id: string | null;
    item_name: string;
    quantity: number;
  }[];

  const itemsByOrder = new Map<string, typeof items>();
  for (const item of items) {
    const existing = itemsByOrder.get(item.purchase_order_id) ?? [];
    existing.push(item);
    itemsByOrder.set(item.purchase_order_id, existing);
  }

  // Build price map
  const allApprovedProductIds = [...new Set(items.map((i) => i.approved_product_id).filter(Boolean))] as string[];
  const { data: rawPrices } = allApprovedProductIds.length > 0
    ? await supabase
        .from("approved_products")
        .select("id, price_per_unit")
        .in("id", allApprovedProductIds)
    : { data: [] };

  const priceMap = new Map<string, number>();
  for (const p of (rawPrices ?? []) as { id: string; price_per_unit: number | null }[]) {
    if (p.price_per_unit != null) priceMap.set(p.id, p.price_per_unit);
  }

  const serializedOrders = orders.map((order) => ({
    id: order.id,
    manufacturerName: mfgMap.get(order.manufacturer_id) ?? "—",
    status: order.status,
    place_of_delivery: order.place_of_delivery,
    market: order.market,
    ready_by_date: order.ready_by_date,
    note: order.note,
    created_at: order.created_at,
    items: (itemsByOrder.get(order.id) ?? []).map((i) => ({
      id: i.id,
      item_name: i.item_name,
      quantity: i.quantity,
      price_per_unit: priceMap.get(i.approved_product_id ?? "") ?? null,
    })),
  }));

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-semibold text-2xl text-text-primary">Purchase Orders</h2>
        <p className="text-sm text-text-secondary mt-1">
          All purchase orders across all manufacturers.
        </p>
      </div>

      <BrandAllPurchaseOrders orders={serializedOrders} />
    </div>
  );
}
