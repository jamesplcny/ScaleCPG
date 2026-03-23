"use client";

type StatusReportRow = {
  id: string;
  poId: string;
  itemName: string;
  quantity: number;
  lineTotal: number | null;
  pricePerUnit: number | null;
  destination: string | null;
  market: string | null;
  requestedDate: string | null;
};

export function BrandMfgStatusReportClient({
  items,
}: {
  items: StatusReportRow[];
}) {
  const thClass = "text-left px-5 py-3 text-[11px] uppercase tracking-wider text-text-muted font-medium";

  if (items.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-text-muted text-sm">No items awaiting shipping details.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className={thClass}>Item</th>
            <th className={thClass}>Qty</th>
            <th className={thClass}>Destination</th>
            <th className={thClass}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border last:border-0 align-top">
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
