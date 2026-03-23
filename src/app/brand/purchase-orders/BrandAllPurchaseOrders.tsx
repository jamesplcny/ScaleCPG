"use client";

import { useState } from "react";
import { X, Eye, Package, MapPin, Globe, DollarSign, ArrowUpDown } from "lucide-react";

type OrderItem = {
  id: string;
  item_name: string;
  quantity: number;
  price_per_unit: number | null;
};

type PurchaseOrderData = {
  id: string;
  manufacturerName: string;
  status: string;
  place_of_delivery: string | null;
  market: string | null;
  ready_by_date: string | null;
  note: string | null;
  created_at: string;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  open: "Open",
  ready_for_pickup: "Ready For Pickup",
  completed: "Completed",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-accent-plum/10 text-accent-plum",
  open: "bg-accent-rose/10 text-accent-rose",
  ready_for_pickup: "bg-accent-plum/10 text-accent-plum",
  completed: "bg-accent-sage/10 text-accent-sage",
};

function computeOrderTotal(order: PurchaseOrderData): number {
  return order.items.reduce((sum, item) => {
    if (item.price_per_unit == null) return sum;
    return sum + item.quantity * item.price_per_unit;
  }, 0);
}

function PODetailModal({ order, onClose }: { order: PurchaseOrderData; onClose: () => void }) {
  const totalCost = computeOrderTotal(order);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-bg-card border border-border rounded-xl w-full max-w-lg shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-lg text-text-primary">
              PO #{order.id.slice(0, 8).toUpperCase()}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">{order.manufacturerName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-bg-secondary flex items-center justify-center cursor-pointer border-none transition-colors hover:bg-border"
          >
            <X className="w-3.5 h-3.5 text-text-secondary" strokeWidth={2} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${STATUS_STYLES[order.status] ?? ""}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
            <span className="text-xs text-text-muted">
              {new Date(order.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Destination</p>
              <p className="text-sm text-text-primary">{order.place_of_delivery ?? "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Market</p>
              <p className="text-sm text-text-primary">{order.market ?? "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Ready By</p>
              <p className="text-sm text-text-primary">{order.ready_by_date ?? "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Total Cost</p>
              <p className="text-sm font-semibold text-text-primary">
                {totalCost > 0 ? `$${totalCost.toFixed(2)}` : "—"}
              </p>
            </div>
          </div>

          {order.note && (
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Note</p>
              <p className="text-sm text-text-secondary">{order.note}</p>
            </div>
          )}

          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Items ({order.items.length})</p>
            <div className="space-y-2">
              {order.items.map((item) => {
                const lineTotal = item.price_per_unit != null ? item.quantity * item.price_per_unit : null;
                return (
                  <div key={item.id} className="flex items-center justify-between bg-bg-secondary rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{item.item_name}</p>
                      <p className="text-xs text-text-muted mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    {lineTotal != null && (
                      <p className="text-sm font-medium text-text-primary">${lineTotal.toFixed(2)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrandAllPurchaseOrders({ orders }: { orders: PurchaseOrderData[] }) {
  const [viewOrder, setViewOrder] = useState<PurchaseOrderData | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  const sortedOrders = sortDir
    ? [...orders].sort((a, b) => {
        const cmp = a.manufacturerName.localeCompare(b.manufacturerName);
        return sortDir === "asc" ? cmp : -cmp;
      })
    : orders;

  function toggleSort() {
    setSortDir((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  }

  // Group: open/pending vs completed
  const openOrders = sortedOrders.filter((o) => o.status === "open" || o.status === "pending");
  const completedOrders = sortedOrders.filter((o) => o.status === "completed" || o.status === "ready_for_pickup");

  if (orders.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-text-muted text-sm">No purchase orders yet.</p>
      </div>
    );
  }

  function renderCards(items: PurchaseOrderData[], label: string) {
    if (items.length === 0) {
      return (
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">No {label.toLowerCase()} orders.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        {items.map((order) => {
          const totalCost = computeOrderTotal(order);
          return (
            <div key={order.id} className="bg-bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{order.manufacturerName}</p>
                  <p className="text-xs font-mono text-text-muted mt-0.5">
                    PO #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <span className={`inline-block mt-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${STATUS_STYLES[order.status] ?? ""}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <button
                  onClick={() => setViewOrder(order)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4F46E5] bg-[#EEF2FF] rounded-lg border-none cursor-pointer hover:bg-[#E0E7FF] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Package className="w-3.5 h-3.5 text-text-muted" />
                  {order.items.length} SKU{order.items.length !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <MapPin className="w-3.5 h-3.5 text-text-muted" />
                  {order.place_of_delivery ?? "—"}
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Globe className="w-3.5 h-3.5 text-text-muted" />
                  {order.market ?? "—"}
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <DollarSign className="w-3.5 h-3.5 text-text-muted" />
                  {totalCost > 0 ? `$${totalCost.toFixed(2)}` : "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {/* Sort control */}
      <div className="mb-4">
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
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="font-semibold text-lg text-text-primary mb-3">Open</h3>
          {renderCards(openOrders, "open")}
        </section>

        <section>
          <h3 className="font-semibold text-lg text-text-primary mb-3">Completed</h3>
          {renderCards(completedOrders, "completed")}
        </section>
      </div>

      {viewOrder && <PODetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}
    </>
  );
}
