"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, X, Plus, Check, Eye, Upload, FileText, Trash2 } from "lucide-react";
import { createShipmentAction } from "./actions";

type ShipmentItemRow = {
  id: string;
  manufacturerId: string;
  manufacturerName: string;
  poId: string;
  itemName: string;
  quantity: number;
  lineTotal: number | null;
  pricePerUnit: number | null;
  destination: string | null;
  market: string | null;
  requestedDate: string | null;
  status: string;
  shippingMethod: string | null;
  shippingSentAt: string | null;
  hasShipmentRequest: boolean;
  boxLength: number | null;
  boxWidth: number | null;
  boxHeight: number | null;
  boxWeight: number | null;
  boxCount: number | null;
  palletLength: number | null;
  palletWidth: number | null;
  palletHeight: number | null;
  palletWeight: number | null;
  palletCount: number | null;
  lotNumber: string | null;
  expirationDate: string | null;
};

type BrandShipmentRequest = {
  id: string;
  manufacturerName: string;
  shippingMethod: string;
  pickupDate: string | null;
  status: string;
  createdAt: string;
  items: {
    itemName: string;
    quantity: number;
    boxCount: number | null;
    palletCount: number | null;
  }[];
};

const SHIPPING_METHODS = ["Truck", "UPS", "FedEx"] as const;

function CreateShipmentModal({
  items,
  onClose,
  onSuccess,
}: {
  items: ShipmentItemRow[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [shippingMethod, setShippingMethod] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [labels, setLabels] = useState<Map<string, File>>(new Map());
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const eligible = items.filter((i) => !i.hasShipmentRequest);

  function addItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  function removeItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setLabels((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }

  function handleFileChange(itemId: string, file: File | null) {
    setLabels((prev) => {
      const next = new Map(prev);
      if (file) next.set(itemId, file);
      else next.delete(itemId);
      return next;
    });
  }

  const selectedItems = eligible.filter((i) => selectedIds.has(i.id));
  const totalPalletCount = selectedItems.reduce((sum, i) => sum + (i.palletCount ?? 0), 0);

  async function handleSubmit() {
    if (selectedIds.size === 0) {
      setError("Please select at least one item.");
      return;
    }
    if (!shippingMethod) {
      setError("Please select a shipping method.");
      return;
    }
    setLoading(true);
    setError("");

    const byMfg = new Map<string, string[]>();
    for (const id of selectedIds) {
      const item = eligible.find((i) => i.id === id);
      if (!item) continue;
      const existing = byMfg.get(item.manufacturerId) ?? [];
      existing.push(id);
      byMfg.set(item.manufacturerId, existing);
    }

    for (const [mfgId, ids] of byMfg) {
      const result = await createShipmentAction({
        manufacturerId: mfgId,
        shippingMethod,
        statusReportItemIds: ids,
        pickupDate: shippingMethod === "Truck" && pickupDate ? pickupDate : null,
      });
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-bg-card border border-border rounded-xl w-full max-w-4xl shadow-xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h3 className="font-semibold text-lg text-text-primary">Create Shipment</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-bg-secondary flex items-center justify-center cursor-pointer border-none transition-colors hover:bg-border"
          >
            <X className="w-3.5 h-3.5 text-text-secondary" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="text-sm text-accent-teal bg-accent-teal/10 border border-accent-teal/20 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          {/* Shipping Method */}
          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2 font-medium">
              Shipping Method
            </label>
            <div className="flex gap-2">
              {SHIPPING_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setShippingMethod(method)}
                  className={`flex-1 py-2 text-xs rounded-lg border cursor-pointer transition-all ${
                    shippingMethod === method
                      ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5] font-medium"
                      : "border-border bg-transparent text-text-secondary hover:bg-bg-secondary"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Pickup Date — Truck only */}
          {shippingMethod === "Truck" && (
            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2 font-medium">
                Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full px-3 py-2 text-sm text-text-primary bg-transparent border border-border rounded-lg outline-none focus:border-[#4F46E5] transition-colors"
              />
            </div>
          )}

          {/* Two-column layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* LEFT: Select Items */}
            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2 font-medium">
                Items ({selectedIds.size} added)
              </label>
              {eligible.length === 0 ? (
                <p className="text-sm text-text-muted py-4 text-center">No items ready for pickup</p>
              ) : (
                <div className="space-y-2">
                  {eligible.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    const labelFile = labels.get(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`border rounded-lg p-3 transition-colors ${
                          isSelected
                            ? "border-[#4F46E5] bg-[#EEF2FF]"
                            : "border-border bg-transparent"
                        }`}
                      >
                        {/* Item info + Add/Added button */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary">{item.itemName}</p>
                            <p className="text-xs text-text-muted mt-0.5">
                              {item.manufacturerName} · Qty: {item.quantity}
                            </p>
                            <div className="flex gap-3 mt-1">
                              <span className="text-[11px] text-text-muted">Boxes: {item.boxCount ?? "—"}</span>
                              <span className="text-[11px] text-text-muted">Pallets: {item.palletCount ?? "—"}</span>
                            </div>
                          </div>
                          <div className="shrink-0 ml-3">
                            {isSelected ? (
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#4F46E5] bg-[#4F46E5]/10 rounded-md border-none cursor-pointer transition-colors hover:bg-[#4F46E5]/20"
                              >
                                <Check className="w-3 h-3" />
                                Added
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addItem(item.id)}
                                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-[#4F46E5] rounded-md border-none cursor-pointer transition-colors hover:bg-[#4338CA]"
                              >
                                <Plus className="w-3 h-3" />
                                Add
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Upload area — inside the card, shown when added */}
                        <div
                          className="overflow-hidden transition-all duration-300 ease-in-out"
                          style={{ maxHeight: isSelected ? "80px" : "0px", opacity: isSelected ? 1 : 0 }}
                        >
                          <div className="mt-2.5 pt-2.5 border-t border-[#4F46E5]/15">
                            {labelFile ? (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-md">
                                <FileText className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                                <span className="text-xs text-text-primary truncate flex-1">{labelFile.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleFileChange(item.id, null)}
                                  className="text-text-muted hover:text-accent-teal cursor-pointer border-none bg-transparent p-0.5 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current.get(item.id)?.click()}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-[#4F46E5] hover:bg-[#E0E7FF] rounded-md border border-dashed border-[#4F46E5]/30 cursor-pointer transition-colors w-full justify-center bg-transparent"
                              >
                                <Upload className="w-3 h-3" />
                                Upload Shipping Label
                              </button>
                            )}
                            <input
                              ref={(el) => { if (el) fileInputRefs.current.set(item.id, el); }}
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={(e) => handleFileChange(item.id, e.target.files?.[0] ?? null)}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: Shipment Summary */}
            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2 font-medium">
                Shipment
              </label>
              {selectedItems.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg p-6 text-center">
                  <p className="text-sm text-text-muted">Add items to build your shipment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shippingMethod === "Truck" && (
                    <div className="bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-[#4F46E5]">Total Pallet Count</span>
                      <span className="text-sm font-semibold text-[#4F46E5]">{totalPalletCount}</span>
                    </div>
                  )}
                  {selectedItems.map((item) => {
                    const labelFile = labels.get(item.id);
                    return (
                      <div key={item.id} className="border border-border rounded-lg p-3">
                        <p className="text-sm font-medium text-text-primary">{item.itemName}</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {item.manufacturerName} · Qty: {item.quantity}
                        </p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-[11px] text-text-muted">Boxes: {item.boxCount ?? "—"}</span>
                          <span className="text-[11px] text-text-muted">Pallets: {item.palletCount ?? "—"}</span>
                        </div>
                        {labelFile ? (
                          <div className="flex items-center gap-1.5 mt-2">
                            <FileText className="w-3 h-3 text-accent-sage" />
                            <span className="text-[11px] text-accent-sage font-medium">Label attached</span>
                          </div>
                        ) : (
                          <p className="text-[11px] text-text-muted mt-2 italic">No label uploaded</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border shrink-0">
          <button
            onClick={handleSubmit}
            disabled={loading || selectedIds.size === 0 || !shippingMethod}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg border-none cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {loading ? "Creating..." : "Create Shipment"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewDetailsModal({ item, onClose }: { item: ShipmentItemRow; onClose: () => void }) {
  const detail = (label: string, value: string | number | null | undefined) => (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="text-sm text-text-primary font-medium">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-bg-card border border-border rounded-xl w-full max-w-md shadow-xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h3 className="font-semibold text-lg text-text-primary">Shipping Details</h3>
            <p className="text-xs text-text-muted mt-0.5">{item.itemName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-bg-secondary flex items-center justify-center cursor-pointer border-none transition-colors hover:bg-border"
          >
            <X className="w-3.5 h-3.5 text-text-secondary" strokeWidth={2} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-1">Box</p>
            {detail("Dimensions (in)", item.boxLength != null ? `${item.boxLength} × ${item.boxWidth} × ${item.boxHeight}` : null)}
            {detail("Weight (lbs)", item.boxWeight)}
            {detail("Count", item.boxCount)}
          </div>
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-1">Pallet</p>
            {detail("Dimensions (in)", item.palletLength != null ? `${item.palletLength} × ${item.palletWidth} × ${item.palletHeight}` : null)}
            {detail("Weight (lbs)", item.palletWeight)}
            {detail("Count", item.palletCount)}
          </div>
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-1">Other</p>
            {detail("Lot Number", item.lotNumber)}
            {detail("Expiration Date", item.expirationDate)}
          </div>
        </div>
      </div>
    </div>
  );
}

const SHIPMENT_TABS = ["Accepted", "Ready for Pickup", "Scheduled Pickups", "Completed"] as const;

export function BrandShipmentsClient({
  items,
  shipmentRequests,
}: {
  items: ShipmentItemRow[];
  shipmentRequests: BrandShipmentRequest[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof SHIPMENT_TABS)[number]>("Accepted");
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [viewDetailsItem, setViewDetailsItem] = useState<ShipmentItemRow | null>(null);

  function toggleSort() {
    setSortDir((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  }

  const sorted = sortDir
    ? [...items].sort((a, b) => {
        const cmp = a.manufacturerName.localeCompare(b.manufacturerName);
        return sortDir === "asc" ? cmp : -cmp;
      })
    : items;

  // Accepted: accepted items where manufacturer has NOT yet sent shipping details
  const acceptedItems = sorted.filter((r) => r.status === "accepted" && !r.shippingSentAt);

  // Ready for Pickup: shipping details sent, not yet in a shipment
  const readyForPickupItems = sorted.filter((r) => !!r.shippingSentAt && !r.hasShipmentRequest);

  // Shipment request sections
  const scheduledPickups = shipmentRequests.filter((s) => s.status === "pending");
  const completedShipments = shipmentRequests.filter((s) => s.status === "completed");

  const thClass = "text-left px-5 py-3 text-[11px] uppercase tracking-wider text-text-muted font-medium";

  function renderItemsTable(rows: ShipmentItemRow[], emptyMessage: string) {
    if (rows.length === 0) {
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
              <th className={thClass}>Manufacturer</th>
              <th className={thClass}>Item</th>
              <th className={thClass}>Qty</th>
              <th className={thClass}>Pallet Count</th>
              <th className={thClass}>Box Count</th>
              <th className={thClass}>Destination</th>
              <th className={thClass}>Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0 align-top">
                <td className="px-5 py-3">
                  <p className="text-text-primary font-medium">{item.manufacturerName}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-text-primary font-medium">{item.itemName}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">PO# {item.poId.slice(0, 8).toUpperCase()}</p>
                </td>
                <td className="px-5 py-3 text-text-primary">{item.quantity}</td>
                <td className="px-5 py-3 text-text-primary">{item.palletCount ?? "—"}</td>
                <td className="px-5 py-3 text-text-primary">{item.boxCount ?? "—"}</td>
                <td className="px-5 py-3">
                  <p className="text-text-secondary">{item.destination ?? "—"}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{item.market ?? "—"}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-[11px] text-text-muted">
                    Requested {item.requestedDate ? new Date(item.requestedDate).toLocaleDateString() : "—"}
                  </p>
                  <button
                    onClick={() => setViewDetailsItem(item)}
                    className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-md border-none cursor-pointer transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderAcceptedTable(rows: ShipmentItemRow[], emptyMessage: string) {
    if (rows.length === 0) {
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
              <th className={thClass}>Manufacturer</th>
              <th className={thClass}>Item</th>
              <th className={thClass}>Qty</th>
              <th className={thClass}>Destination</th>
              <th className={thClass}>Total</th>
              <th className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0 align-top">
                <td className="px-5 py-3">
                  <p className="text-text-primary font-medium">{item.manufacturerName}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-text-primary font-medium">{item.itemName}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">PO# {item.poId.slice(0, 8).toUpperCase()}</p>
                </td>
                <td className="px-5 py-3 text-text-primary">{item.quantity}</td>
                <td className="px-5 py-3">
                  <p className="text-text-secondary">{item.destination ?? "—"}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{item.market ?? "—"}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-text-primary font-medium">
                    {item.lineTotal != null ? `$${item.lineTotal.toFixed(2)}` : "—"}
                  </p>
                  {item.pricePerUnit != null && (
                    <p className="text-[11px] text-text-muted mt-0.5">${item.pricePerUnit.toFixed(2)}/unit</p>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-accent-sage/10 text-accent-sage">
                    Accepted
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderShipmentTable(requests: BrandShipmentRequest[], emptyMessage: string) {
    if (requests.length === 0) {
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
              <th className={thClass}>Manufacturer</th>
              <th className={thClass}>Items</th>
              <th className={thClass}>Method</th>
              <th className={thClass}>Date</th>
              <th className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b border-border last:border-0 align-top">
                <td className="px-5 py-3">
                  <p className="text-text-primary font-medium">{req.manufacturerName}</p>
                </td>
                <td className="px-5 py-3">
                  {req.items.map((item, i) => (
                    <p key={i} className="text-text-primary text-xs">
                      {item.itemName} <span className="text-text-muted">×{item.quantity}</span>
                    </p>
                  ))}
                </td>
                <td className="px-5 py-3">
                  <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-accent-rose/10 text-accent-rose">
                    {req.shippingMethod}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <p className="text-text-muted text-xs">{new Date(req.createdAt).toLocaleDateString()}</p>
                  {req.pickupDate && (
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Pickup: {new Date(req.pickupDate + "T00:00:00").toLocaleDateString()}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${
                    req.status === "completed"
                      ? "bg-accent-sage/10 text-accent-sage"
                      : "bg-accent-plum/10 text-accent-plum"
                  }`}>
                    {req.status === "completed" ? "Completed" : "Scheduled"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      {/* Tabs + Sort */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
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
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSort}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-colors ${
              sortDir
                ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                : "border-border bg-transparent text-text-secondary hover:bg-bg-secondary"
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Manufacturer {sortDir === "asc" ? "A→Z" : sortDir === "desc" ? "Z→A" : ""}
          </button>
          {activeTab === "Ready for Pickup" && (
            <button
              onClick={() => setShowShipmentModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg border-none cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Shipment
            </button>
          )}
        </div>
      </div>

      {/* Tabbed content */}
      {activeTab === "Accepted" && renderAcceptedTable(acceptedItems, "No accepted items awaiting shipping details.")}
      {activeTab === "Ready for Pickup" && renderItemsTable(readyForPickupItems, "No items ready for pickup.")}
      {activeTab === "Scheduled Pickups" && renderShipmentTable(scheduledPickups, "No scheduled pickups.")}
      {activeTab === "Completed" && renderShipmentTable(completedShipments, "No completed shipments.")}

      {showShipmentModal && (
        <CreateShipmentModal
          items={readyForPickupItems}
          onClose={() => setShowShipmentModal(false)}
          onSuccess={() => {
            setShowShipmentModal(false);
            router.refresh();
          }}
        />
      )}

      {viewDetailsItem && (
        <ViewDetailsModal
          item={viewDetailsItem}
          onClose={() => setViewDetailsItem(null)}
        />
      )}
    </>
  );
}
