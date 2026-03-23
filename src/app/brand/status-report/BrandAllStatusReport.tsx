"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

type StatusReportRow = {
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
  shippingSentAt: string | null;
  isCompleted: boolean;
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

const BRAND_SR_TABS = ["All", "Accepted", "Delays", "Rejected", "Ready to Ship", "Completed"] as const;

export function BrandAllStatusReport({
  items,
}: {
  items: StatusReportRow[];
}) {
  const [activeTab, setActiveTab] = useState<(typeof BRAND_SR_TABS)[number]>("All");
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  function toggleSort() {
    setSortDir((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  }

  // Filter by tab
  const filtered = items.filter((i) => {
    if (activeTab === "All") return true;
    if (activeTab === "Accepted") return i.status === "accepted" && !i.shippingSentAt && !i.isCompleted;
    if (activeTab === "Delays") return i.status === "delayed";
    if (activeTab === "Rejected") return i.status === "rejected";
    if (activeTab === "Ready to Ship") return !!i.shippingSentAt && !i.isCompleted;
    if (activeTab === "Completed") return i.isCompleted;
    return true;
  });

  // Sort by manufacturer name
  const sorted = sortDir
    ? [...filtered].sort((a, b) => {
        const cmp = a.manufacturerName.localeCompare(b.manufacturerName);
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  const thClass = "text-left px-5 py-3 text-[11px] uppercase tracking-wider text-text-muted font-medium";

  // Derive display status
  function getDisplayStatus(item: StatusReportRow) {
    if (item.isCompleted) return { label: "Completed", style: "bg-accent-sage/10 text-accent-sage" };
    if (item.shippingSentAt) return { label: "Ready", style: "bg-accent-rose/10 text-accent-rose" };
    return {
      label: STATUS_LABELS[item.status] ?? item.status,
      style: STATUS_STYLES[item.status] ?? "",
    };
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {BRAND_SR_TABS.map((tab) => (
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

      {/* Sort */}
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

      {sorted.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">No items.</p>
        </div>
      ) : (
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
              {sorted.map((item) => {
                const display = getDisplayStatus(item);
                return (
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
                      <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${display.style}`}>
                        {display.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
