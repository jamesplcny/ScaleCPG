"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

type CurrentProduct = {
  id: string;
  manufacturer_id: string;
  manufacturer_name: string;
  item_name: string;
  ingredient_list: string;
  packaging: string;
  accessories: string | null;
  price_per_unit: number | null;
  status: string;
};

interface CurrentProductsListProps {
  products: CurrentProduct[];
}

export function CurrentProductsList({ products }: CurrentProductsListProps) {
  const [viewTarget, setViewTarget] = useState<CurrentProduct | null>(null);

  if (products.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
        <p className="text-text-muted text-sm">No current products yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        {products.map((product, i) => (
          <div
            key={product.id}
            className="bg-bg-card border border-border rounded-xl p-5 opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${0.03 + i * 0.04}s` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-0.5">
                  {product.manufacturer_name}
                </p>
                <h4 className="font-semibold text-base text-text-primary">{product.item_name}</h4>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-accent-sage/10 text-accent-sage">
                active
              </span>
            </div>

            {/* Details */}
            <div className="flex items-center gap-5 text-[13px] mt-2 mb-3">
              <div>
                <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-0.5">Packaging</span>
                <span className="text-text-secondary text-[12px]">{product.packaging || "—"}</span>
              </div>
              {product.accessories && (
                <div>
                  <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-0.5">Accessories</span>
                  <span className="text-text-secondary text-[12px]">{product.accessories}</span>
                </div>
              )}
              <div>
                <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-0.5">Price/Unit</span>
                <span className="text-text-primary font-medium text-[12px]">
                  {product.price_per_unit != null ? `$${Number(product.price_per_unit).toFixed(2)}` : "—"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setViewTarget(product)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary text-text-secondary text-[12px] font-medium rounded-lg cursor-pointer transition-all hover:bg-border"
              >
                <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                View Components
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Components Modal */}
      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Product Components" maxWidth="max-w-md">
        {viewTarget && (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Item Name</label>
                <p className="text-sm text-text-primary font-medium">{viewTarget.item_name}</p>
              </div>

              <div>
                <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Ingredient List</label>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{viewTarget.ingredient_list || "—"}</p>
              </div>

              <div>
                <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Packaging</label>
                <p className="text-sm text-text-secondary">{viewTarget.packaging || "—"}</p>
              </div>

              {viewTarget.accessories && (
                <div>
                  <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Accessories</label>
                  <p className="text-sm text-text-secondary">{viewTarget.accessories}</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setViewTarget(null)}
                className="w-full py-2.5 rounded-lg bg-bg-secondary text-text-secondary text-sm font-medium cursor-pointer transition-all hover:bg-border"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
