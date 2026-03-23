import { requireManufacturerUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PurchaseOrderCardsView } from "@/components/purchase-orders/PurchaseOrderCardsView";
import type { PurchaseOrderCardData, StoredReviewDecision } from "@/components/purchase-orders/PurchaseOrderCardsView";

export default async function ManufacturerPurchaseOrdersPage() {
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

  // Fetch all purchase orders for this manufacturer
  const { data: rawOrders } = await supabase
    .from("purchase_orders")
    .select("id, brand_id, status, place_of_delivery, market, ready_by_date, note, created_at")
    .eq("manufacturer_id", manufacturerId)
    .order("created_at", { ascending: false });

  const orders = (rawOrders ?? []) as {
    id: string;
    brand_id: string;
    status: string;
    place_of_delivery: string | null;
    market: string | null;
    ready_by_date: string | null;
    note: string | null;
    created_at: string;
  }[];

  // Fetch brand names
  const brandIds = [...new Set(orders.map((o) => o.brand_id))];
  const { data: rawBrands } = brandIds.length > 0
    ? await supabase.from("brands").select("id, name").in("id", brandIds)
    : { data: [] };

  const brandMap = new Map<string, string>();
  for (const b of (rawBrands ?? []) as { id: string; name: string }[]) {
    brandMap.set(b.id, b.name);
  }

  // Fetch line items for all orders
  const orderIds = orders.map((o) => o.id);
  const { data: rawItems } = orderIds.length > 0
    ? await supabase
        .from("purchase_order_items")
        .select("id, purchase_order_id, approved_product_id, item_name, quantity")
        .in("purchase_order_id", orderIds)
    : { data: [] };

  const items = (rawItems ?? []) as { id: string; purchase_order_id: string; approved_product_id: string | null; item_name: string; quantity: number }[];

  // Fetch prices from approved_products
  const approvedProductIds = [...new Set(items.map((i) => i.approved_product_id).filter(Boolean))] as string[];
  const { data: rawPrices } = approvedProductIds.length > 0
    ? await supabase
        .from("approved_products")
        .select("id, price_per_unit")
        .in("id", approvedProductIds)
    : { data: [] };

  const priceMap = new Map<string, number>();
  for (const p of (rawPrices ?? []) as { id: string; price_per_unit: number | null }[]) {
    if (p.price_per_unit != null) priceMap.set(p.id, p.price_per_unit);
  }

  // Fetch status report items (decisions) for all PO items
  const allItemIds = items.map((i) => i.id);
  const { data: rawSrItems } = allItemIds.length > 0
    ? await supabase
        .from("status_report_items")
        .select("purchase_order_item_id, status, note")
        .eq("manufacturer_id", manufacturerId)
        .in("purchase_order_item_id", allItemIds)
    : { data: [] };

  // Build review decisions map (keyed by purchase_order_item_id)
  const reviewDecisionsMap: Record<string, StoredReviewDecision> = {};
  for (const sr of (rawSrItems ?? []) as { purchase_order_item_id: string; status: string; note: string | null }[]) {
    reviewDecisionsMap[sr.purchase_order_item_id] = {
      status: sr.status,
      note: sr.note,
    };
  }

  // Group items by order
  const itemsByOrder = new Map<string, typeof items>();
  for (const item of items) {
    const existing = itemsByOrder.get(item.purchase_order_id) ?? [];
    existing.push(item);
    itemsByOrder.set(item.purchase_order_id, existing);
  }

  const cardOrders: PurchaseOrderCardData[] = orders.map((order) => ({
    id: order.id,
    status: order.status,
    place_of_delivery: order.place_of_delivery,
    market: order.market,
    ready_by_date: order.ready_by_date,
    note: order.note,
    created_at: order.created_at,
    brand_name: brandMap.get(order.brand_id) ?? "—",
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
          View all purchase orders from your clients.
        </p>
      </div>

      <PurchaseOrderCardsView
        orders={cardOrders}
        enableActions
        reviewDecisionsMap={reviewDecisionsMap}
      />
    </div>
  );
}
