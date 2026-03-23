"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Eye,
  Package,
  MapPin,
  Globe,
  DollarSign,
  Plus,
  Check,
  Clock,
  XCircle,
  Send,
  Undo2,
  ExternalLink,
} from "lucide-react";
import { submitPOReviewAction } from "@/app/purchase-orders/actions";

type OrderItem = {
  id: string;
  item_name: string;
  quantity: number;
  price_per_unit: number | null;
};

export type PurchaseOrderCardData = {
  id: string;
  status: string;
  place_of_delivery: string | null;
  market: string | null;
  ready_by_date: string | null;
  note: string | null;
  created_at: string;
  brand_name?: string;
  items: OrderItem[];
};

/** Stored review decisions from status_report_items, keyed by purchase_order_item_id */
export type StoredReviewDecision = {
  status: string;
  note: string | null;
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

const DECISION_STYLES: Record<string, string> = {
  accepted: "bg-accent-sage/10 text-accent-sage",
  delayed: "bg-[#F59E0B]/10 text-[#F59E0B]",
  rejected: "bg-accent-teal/10 text-accent-teal",
};

function computeTotal(order: PurchaseOrderCardData): number {
  return order.items.reduce((sum, item) => {
    if (item.price_per_unit == null) return sum;
    return sum + item.quantity * item.price_per_unit;
  }, 0);
}

/* ─── Review decision types ─── */
type ReviewDecision = {
  status: "accepted" | "delayed" | "rejected";
  note?: string;
};

/* ─── Delay Reason Modal ─── */
function DelayModal({
  itemName,
  onConfirm,
  onCancel,
}: {
  itemName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-bg-card border border-border rounded-xl w-full max-w-md shadow-xl p-6">
        <h4 className="font-semibold text-lg text-text-primary mb-1">
          Delay Reason
        </h4>
        <p className="text-sm text-text-secondary mb-4">
          Explain the delay for <span className="font-medium">{itemName}</span>.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Raw material shortage, expected 2 weeks..."
          rows={3}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-primary bg-bg-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] resize-none"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-text-secondary bg-bg-secondary rounded-lg border-none cursor-pointer hover:bg-border transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-[#F59E0B] hover:bg-[#D97706] rounded-lg border-none cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Delay
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared PO Summary Header ─── */
function POSummaryHeader({
  order,
  onClose,
}: {
  order: PurchaseOrderCardData;
  onClose: () => void;
}) {
  const totalCost = computeTotal(order);

  return (
    <div className="px-6 py-4 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg text-text-primary">
            PO #{order.id.slice(0, 8).toUpperCase()}
          </h3>
          <span
            className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${STATUS_STYLES[order.status] ?? ""}`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-bg-secondary flex items-center justify-center cursor-pointer border-none transition-colors hover:bg-border"
        >
          <X className="w-3.5 h-3.5 text-text-secondary" strokeWidth={2} />
        </button>
      </div>
      <div className="grid grid-cols-5 gap-4 text-xs">
        {order.brand_name && (
          <div>
            <p className="text-text-muted uppercase tracking-wider text-[10px] mb-0.5">
              Brand
            </p>
            <p className="text-text-primary font-medium">{order.brand_name}</p>
          </div>
        )}
        <div>
          <p className="text-text-muted uppercase tracking-wider text-[10px] mb-0.5">
            Destination
          </p>
          <p className="text-text-primary">
            {order.place_of_delivery ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-text-muted uppercase tracking-wider text-[10px] mb-0.5">
            Market
          </p>
          <p className="text-text-primary">{order.market ?? "—"}</p>
        </div>
        <div>
          <p className="text-text-muted uppercase tracking-wider text-[10px] mb-0.5">
            Ready By
          </p>
          <p className="text-text-primary">{order.ready_by_date ?? "—"}</p>
        </div>
        <div>
          <p className="text-text-muted uppercase tracking-wider text-[10px] mb-0.5">
            Total Cost
          </p>
          <p className="text-text-primary font-semibold">
            {totalCost > 0 ? `$${totalCost.toFixed(2)}` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── PO Review Workflow Modal (manufacturer, pending POs) ─── */
function POReviewModal({
  order,
  onClose,
  onActionComplete,
}: {
  order: PurchaseOrderCardData;
  onClose: () => void;
  onActionComplete: () => void;
}) {
  const [decisions, setDecisions] = useState<Map<string, ReviewDecision>>(
    new Map()
  );
  const [delayingItem, setDelayingItem] = useState<OrderItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Unreviewed items = items NOT yet in decisions map
  const unreviewedItems = order.items.filter(
    (item) => !decisions.has(item.id)
  );

  // All items must be in decisions map to enable submit
  const allReviewed = order.items.length > 0 && decisions.size === order.items.length;

  function handleAccept(item: OrderItem) {
    setDecisions((prev) => {
      const next = new Map(prev);
      next.set(item.id, { status: "accepted" });
      return next;
    });
  }

  function handleDelay(item: OrderItem) {
    setDelayingItem(item);
  }

  function confirmDelay(reason: string) {
    if (!delayingItem) return;
    setDecisions((prev) => {
      const next = new Map(prev);
      next.set(delayingItem.id, { status: "delayed", note: reason });
      return next;
    });
    setDelayingItem(null);
  }

  function handleReject(item: OrderItem) {
    setDecisions((prev) => {
      const next = new Map(prev);
      next.set(item.id, { status: "rejected" });
      return next;
    });
  }

  function undoDecision(itemId: string) {
    setDecisions((prev) => {
      const next = new Map(prev);
      next.delete(itemId);
      return next;
    });
  }

  async function handleSubmit() {
    if (!allReviewed) return;
    setSubmitting(true);

    const items = Array.from(decisions.entries()).map(([id, decision]) => ({
      purchaseOrderItemId: id,
      status: decision.status,
      note: decision.note,
    }));

    const result = await submitPOReviewAction({
      purchaseOrderId: order.id,
      items,
    });

    setSubmitting(false);

    if (!result.error) {
      onActionComplete();
      onClose();
    }
  }

  // Staged items for the right panel
  const stagedItems = Array.from(decisions.entries()).map(([id, decision]) => {
    const item = order.items.find((i) => i.id === id)!;
    return { ...item, decision };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-bg-card border border-border rounded-xl w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
        <POSummaryHeader order={order} onClose={onClose} />

        {/* BODY: Left (items) + Right (staging) */}
        <div className="flex flex-1 min-h-0">
          {/* LEFT: Line Items */}
          <div className="w-[65%] border-r border-border overflow-y-auto p-5">
            <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-3">
              Line Items ({unreviewedItems.length})
            </p>

            {unreviewedItems.length === 0 ? (
              <div className="text-center py-8">
                <Check className="w-5 h-5 text-accent-sage mx-auto mb-2" />
                <p className="text-sm text-text-muted">
                  All items have been reviewed.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {unreviewedItems.map((item) => {
                  const lineTotal =
                    item.price_per_unit != null
                      ? item.quantity * item.price_per_unit
                      : null;

                  return (
                    <div
                      key={item.id}
                      className="rounded-lg px-4 py-3 bg-bg-secondary"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">
                            {item.item_name}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">
                            Qty: {item.quantity}
                            {item.price_per_unit != null &&
                              ` · $${item.price_per_unit.toFixed(2)}/unit`}
                            {lineTotal != null &&
                              ` · Total: $${lineTotal.toFixed(2)}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAccept(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-white bg-accent-sage hover:bg-accent-sage/90 rounded-md border-none cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Add
                          </button>
                          <button
                            onClick={() => handleDelay(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-[#92400E] bg-[#FEF3C7] hover:bg-[#FDE68A] rounded-md border-none cursor-pointer transition-colors"
                          >
                            <Clock className="w-3 h-3" />
                            Delay
                          </button>
                          <button
                            onClick={() => handleReject(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-accent-teal bg-accent-teal/10 hover:bg-accent-teal/20 rounded-md border-none cursor-pointer transition-colors"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Review Summary */}
          <div className="w-[35%] flex flex-col bg-bg-primary overflow-y-auto">
            <div className="p-4 border-b border-border">
              <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">
                Review Summary ({decisions.size}/{order.items.length})
              </p>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {stagedItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-text-muted">
                    Use Add, Delay, or Reject on each line item to build your
                    review.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stagedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-bg-card border border-border rounded-lg px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-text-primary truncate flex-1 mr-2">
                          {item.item_name}
                        </p>
                        <span
                          className={`shrink-0 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-full ${
                            DECISION_STYLES[item.decision.status] ?? ""
                          }`}
                        >
                          {item.decision.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted">
                        Qty: {item.quantity}
                      </p>
                      {item.decision.note && (
                        <p className="text-[10px] text-text-secondary mt-1 italic">
                          &ldquo;{item.decision.note}&rdquo;
                        </p>
                      )}
                      <button
                        onClick={() => undoDecision(item.id)}
                        className="flex items-center gap-1 mt-1.5 text-[10px] text-text-muted hover:text-text-secondary cursor-pointer border-none bg-transparent"
                      >
                        <Undo2 className="w-2.5 h-2.5" />
                        Undo
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="p-4 border-t border-border">
              <button
                onClick={handleSubmit}
                disabled={!allReviewed || submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg border-none cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delay Reason Modal */}
      {delayingItem && (
        <DelayModal
          itemName={delayingItem.item_name}
          onConfirm={confirmDelay}
          onCancel={() => setDelayingItem(null)}
        />
      )}
    </div>
  );
}

/* ─── Past PO Modal (manufacturer, view-only review summary) ─── */
function POPastModal({
  order,
  onClose,
  reviewDecisions,
}: {
  order: PurchaseOrderCardData;
  onClose: () => void;
  reviewDecisions: Map<string, StoredReviewDecision>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-bg-card border border-border rounded-xl w-full max-w-lg shadow-xl max-h-[85vh] flex flex-col overflow-hidden">
        <POSummaryHeader order={order} onClose={onClose} />

        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-3">
            Review Summary ({order.items.length})
          </p>

          <div className="space-y-2">
            {order.items.map((item) => {
              const decision = reviewDecisions.get(item.id);
              const lineTotal =
                item.price_per_unit != null
                  ? item.quantity * item.price_per_unit
                  : null;

              return (
                <div
                  key={item.id}
                  className="bg-bg-secondary rounded-lg px-4 py-3"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-medium text-text-primary truncate flex-1 mr-2">
                      {item.item_name}
                    </p>
                    {decision && (
                      <span
                        className={`shrink-0 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-full ${
                          DECISION_STYLES[decision.status] ?? "bg-bg-secondary text-text-muted"
                        }`}
                      >
                        {decision.status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">
                    Qty: {item.quantity}
                    {item.price_per_unit != null &&
                      ` · $${item.price_per_unit.toFixed(2)}/unit`}
                    {lineTotal != null &&
                      ` · Total: $${lineTotal.toFixed(2)}`}
                  </p>
                  {decision?.note && (
                    <p className="text-xs text-text-secondary mt-1 italic">
                      &ldquo;{decision.note}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Simple Detail Modal (brand side, no actions) ─── */
function PODetailModal({
  order,
  onClose,
}: {
  order: PurchaseOrderCardData;
  onClose: () => void;
}) {
  const totalCost = computeTotal(order);

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
          <div className="flex items-center justify-between">
            <span
              className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${STATUS_STYLES[order.status] ?? ""}`}
            >
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
            <span className="text-xs text-text-muted">
              {new Date(order.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {order.brand_name && (
              <div>
                <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">
                  Brand
                </p>
                <p className="text-sm text-text-primary">{order.brand_name}</p>
              </div>
            )}
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">
                Destination
              </p>
              <p className="text-sm text-text-primary">
                {order.place_of_delivery ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">
                Market
              </p>
              <p className="text-sm text-text-primary">
                {order.market ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">
                Ready By
              </p>
              <p className="text-sm text-text-primary">
                {order.ready_by_date ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">
                Total Cost
              </p>
              <p className="text-sm font-semibold text-text-primary">
                {totalCost > 0 ? `$${totalCost.toFixed(2)}` : "—"}
              </p>
            </div>
          </div>

          {order.note && (
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">
                Note
              </p>
              <p className="text-sm text-text-secondary">{order.note}</p>
            </div>
          )}

          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-2">
              Items ({order.items.length})
            </p>
            <div className="space-y-2">
              {order.items.map((item) => {
                const lineTotal =
                  item.price_per_unit != null
                    ? item.quantity * item.price_per_unit
                    : null;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-bg-secondary rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {item.item_name}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    {lineTotal != null && (
                      <p className="text-sm font-medium text-text-primary">
                        ${lineTotal.toFixed(2)}
                      </p>
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

/* ─── Single PO Card ─── */
function POCard({
  order,
  isPast,
  onOpen,
}: {
  order: PurchaseOrderCardData;
  isPast: boolean;
  onOpen: () => void;
}) {
  const totalCost = computeTotal(order);

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-mono font-medium text-text-primary">
            PO #{order.id.slice(0, 8).toUpperCase()}
          </p>
          {order.brand_name && (
            <p className="text-xs text-text-secondary mt-0.5">
              {order.brand_name}
            </p>
          )}
          <span
            className={`inline-block mt-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${STATUS_STYLES[order.status] ?? ""}`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
        <button
          onClick={onOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4F46E5] bg-[#EEF2FF] rounded-lg border-none cursor-pointer hover:bg-[#E0E7FF] transition-colors"
        >
          {isPast ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              View
            </>
          ) : (
            <>
              <ExternalLink className="w-3.5 h-3.5" />
              Open
            </>
          )}
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
}

/* ─── Open POs = pending, Past POs = everything else ─── */
const OPEN_STATUSES = new Set(["pending"]);

function isPastPO(status: string) {
  return !OPEN_STATUSES.has(status);
}

/* ─── Main Export: Cards Grid with Open/Past sections ─── */
export function PurchaseOrderCardsView({
  orders,
  enableActions = false,
  statusReportItemIdsArray = [],
  reviewDecisionsMap = {},
}: {
  orders: PurchaseOrderCardData[];
  enableActions?: boolean;
  statusReportItemIdsArray?: string[];
  /** For past POs: keyed by purchase_order_item_id → { status, note } */
  reviewDecisionsMap?: Record<string, StoredReviewDecision>;
}) {
  const router = useRouter();
  const [viewOrder, setViewOrder] = useState<PurchaseOrderCardData | null>(null);
  const [viewMode, setViewMode] = useState<"review" | "past" | "detail">("detail");

  function handleOpenOrder(order: PurchaseOrderCardData) {
    setViewOrder(order);
    if (!enableActions) {
      setViewMode("detail");
    } else if (isPastPO(order.status)) {
      setViewMode("past");
    } else {
      setViewMode("review");
    }
  }

  // When enableActions (manufacturer side), split into Open / Past sections
  if (enableActions) {
    const openOrders = orders.filter((o) => !isPastPO(o.status));
    const pastOrders = orders.filter((o) => isPastPO(o.status));

    return (
      <>
        {/* Open POs */}
        <section className="mb-8">
          <h3 className="font-semibold text-lg text-text-primary mb-3">
            Open POs
          </h3>
          {openOrders.length === 0 ? (
            <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-text-muted text-sm">No open purchase orders.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
              {openOrders.map((order) => (
                <POCard
                  key={order.id}
                  order={order}
                  isPast={false}
                  onOpen={() => handleOpenOrder(order)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Past POs */}
        <section>
          <h3 className="font-semibold text-lg text-text-primary mb-3">
            Past POs
          </h3>
          {pastOrders.length === 0 ? (
            <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-text-muted text-sm">No past purchase orders.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
              {pastOrders.map((order) => (
                <POCard
                  key={order.id}
                  order={order}
                  isPast
                  onOpen={() => handleOpenOrder(order)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Modals */}
        {viewOrder && viewMode === "review" && (
          <POReviewModal
            order={viewOrder}
            onClose={() => setViewOrder(null)}
            onActionComplete={() => router.refresh()}
          />
        )}
        {viewOrder && viewMode === "past" && (
          <POPastModal
            order={viewOrder}
            onClose={() => setViewOrder(null)}
            reviewDecisions={
              new Map(
                Object.entries(reviewDecisionsMap).filter(([itemId]) =>
                  viewOrder.items.some((i) => i.id === itemId)
                )
              )
            }
          />
        )}
      </>
    );
  }

  // Brand side: simple flat list with detail modal
  if (orders.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-text-muted text-sm">No purchase orders yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        {orders.map((order) => {
          const totalCost = computeTotal(order);
          return (
            <div
              key={order.id}
              className="bg-bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-mono font-medium text-text-primary">
                    PO #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  {order.brand_name && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      {order.brand_name}
                    </p>
                  )}
                  <span
                    className={`inline-block mt-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${STATUS_STYLES[order.status] ?? ""}`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setViewOrder(order);
                    setViewMode("detail");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4F46E5] bg-[#EEF2FF] rounded-lg border-none cursor-pointer hover:bg-[#E0E7FF] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Package className="w-3.5 h-3.5 text-text-muted" />
                  {order.items.length} SKU
                  {order.items.length !== 1 ? "s" : ""}
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

      {viewOrder && viewMode === "detail" && (
        <PODetailModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
        />
      )}
    </>
  );
}
