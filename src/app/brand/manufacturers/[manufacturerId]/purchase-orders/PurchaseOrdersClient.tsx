"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ShoppingBag, Minus, Eye, Package, MapPin, Globe, DollarSign } from "lucide-react";
import { createPurchaseOrderAction } from "./actions";

type PurchaseOrderData = {
  id: string;
  status: string;
  place_of_delivery: string | null;
  market: string | null;
  ready_by_date: string | null;
  note: string | null;
  created_at: string;
  items: { id: string; item_name: string; quantity: number; price_per_unit: number | null }[];
};

type CurrentProduct = {
  id: string;
  item_name: string;
  packaging: string;
  price_per_unit: number | null;
};

type OrderItem = {
  productId: string;
  item_name: string;
  quantity: number;
  price_per_unit: number | null;
};

interface Props {
  orders: PurchaseOrderData[];
  currentProducts: CurrentProduct[];
  manufacturerId: string;
  manufacturerName: string;
}

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

const DELIVERY_OPTIONS = ["Amazon", "Walmart", "Other"] as const;
const MARKET_OPTIONS = ["US", "Canada", "Other"] as const;

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
          <h3 className="font-semibold text-lg text-text-primary">
            PO #{order.id.slice(0, 8).toUpperCase()}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-bg-secondary flex items-center justify-center cursor-pointer border-none transition-colors hover:bg-border"
          >
            <X className="w-3.5 h-3.5 text-text-secondary" strokeWidth={2} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status + Date row */}
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${STATUS_STYLES[order.status] ?? ""}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
            <span className="text-xs text-text-muted">
              {new Date(order.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Details grid */}
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

          {/* Note */}
          {order.note && (
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Note</p>
              <p className="text-sm text-text-secondary">{order.note}</p>
            </div>
          )}

          {/* Items breakdown */}
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

function OrderCards({
  orders,
  label,
  onView,
}: {
  orders: PurchaseOrderData[];
  label: string;
  onView: (order: PurchaseOrderData) => void;
}) {
  if (orders.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-text-muted text-sm">No {label.toLowerCase()} orders.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
      {orders.map((order) => {
        const totalCost = computeOrderTotal(order);
        return (
          <div key={order.id} className="bg-bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-mono font-medium text-text-primary">
                  PO #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <span className={`inline-block mt-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${STATUS_STYLES[order.status] ?? ""}`}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <button
                onClick={() => onView(order)}
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

export function PurchaseOrdersClient({ orders, currentProducts, manufacturerId, manufacturerName }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewOrder, setViewOrder] = useState<PurchaseOrderData | null>(null);

  // Per-product quantity inputs (left side)
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Items added to order (right side)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Order-level fields (shown in Order Summary)
  const [readyByMonth, setReadyByMonth] = useState<string>("");
  const [readyByDay, setReadyByDay] = useState<string>("");
  const [orderNote, setOrderNote] = useState<string>("");
  const [placeOfDelivery, setPlaceOfDelivery] = useState<string>("");
  const [market, setMarket] = useState<string>("");
  const readyByMonthRef = React.useRef<HTMLInputElement>(null);
  const readyByDayRef = React.useRef<HTMLInputElement>(null);

  function isValidReadyByDate(): boolean {
    if (readyByMonth.length !== 2 || readyByDay.length !== 2) return false;
    const month = parseInt(readyByMonth);
    const day = parseInt(readyByDay);
    return month >= 1 && month <= 12 && day >= 1 && day <= 31;
  }

  // Group orders: pending/open = Open, completed = Completed
  const openOrders = orders.filter((o) => o.status === "open" || o.status === "pending");
  const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "ready_for_pickup");

  // Products already added to the order
  const addedProductIds = new Set(orderItems.map((i) => i.productId));

  function openModal() {
    setQuantities({});
    setOrderItems([]);
    setReadyByMonth("");
    setReadyByDay("");
    setOrderNote("");
    setPlaceOfDelivery("");
    setMarket("");
    setError("");
    setModalOpen(true);
  }

  function handleAddClick(product: CurrentProduct) {
    const qty = quantities[product.id] ?? 0;
    if (qty <= 0) return;

    setOrderItems((prev) => [
      ...prev,
      {
        productId: product.id,
        item_name: product.item_name,
        quantity: qty,
        price_per_unit: product.price_per_unit,
      },
    ]);

    // Clear quantity for this product
    setQuantities((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });
  }

  function removeOrderItem(productId: string) {
    setOrderItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  const totalCostOfGoods = orderItems.reduce((sum, item) => {
    if (item.price_per_unit == null) return sum;
    return sum + item.quantity * item.price_per_unit;
  }, 0);

  async function handleSubmit() {
    if (orderItems.length === 0) {
      setError("Please add at least one product to the order.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await createPurchaseOrderAction({
      manufacturerId,
      readyByDate: readyByMonth + "/" + readyByDay,
      note: orderNote.trim(),
      placeOfDelivery,
      market,
      items: orderItems.map((item) => ({
        approvedProductId: item.productId,
        itemName: item.item_name,
        quantity: item.quantity,
      })),
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    setModalOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-semibold text-2xl text-text-primary">
            Purchase Orders — {manufacturerName}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Create and track purchase orders.
          </p>
        </div>
        <button
          onClick={openModal}
          disabled={currentProducts.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium rounded-lg border-none cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Create Purchase Order
        </button>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="font-semibold text-lg text-text-primary mb-3">Open</h3>
          <OrderCards orders={openOrders} label="open" onView={setViewOrder} />
        </section>

        <section>
          <h3 className="font-semibold text-lg text-text-primary mb-3">Completed</h3>
          <OrderCards orders={completedOrders} label="completed" onView={setViewOrder} />
        </section>
      </div>

      {/* PO Detail Modal */}
      {viewOrder && <PODetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}

      {/* Create Purchase Order Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-bg-card border border-border rounded-xl w-full max-w-3xl shadow-xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h3 className="font-semibold text-lg text-text-primary">Create Purchase Order</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-bg-secondary flex items-center justify-center cursor-pointer border-none transition-colors hover:bg-border"
              >
                <X className="w-3.5 h-3.5 text-text-secondary" strokeWidth={2} />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 text-sm text-accent-teal bg-accent-teal/10 border border-accent-teal/20 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            {/* Body — 65/35 split */}
            <div className="flex flex-1 min-h-0">
              {/* Left: Products (65%) */}
              <div className="w-[65%] border-r border-border overflow-y-auto p-6">
                <h4 className="text-[11px] text-text-muted uppercase tracking-wider mb-3 font-medium">
                  My Products from {manufacturerName}
                </h4>
                {currentProducts.length === 0 ? (
                  <p className="text-sm text-text-muted py-8 text-center">
                    No current products. Get quotes approved first.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {currentProducts.map((product) => {
                      const isAdded = addedProductIds.has(product.id);
                      const qty = quantities[product.id] ?? 0;
                      return (
                        <div
                          key={product.id}
                          className={`border rounded-lg p-4 transition-colors ${isAdded ? "border-border bg-bg-secondary/50 opacity-50" : "border-border"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary">{product.item_name}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                                <span>{product.packaging || "—"}</span>
                                {product.price_per_unit != null && (
                                  <span className="font-medium text-text-primary">${Number(product.price_per_unit).toFixed(2)}/unit</span>
                                )}
                              </div>
                            </div>
                            {!isAdded && (
                              <div className="flex items-center gap-2 ml-4">
                                <input
                                  type="number"
                                  min={0}
                                  value={qty || ""}
                                  onChange={(e) => setQuantities((prev) => ({ ...prev, [product.id]: Math.max(0, parseInt(e.target.value) || 0) }))}
                                  placeholder="Qty"
                                  className="no-spinners w-16 text-center border border-border rounded-md py-1.5 text-sm bg-transparent text-text-primary outline-none focus:border-accent-rose"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddClick(product)}
                                  disabled={qty <= 0}
                                  className="w-8 h-8 rounded-md bg-[#4F46E5] flex items-center justify-center cursor-pointer border-none transition-colors hover:bg-[#4338CA] disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            )}
                            {isAdded && (
                              <span className="text-xs text-accent-sage font-medium ml-4">Added</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right: Order Summary (35%) */}
              <div className="w-[35%] overflow-y-auto p-6 bg-bg-secondary/50">
                <h4 className="text-[11px] text-text-muted uppercase tracking-wider mb-3 font-medium">
                  Order Summary
                </h4>
                {orderItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingBag className="w-8 h-8 text-text-muted mb-3" strokeWidth={1.5} />
                    <p className="text-sm text-text-muted">Add products using the + button.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => {
                      const itemTotal = item.price_per_unit != null ? item.quantity * item.price_per_unit : null;
                      return (
                        <div key={item.productId} className="bg-bg-card border border-border rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary">{item.item_name}</p>
                              <p className="text-xs text-text-secondary mt-1">Qty: {item.quantity}</p>
                              {itemTotal != null && (
                                <p className="text-xs font-medium text-text-primary mt-1">
                                  ${itemTotal.toFixed(2)}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOrderItem(item.productId)}
                              className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent hover:bg-accent-teal/10 transition-colors ml-2 shrink-0"
                            >
                              <Minus className="w-3.5 h-3.5 text-accent-teal" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="border-t border-border pt-3 mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Total Items</span>
                        <span className="font-medium text-text-primary">{orderItems.length}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-text-secondary">Total Qty</span>
                        <span className="font-medium text-text-primary">
                          {orderItems.reduce((sum, i) => sum + i.quantity, 0)}
                        </span>
                      </div>
                      {totalCostOfGoods > 0 && (
                        <div className="flex justify-between text-sm mt-2 pt-2 border-t border-border">
                          <span className="font-medium text-text-primary">Total Cost of Goods</span>
                          <span className="font-semibold text-text-primary">${totalCostOfGoods.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Destination */}
                    <div className="border-t border-border pt-3 mt-3">
                      <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5 font-medium">Destination</label>
                      <div className="flex gap-2">
                        {DELIVERY_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setPlaceOfDelivery(opt)}
                            className={`flex-1 py-1.5 text-xs rounded-lg border cursor-pointer transition-all ${
                              placeOfDelivery === opt
                                ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5] font-medium"
                                : "border-border bg-transparent text-text-secondary hover:bg-bg-secondary"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Market */}
                    <div className="pt-1">
                      <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5 font-medium">Market</label>
                      <div className="flex gap-2">
                        {MARKET_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setMarket(opt)}
                            className={`flex-1 py-1.5 text-xs rounded-lg border cursor-pointer transition-all ${
                              market === opt
                                ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5] font-medium"
                                : "border-border bg-transparent text-text-secondary hover:bg-bg-secondary"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ready By Date */}
                    <div className="border-t border-border pt-3 mt-3">
                      <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5 font-medium">Ready By Date (mm/dd)</label>
                      <div
                        onClick={() => {
                          if (readyByMonth.length < 2) readyByMonthRef.current?.focus();
                          else readyByDayRef.current?.focus();
                        }}
                        className="w-[45%] flex items-center justify-center gap-1.5 border border-border rounded-lg px-3 py-2 cursor-text focus-within:border-[#4F46E5] transition-colors"
                      >
                        <input
                          ref={readyByMonthRef}
                          type="text"
                          inputMode="numeric"
                          value={readyByMonth}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 2);
                            setReadyByMonth(digits);
                            if (digits.length === 2) readyByDayRef.current?.focus();
                          }}
                          placeholder="mm"
                          maxLength={2}
                          className="w-7 text-center text-sm bg-transparent text-text-primary outline-none placeholder:text-text-muted font-mono"
                        />
                        <span className="text-sm text-text-muted font-mono select-none">/</span>
                        <input
                          ref={readyByDayRef}
                          type="text"
                          inputMode="numeric"
                          value={readyByDay}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 2);
                            setReadyByDay(digits);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && readyByDay === "") {
                              e.preventDefault();
                              readyByMonthRef.current?.focus();
                            }
                          }}
                          placeholder="dd"
                          maxLength={2}
                          className="w-7 text-center text-sm bg-transparent text-text-primary outline-none placeholder:text-text-muted font-mono"
                        />
                      </div>
                    </div>

                    {/* Note for Manufacturer */}
                    <div className="pt-1">
                      <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5 font-medium">Note for Manufacturer</label>
                      <textarea
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        placeholder="Add a note..."
                        rows={3}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-transparent text-text-primary outline-none focus:border-[#4F46E5] placeholder:text-text-muted resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-sm text-text-secondary cursor-pointer transition-all hover:bg-bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || orderItems.length === 0 || !isValidReadyByDate()}
                className="flex-1 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
