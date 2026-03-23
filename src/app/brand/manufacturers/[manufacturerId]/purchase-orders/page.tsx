import { notFound } from "next/navigation";
import Link from "next/link";
import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { PurchaseOrdersClient } from "./PurchaseOrdersClient";

export default async function PurchaseOrdersPage({
  params,
}: {
  params: Promise<{ manufacturerId: string }>;
}) {
  const { manufacturerId } = await params;
  const { brandId } = await requireBrandUser();

  const supabase = await createClient();

  // Verify manufacturer exists
  const { data: mfgProfile } = await supabase
    .from("manufacturer_profiles")
    .select("id, company_name")
    .eq("id", manufacturerId)
    .maybeSingle();

  if (!mfgProfile) notFound();

  const mfg = mfgProfile as { id: string; company_name: string };

  // Verify accepted relationship
  const { data: rawApp } = await supabase
    .from("brand_manufacturer_applications")
    .select("id")
    .eq("brand_id", brandId)
    .eq("manufacturer_id", manufacturerId)
    .eq("status", "accepted")
    .maybeSingle();

  if (!rawApp) notFound();

  // Fetch purchase orders for this brand + manufacturer
  const { data: rawOrders } = await supabase
    .from("purchase_orders")
    .select("id, status, place_of_delivery, market, ready_by_date, note, created_at")
    .eq("brand_id", brandId)
    .eq("manufacturer_id", manufacturerId)
    .order("created_at", { ascending: false });

  const orders = (rawOrders ?? []) as {
    id: string;
    status: string;
    place_of_delivery: string | null;
    market: string | null;
    ready_by_date: string | null;
    note: string | null;
    created_at: string;
  }[];

  // Fetch line items for all orders
  const orderIds = orders.map((o) => o.id);
  const { data: rawItems } = orderIds.length > 0
    ? await supabase
        .from("purchase_order_items")
        .select("id, purchase_order_id, approved_product_id, item_name, quantity")
        .in("purchase_order_id", orderIds)
    : { data: [] };

  const items = (rawItems ?? []) as { id: string; purchase_order_id: string; approved_product_id: string | null; item_name: string; quantity: number }[];

  // Group items by order
  const itemsByOrder = new Map<string, typeof items>();
  for (const item of items) {
    const existing = itemsByOrder.get(item.purchase_order_id) ?? [];
    existing.push(item);
    itemsByOrder.set(item.purchase_order_id, existing);
  }

  // Build price map from approved products
  const allApprovedProductIds = [...new Set(items.map((i) => (i as { approved_product_id?: string }).approved_product_id).filter(Boolean))] as string[];
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
    ...order,
    items: (itemsByOrder.get(order.id) ?? []).map((i) => ({
      id: i.id,
      item_name: i.item_name,
      quantity: i.quantity,
      price_per_unit: priceMap.get((i as { approved_product_id?: string }).approved_product_id ?? "") ?? null,
    })),
  }));

  // Fetch current products (approved_products with status 'current')
  const { data: rawProducts } = await supabase
    .from("approved_products")
    .select("id, item_name, packaging, price_per_unit")
    .eq("brand_id", brandId)
    .eq("manufacturer_id", manufacturerId)
    .eq("status", "current");

  const currentProducts = (rawProducts ?? []) as {
    id: string;
    item_name: string;
    packaging: string;
    price_per_unit: number | null;
  }[];

  return (
    <>
      <div className="mb-6">
        <Link
          href={`/brand/manufacturers/${manufacturerId}/account`}
          className="inline-flex items-center gap-1.5 text-[13px] text-text-muted no-underline hover:text-text-secondary transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Back to {mfg.company_name}
        </Link>
      </div>

      <PurchaseOrdersClient
        orders={serializedOrders}
        currentProducts={currentProducts}
        manufacturerId={manufacturerId}
        manufacturerName={mfg.company_name}
      />
    </>
  );
}
