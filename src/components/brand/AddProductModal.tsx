"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { addBrandProduct } from "@/app/brand/dashboard/actions";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddProductModal({ open, onClose }: Props) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const inputClass =
    "w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted font-sans outline-none transition-colors focus:border-accent-rose";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addBrandProduct(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Product">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-accent-teal bg-accent-teal/10 border border-accent-teal/20 rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}
        <div>
          <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
            Product Name *
          </label>
          <input name="name" required className={inputClass} placeholder="e.g. Vitamin C Serum" />
        </div>
        <div>
          <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
            SKU
          </label>
          <input name="sku" className={inputClass} placeholder="e.g. VCS-001" />
        </div>
        <div>
          <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Any additional details..."
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] border-none rounded-lg text-sm font-medium text-white cursor-pointer transition-all font-sans disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? "Adding..." : "Add Product"}
        </button>
      </form>
    </Modal>
  );
}
