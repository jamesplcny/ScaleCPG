"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { placeClientOrderAction } from "./actions";

interface AssignedSku {
  productId: string;
  productName: string;
}

interface PlaceOrderButtonProps {
  clientId: string;
  clientName: string;
  manufacturerId: string;
  assignedSkus: AssignedSku[];
}

export function PlaceOrderButton({
  clientId,
  clientName,
  manufacturerId,
  assignedSkus,
}: PlaceOrderButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [productName, setProductName] = useState(
    assignedSkus[0]?.productName ?? ""
  );
  const [quantity, setQuantity] = useState(1);
  const [shipmentType, setShipmentType] = useState("UPS");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await placeClientOrderAction({
        clientId,
        clientName,
        manufacturerId,
        productName,
        quantity,
        shipmentType,
      });
      setOpen(false);
      setQuantity(1);
      setShipmentType("UPS");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={assignedSkus.length === 0}
        className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium rounded-lg border-none cursor-pointer transition-all font-sans disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Place Order
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Place Order">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-accent-teal bg-accent-teal/10 border border-accent-teal/20 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
              SKU
            </label>
            <select
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary font-sans outline-none transition-colors focus:border-accent-rose appearance-none"
            >
              {assignedSkus.map((sku) => (
                <option key={sku.productId} value={sku.productName}>
                  {sku.productName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
              min={1}
              className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary font-sans outline-none transition-colors focus:border-accent-rose"
            />
          </div>

          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
              Shipment Type
            </label>
            <select
              value={shipmentType}
              onChange={(e) => setShipmentType(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary font-sans outline-none transition-colors focus:border-accent-rose appearance-none"
            >
              <option value="UPS">UPS</option>
              <option value="LTL">LTL</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] border-none rounded-lg text-sm font-medium text-white cursor-pointer transition-all font-sans disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Placing order..." : "Submit Order"}
          </button>
        </form>
      </Modal>
    </>
  );
}
