"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Send, Truck } from "lucide-react";
import { sendShippingDetailsAction } from "@/app/purchase-orders/actions";

export type StatusReportRow = {
  id: string;
  purchaseOrderId: string;
  brandName: string;
  itemName: string;
  quantity: number;
  pricePerUnit: number | null;
  lineTotal: number | null;
  destination: string | null;
  market: string | null;
  status: string;
  requestedDate: string | null;
  shippingSentAt: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  accepted: "Accepted",
  delayed: "Delayed",
  rejected: "Rejected",
  pending: "Pending",
};

const STATUS_STYLES: Record<string, string> = {
  accepted: "bg-accent-sage/10 text-accent-sage",
  delayed: "bg-[#F59E0B]/10 text-[#F59E0B]",
  rejected: "bg-accent-teal/10 text-accent-teal",
  pending: "bg-accent-plum/10 text-accent-plum",
};

// ─── Shipping Details Modal (no shipping method selection) ───

function ShippingModal({
  item,
  onClose,
  onSuccess,
}: {
  item: StatusReportRow;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [boxLength, setBoxLength] = useState("");
  const [boxWidth, setBoxWidth] = useState("");
  const [boxHeight, setBoxHeight] = useState("");
  const [boxWeight, setBoxWeight] = useState("");
  const [boxCount, setBoxCount] = useState("");
  const [palletLength, setPalletLength] = useState("");
  const [palletWidth, setPalletWidth] = useState("");
  const [palletHeight, setPalletHeight] = useState("");
  const [palletWeight, setPalletWeight] = useState("");
  const [palletCount, setPalletCount] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid =
    boxLength !== "" && boxWidth !== "" && boxHeight !== "" &&
    boxWeight !== "" && boxCount !== "" &&
    palletLength !== "" && palletWidth !== "" && palletHeight !== "" &&
    palletWeight !== "" && palletCount !== "" &&
    expirationDate !== "";

  async function handleSubmit() {
    if (!isValid) {
      setError("All fields are required except Lot Number.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await sendShippingDetailsAction({
      statusReportItemId: item.id,
      boxLength: parseFloat(boxLength),
      boxWidth: parseFloat(boxWidth),
      boxHeight: parseFloat(boxHeight),
      boxWeight: parseFloat(boxWeight),
      boxCount: parseInt(boxCount),
      palletLength: parseFloat(palletLength),
      palletWidth: parseFloat(palletWidth),
      palletHeight: parseFloat(palletHeight),
      palletWeight: parseFloat(palletWeight),
      palletCount: parseInt(palletCount),
      lotNumber: lotNumber || null,
      expirationDate,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSuccess();
  }

  const inputClass =
    "w-full border border-border rounded-lg px-3 py-2 text-sm text-text-primary bg-bg-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-bg-card border border-border rounded-xl w-full max-w-lg shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-lg text-text-primary">
              Send Shipping Details
            </h3>
            <p className="text-xs text-text-muted mt-0.5">{item.itemName} · Qty: {item.quantity}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-bg-secondary flex items-center justify-center cursor-pointer border-none transition-colors hover:bg-border"
          >
            <X className="w-3.5 h-3.5 text-text-secondary" strokeWidth={2} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="text-sm text-accent-teal bg-accent-teal/10 border border-accent-teal/20 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          {/* Box Dimensions */}
          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2 font-medium">
              Box Dimensions (in)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" placeholder="Length" value={boxLength} onChange={(e) => setBoxLength(e.target.value)} className={inputClass} />
              <input type="number" placeholder="Width" value={boxWidth} onChange={(e) => setBoxWidth(e.target.value)} className={inputClass} />
              <input type="number" placeholder="Height" value={boxHeight} onChange={(e) => setBoxHeight(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Box Weight + Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2 font-medium">Box Weight (lbs)</label>
              <input type="number" placeholder="Weight" value={boxWeight} onChange={(e) => setBoxWeight(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2 font-medium">Box Count</label>
              <input type="number" placeholder="Count" value={boxCount} onChange={(e) => setBoxCount(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Pallet Dimensions */}
          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2 font-medium">
              Pallet Dimensions (in)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" placeholder="Length" value={palletLength} onChange={(e) => setPalletLength(e.target.value)} className={inputClass} />
              <input type="number" placeholder="Width" value={palletWidth} onChange={(e) => setPalletWidth(e.target.value)} className={inputClass} />
              <input type="number" placeholder="Height" value={palletHeight} onChange={(e) => setPalletHeight(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Pallet Weight + Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2 font-medium">Pallet Weight (lbs)</label>
              <input type="number" placeholder="Weight" value={palletWeight} onChange={(e) => setPalletWeight(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2 font-medium">Pallet Count</label>
              <input type="number" placeholder="Count" value={palletCount} onChange={(e) => setPalletCount(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Lot Number (optional) */}
          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2 font-medium">
              Lot Number <span className="normal-case tracking-normal text-text-muted/60">(optional)</span>
            </label>
            <input type="text" placeholder="Lot number" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} className={inputClass} />
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2 font-medium">Expiration Date</label>
            <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg border-none cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {loading ? "Sending..." : "Send Shipping Details"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status Report Table ───

function SRTable({
  items,
  emptyMessage,
  showReadyButton,
  onReady,
}: {
  items: StatusReportRow[];
  emptyMessage: string;
  showReadyButton?: boolean;
  onReady?: (item: StatusReportRow) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-text-muted text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-text-muted font-medium">Brand</th>
            <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-text-muted font-medium">Item</th>
            <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-text-muted font-medium">Qty</th>
            <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-text-muted font-medium">Total</th>
            <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-text-muted font-medium">Destination</th>
            <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-text-muted font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((sr) => {
            const canSend = showReadyButton && sr.status === "accepted" && sr.shippingSentAt === null;
            const alreadySent = sr.shippingSentAt !== null;

            return (
              <tr key={sr.id} className="border-b border-border last:border-0 align-top">
                <td className="px-5 py-3">
                  <p className="text-text-primary font-medium">{sr.brandName}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">PO# {sr.purchaseOrderId.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Requested {sr.requestedDate ? new Date(sr.requestedDate).toLocaleDateString() : "—"}
                  </p>
                </td>
                <td className="px-5 py-3 text-text-primary">{sr.itemName}</td>
                <td className="px-5 py-3 text-text-primary">{sr.quantity}</td>
                <td className="px-5 py-3">
                  <p className="text-text-primary font-medium">
                    {sr.lineTotal != null ? `$${sr.lineTotal.toFixed(2)}` : "—"}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {sr.pricePerUnit != null ? `$${sr.pricePerUnit.toFixed(2)}/unit` : "—"}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-text-secondary">{sr.destination ?? "—"}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{sr.market ?? "—"}</p>
                </td>
                <td className="px-5 py-3">
                  {alreadySent ? (
                    <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-accent-rose/10 text-accent-rose">
                      Sent
                    </span>
                  ) : (
                    <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${STATUS_STYLES[sr.status] ?? ""}`}>
                      {STATUS_LABELS[sr.status] ?? sr.status}
                    </span>
                  )}
                  {canSend && onReady && (
                    <div className="mt-2">
                      <button
                        onClick={() => onReady(sr)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-md border-none cursor-pointer transition-colors"
                      >
                        <Truck className="w-3 h-3" />
                        Ready
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Status Report Section (tabbed) ───

const SR_TABS = ["All", "Accepted", "Delays", "Rejected"] as const;

function StatusReportSection({
  items,
  onReady,
}: {
  items: StatusReportRow[];
  onReady: (item: StatusReportRow) => void;
}) {
  const [activeTab, setActiveTab] = useState<(typeof SR_TABS)[number]>("All");

  const filtered = items.filter((i) => {
    if (activeTab === "All") return true;
    if (activeTab === "Accepted") return i.status === "accepted";
    if (activeTab === "Delays") return i.status === "delayed";
    if (activeTab === "Rejected") return i.status === "rejected";
    return true;
  });

  const showReady = activeTab === "All" || activeTab === "Accepted";

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {SR_TABS.map((tab) => (
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

      <SRTable
        items={filtered}
        emptyMessage="No items."
        showReadyButton={showReady}
        onReady={onReady}
      />
    </div>
  );
}

// ─── Main Export ───

export function StatusReportClient({
  items,
}: {
  items: StatusReportRow[];
}) {
  const router = useRouter();
  const [shippingItem, setShippingItem] = useState<StatusReportRow | null>(null);

  return (
    <>
      <div className="mb-6">
        <h2 className="font-semibold text-2xl text-text-primary">Status Report</h2>
        <p className="text-sm text-text-secondary mt-1">Track purchase order items.</p>
      </div>

      <StatusReportSection
        items={items}
        onReady={setShippingItem}
      />

      {shippingItem && (
        <ShippingModal
          item={shippingItem}
          onClose={() => setShippingItem(null)}
          onSuccess={() => {
            setShippingItem(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
