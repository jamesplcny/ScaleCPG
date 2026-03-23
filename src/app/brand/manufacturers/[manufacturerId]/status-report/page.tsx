import { notFound } from "next/navigation";
import Link from "next/link";
import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { BrandMfgStatusReportClient } from "./BrandMfgStatusReportClient";

export default async function BrandManufacturerStatusReportPage({
  params,
}: {
  params: Promise<{ manufacturerId: string }>;
}) {
  const { manufacturerId } = await params;
  const { brandId } = await requireBrandUser();
  const supabase = await createClient();

  // Verify manufacturer exists + accepted relationship
  const { data: mfgProfile } = await supabase
    .from("manufacturer_profiles")
    .select("id, company_name")
    .eq("id", manufacturerId)
    .maybeSingle();

  if (!mfgProfile) notFound();
  const mfg = mfgProfile as { id: string; company_name: string };

  const { data: rawApp } = await supabase
    .from("brand_manufacturer_applications")
    .select("id")
    .eq("brand_id", brandId)
    .eq("manufacturer_id", manufacturerId)
    .eq("status", "accepted")
    .maybeSingle();

  if (!rawApp) notFound();

  // Fetch accepted status report items that do NOT yet have shipping details
  const { data: rawSrItems } = await supabase
    .from("status_report_items")
    .select("id, purchase_order_id, purchase_order_item_id, status, added_at")
    .eq("brand_id", brandId)
    .eq("manufacturer_id", manufacturerId)
    .eq("status", "accepted")
    .is("shipping_sent_at", null)
    .order("added_at", { ascending: false });

  const srItems = (rawSrItems ?? []) as {
    id: string;
    purchase_order_id: string;
    purchase_order_item_id: string;
    status: string;
    added_at: string;
  }[];

  if (srItems.length === 0) {
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
          <h2 className="font-semibold text-2xl text-text-primary">
            Status Report — {mfg.company_name}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Items accepted by {mfg.company_name}, awaiting shipping details.
          </p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">No items awaiting shipping details.</p>
        </div>
      </>
    );
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
      poId: sr.purchase_order_id,
      itemName: poItem?.item_name ?? "—",
      quantity,
      lineTotal,
      pricePerUnit,
      destination: po?.place_of_delivery ?? null,
      market: po?.market ?? null,
      requestedDate: po?.created_at ?? null,
    };
  });

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
        <h2 className="font-semibold text-2xl text-text-primary">
          Status Report — {mfg.company_name}
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Items accepted by {mfg.company_name}, awaiting shipping details.
        </p>
      </div>

      <BrandMfgStatusReportClient items={rows} />
    </>
  );
}
