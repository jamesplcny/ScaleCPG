import { notFound } from "next/navigation";
import Link from "next/link";
import { requireManufacturerUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { ShipmentsClient } from "@/app/shipments/ShipmentsClient";
import type { ShipmentRow } from "@/app/shipments/ShipmentsClient";

export default async function ClientShipmentsPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;
  const { user } = await requireManufacturerUser();
  const supabase = await createClient();

  // Get manufacturer profile
  const { data: profile } = await supabase
    .from("manufacturer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) notFound();
  const manufacturerId = (profile as { id: string }).id;

  // Verify accepted application
  const { data: rawApp } = await supabase
    .from("brand_manufacturer_applications")
    .select("id")
    .eq("manufacturer_id", manufacturerId)
    .eq("brand_id", brandId)
    .eq("status", "accepted")
    .maybeSingle();

  if (!rawApp) notFound();

  // Get brand name
  const { data: brand } = await supabase
    .from("brands")
    .select("name")
    .eq("id", brandId)
    .maybeSingle();

  const brandName = (brand as { name: string } | null)?.name ?? "Brand";

  // Fetch shipment requests scoped to this brand
  const { data: rawShipments } = await supabase
    .from("shipment_requests")
    .select("id, brand_id, shipping_method, pickup_date, status, created_at")
    .eq("manufacturer_id", manufacturerId)
    .eq("brand_id", brandId)
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
      <>
        <div className="mb-6">
          <Link
            href={`/clients/brand/${brandId}`}
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors no-underline mb-3"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Back to {brandName}
          </Link>
          <h2 className="font-semibold text-2xl text-text-primary">
            Shipments — {brandName}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Shipment requests from {brandName}.
          </p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">No shipments from {brandName} yet.</p>
        </div>
      </>
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

  // Batch fetch SR items
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

  const srToPoItem = new Map<string, string>();
  for (const sr of srItems) {
    srToPoItem.set(sr.id, sr.purchase_order_item_id);
  }

  // Serialize
  const rows: ShipmentRow[] = shipments.map((s) => ({
    id: s.id,
    brandName: brandName,
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
    <>
      <div className="mb-6">
        <Link
          href={`/clients/brand/${brandId}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors no-underline mb-3"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Back to {brandName}
        </Link>
        <h2 className="font-semibold text-2xl text-text-primary">
          Shipments — {brandName}
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Shipment requests from {brandName}.
        </p>
      </div>
      <ShipmentsClient shipments={rows} showBrandColumn={false} />
    </>
  );
}
