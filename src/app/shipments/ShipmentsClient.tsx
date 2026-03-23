"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { completeShipmentRequestAction } from "@/app/purchase-orders/actions";

export type ShipmentRow = {
  id: string;
  brandName: string;
  shippingMethod: string;
  pickupDate: string | null;
  status: string;
  createdAt: string;
  items: {
    statusReportItemId: string;
    itemName: string;
    quantity: number;
  }[];
};

const SHIPMENT_TABS = ["All", "Trucks", "UPS", "FedEx", "Completed"] as const;

export function ShipmentsClient({
  shipments,
  showBrandColumn,
}: {
  shipments: ShipmentRow[];
  showBrandColumn?: boolean;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof SHIPMENT_TABS)[number]>("All");
  const [completing, setCompleting] = useState<string | null>(null);

  const filtered = shipments.filter((r) => {
    if (activeTab === "All") return true;
    if (activeTab === "Trucks") return r.shippingMethod === "Truck" && r.status !== "completed";
    if (activeTab === "UPS") return r.shippingMethod === "UPS" && r.status !== "completed";
    if (activeTab === "FedEx") return r.shippingMethod === "FedEx" && r.status !== "completed";
    if (activeTab === "Completed") return r.status === "completed";
    return true;
  });

  async function handleComplete(id: string) {
    setCompleting(id);
    await completeShipmentRequestAction(id);
    setCompleting(null);
    router.refresh();
  }

  const thClass = "text-left px-5 py-3 text-[11px] uppercase tracking-wider text-text-muted font-medium";

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {SHIPMENT_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-colors ${
              activeTab === tab
                ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                : "border-border bg-transparent text-text-secondary hover:bg-bg-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">No shipments.</p>
        </div>
      ) : (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {showBrandColumn !== false && <th className={thClass}>Brand</th>}
                <th className={thClass}>Items</th>
                <th className={thClass}>Method</th>
                <th className={thClass}>Date</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} className="border-b border-border last:border-0 align-top">
                  {showBrandColumn !== false && (
                    <td className="px-5 py-3">
                      <p className="text-text-primary font-medium">{req.brandName}</p>
                    </td>
                  )}
                  <td className="px-5 py-3">
                    {req.items.map((item) => (
                      <p key={item.statusReportItemId} className="text-text-primary text-xs">
                        {item.itemName} <span className="text-text-muted">&times;{item.quantity}</span>
                      </p>
                    ))}
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-accent-rose/10 text-accent-rose">
                      {req.shippingMethod}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-text-muted text-xs">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                    {req.pickupDate && (
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Pickup: {new Date(req.pickupDate + "T00:00:00").toLocaleDateString()}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {req.status === "completed" ? (
                      <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-accent-sage/10 text-accent-sage">
                        Confirmed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleComplete(req.id)}
                        disabled={completing === req.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-white bg-accent-sage hover:bg-accent-sage/90 rounded-md border-none cursor-pointer transition-colors disabled:opacity-40"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {completing === req.id ? "..." : "Confirm"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
